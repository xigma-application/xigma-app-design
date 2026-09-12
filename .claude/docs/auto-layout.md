# Auto-layout — engine, sizing, settings, drag-reorder, guides, rotation

Figma-style auto-layout for `TFrameNode`s with `layoutMode: horizontal | vertical`. This file maps
the whole subsystem end-to-end: the committed layout engine and its sizing/padding/gap pipeline, the
per-frame settings popover, the `legacy`/`updated` engine split, the live drag-reorder preview, the
drag-snap-guide suppression that runs alongside it, and the one cross-cutting gotcha (rotated
children) that bit several of these at once.

Since this doc's first revision the flat `src/store/design/utils/autoLayout/*.ts` has been split by
the one-function-per-file reorganizer into sub-folders (`syncAutoLayoutChildren/`,
`computeAutoLayoutPositions/` + `computeAutoLayoutWrappedPositions/`, `getAutoLayoutChildPositions/`,
`getAutoLayoutWrappedChildPositions/`, `getAutoLayoutDropTarget/`, `getAutoLayoutWrappedDropTarget/`,
`getAutoLayoutGapHandles/`, `getAutoLayoutReadingOrderSlot/`). Paths below are current.

## 1. Data model

### `TFrameNode` fields (`src/types/design/types.ts`)

Everything auto-layout-driving is optional. Flow: `layoutMode` (`freeForm | grid | horizontal |
vertical` — only the last two are managed here), `layoutWrap`, `layoutAlignment` (`AlignmentLayout`,
9 values, default `topLeft`), `layoutVersion` (`legacy | updated`, default `updated`). Sizing:
`widthSizingMode` / `heightSizingMode` (`SizingMode: fixed | hug | fill`) and `minWidth` / `maxWidth`
/ `minHeight` / `maxHeight` — these four plus the two sizing modes live on `TBaseNode`, so every node
type carries them, but they only mean anything for a frame that is itself auto-layout (hug) or a
child of one (fill). Gap: `horizontalGap` / `verticalGap` (numbers) with `horizontalGapMode` /
`verticalGapMode` (`GapMode: fixed | auto`). Spacing when gap is auto: `autoSpacing` (`between |
around | evenly`, default `between`). Padding: `paddingTop/Right/Bottom/Left`. Extras exposed through
the settings popover: `canvasStacking` (`firstOnTop | lastOnTop`, default `lastOnTop`),
`alignTextBaseline` (`off | on`), `insideStroke` (`included | excluded`, default `included` — shown
in the popover under **both** layout versions, labeled "Strokes" for legacy and "Inside stroke" for
updated), `strokeAlign` (`center | inside | outside`, default `center` — under `updated`, only a
`strokeAlign === inside` stroke is even eligible to affect layout; `insideStroke` then decides
whether that eligible stroke actually counts). `TBaseNode.ignoreAutoLayout` opts a single child out
entirely.

Enums: `src/types/design/enums.ts`.

### `TAutoLayoutChildSize` (`.../getAutoLayoutChildPositions/getAutoLayoutChildPositions.ts`)

The pure-geometry struct every engine function below `computeAutoLayoutPositions` operates on. It has
grown well past `{id, width, height}`:

```ts
type TAutoLayoutChildSize = {
  id: string;
  width: number; height: number;
  widthSizingMode?: SizingMode; heightSizingMode?: SizingMode;
  minWidth?: number; maxWidth?: number; minHeight?: number; maxHeight?: number;
  strokeAlign?: StrokeAlign; strokeWidth?: number;   // §6, §7 — fill distribution
  fontSize?: number;                                  // baseline align only
};
```

`getAutoLayoutSyncChildren.ts` builds one per child: `width`/`height` from `getRotatedNodeBounds`
(§8), the rest copied straight off the node (`isBoxSceneNode(child) && 'strokeAlign' in child ?
child.strokeAlign : undefined`, etc.; `fontSize` only for `NodeType.text`).

## 2. The committed layout engine — `src/store/design/utils/autoLayout/`

`syncAutoLayoutChildren(state, frameId)` is the single entry point that repositions children and,
on a hug axis, resizes the frame. It reads the live `state.nodes[frameId]` and **mutates it and the
children in place** (this is a reducer-internal helper). Only runs when `frame.type === frame` and
`layoutMode` is horizontal/vertical.

Called from `handleUpdateNode.ts` (**every** `updateNode` — both `node.id` and `node.parentId`, so
any child property change, `rotation`/`width`/`height` included, reflows), `handleMoveNodes.ts`
(add/reorder/reparent — source and target parent), `pruneParentGroup.ts`, and the mask/ungroup
reducers (`handleUseNodesAsMask`, `handleRemoveNodeMask`, `releaseGroup`). It also **recurses into
itself** from `applyAutoLayoutSyncChildPosition` for any nested auto-layout frame child (§3).

```
syncAutoLayoutChildren(state, frameId)
  → { bounds, children, sizes } = getAutoLayoutSyncChildren(frame, nodes)
        bounds  = children.map(getRotatedNodeBounds)         // §8 — NOT the raw box
        sizes   = TAutoLayoutChildSize[]  (§1)
  → positions = getAutoLayoutSyncPositions(frame, layoutMode, sizes)
        derives itemSpacing / counterAxisSpacing / gap-auto flags from horizontal|verticalGap(+Mode),
        alignment = frame.layoutAlignment ?? topLeft,
        alignTextBaseline = isHorizontal && frame.alignTextBaseline === on,
        autoSpacing = frame.autoSpacing ?? between,
        layoutVersion = frame.layoutVersion ?? updated,
        padding = getFrameLayoutPadding(frame, layoutVersion)      // §4
    → computeAutoLayoutPositions(frame, …, sizes, …, layoutVersion)
        clampAutoLayoutFrameToPadding(frame, …)                    // §6 diff #1 — mutates frame
        isAutoLayoutWrapEnabled(frame, …) ?
            computeAutoLayoutWrappedPositions(…)   // §5
          : computeAutoLayoutSingleLinePositions(…)
              applyAutoLayoutHugSize(frame, …)     // §3 — mutates frame
              getAutoLayoutContentBox(frame, padding)
              getFillableAutoLayoutSizes → getAutoLayoutFillSizes(…, layoutVersion)   // §3
              getAutoLayoutChildPositions(layoutMode, itemSpacing, alignment, contentBox, filled, …)
                  getAutoLayoutPrimaryLayout → getAutoLayoutPrimarySpacing / getDistributedGap
                  per child: getAutoLayoutChildPosition  (counter offset: baseline or getAxisOffset)
  → children.forEach(applyAutoLayoutSyncChildPosition(state, …, child, bounds[i], positions[i]))
```

**Rule that still holds:** every function below `computeAutoLayoutPositions` takes
`TAutoLayoutChildSize[]`, never a scene node — pure geometry, agnostic to node type and rotation.
All rotation/type-specific measurement happens once, at the top, in `getAutoLayoutSyncChildren`'s
`getRotatedNodeBounds` call.

`getAutoLayoutChildPositions.ts` is the plain (no-wrap) packer: `getAutoLayoutPrimaryLayout` returns
`{ effectiveGap, offset }` for the primary axis, then it walks children accumulating `offset += size
+ effectiveGap` and places each on the counter axis (baseline align, or `getAxisOffset(counterAlign,
counterSize, childSize)`). `getAxisOffset`: `center → (container-content)/2`, `end → container-content`,
`start → 0`. `getAlignmentComponents` decomposes the 9-value `AlignmentLayout` into `{x, y:
'start'|'center'|'end'}`; the primary-axis component is moot when the gap is auto (the block
saturates the axis).

### `getAutoLayoutPrimaryLayout` / `getAutoLayoutPrimarySpacing` / `getDistributedGap`

`getAutoLayoutPrimaryLayout(primarySize, childrenPrimarySize, count, isPrimaryGapAuto, itemSpacing,
autoSpacing, primaryAlign, layoutVersion)`:

- Fixed gap: `{ effectiveGap: itemSpacing, offset: getAxisOffset(primaryAlign, …) }`.
- Auto gap: `getAutoLayoutPrimarySpacing(availableSpace, itemsTotalSize, count, autoSpacing,
  layoutVersion)` → `{ edgeOffset, gap }`, offset = `edgeOffset`.
  - `between` (and default): `edgeOffset 0`, `gap = getDistributedGap(avail, items, count)` =
    `(avail - items) / (count - 1)`.
  - `around`: `unit = leftover / count`; `edgeOffset unit/2`, `gap unit`.
  - `evenly`: `unit = leftover / (count + 1)`; `edgeOffset unit`, `gap unit`.
- `isLegacyLoneBetween` (`layoutVersion === legacy && isPrimaryGapAuto && autoSpacing === between &&
  count === 1`): override the offset to `getAxisOffset('center', …)` — §6 diff #6.

`getDistributedGap(availableSpace, itemsTotalSize, itemCount, clampToZero = true)`: `count <= 1 → 0`;
else the raw quotient, `Math.max(0, …)` unless `clampToZero` is false. `getAutoLayoutPrimarySpacing`
passes `clampToZero = layoutVersion !== legacy` and floors the `around`/`evenly` leftovers the same
way — §6 diff #5.

## 3. Sizing — Hug / Fixed / Fill, Min/Max

Per axis, a frame hugs its contents / stays fixed / fills its parent; a child does the same. Both are
`widthSizingMode` / `heightSizingMode`. `clampAutoLayoutSize(value, min, max)` is the shared clamp
(if both bounds set, `max` is raised to `min` first).

**Hug** (`applyAutoLayoutHugSize` for single line; `applyAutoLayoutWrapPrimaryHugSize` /
`applyAutoLayoutWrapCounterHugSize` for wrap): `getAutoLayoutHugSize` sums child primary sizes +
gaps, takes the max child counter size (or `getAutoLayoutBaselineExtent(children).thickness` when
`alignTextBaseline`), adds padding. The frame's primary/counter dimension is then set to
`clampAutoLayoutSize(hug, frame.minWidth/Height, frame.maxWidth/Height)` — except the wrap
**counter** hug, which is not min/max-clamped.

**Fill** (`getFillableAutoLayoutSizes` → `getAutoLayoutFillSizes` → `resolveAutoLayoutFillPrimarySizes`):

- `getFillableAutoLayoutSizes` first nulls a child's sizing mode on any axis where the **frame** is
  hug — a hugging parent has no leftover to give.
- `getAutoLayoutFillSizes` computes `leftover = max(availablePrimary - totalGaps - fixedPrimarySum -
  totalStrokeInset, 0)` where `strokeInset` per fill child = `getAutoLayoutChildStrokeInset(child,
  layoutVersion)` (§6 diff #4: `updated` reserves `strokeWidth` for an `inside`-aligned child stroke,
  `legacy` and center/outside reserve nothing). It resolves **content** shares from that leftover with
  stroke-inset-adjusted `min`/`max`, then each fill child's box = `resolvedContentShare + its own
  inset`. Counter-axis fill → `clampAutoLayoutSize(availableCounter, counterMin, counterMax)`.
- `resolveAutoLayoutFillPrimarySizes` is the CSS-flexbox-style "resolve flexible lengths" loop: split
  equally, freeze any candidate that violates its `min`/`max`, redistribute the remainder to the
  still-unfrozen candidates, repeat.

`applyAutoLayoutSyncChildPosition` writes the resolved `width`/`height` back onto the child
node — but only when `child.rotation === frame.rotation` (no well-defined "grown" local box
otherwise); then translates the child's whole subtree by the position delta, and recurses
`syncAutoLayoutChildren` if the child is itself an auto-layout frame.

RightPanel controls: `PanelProperties/Common/ColumnDimensions/` (W/H + the Fixed/Hug/Fill menu;
shared with the Rectangle panel, so its hooks accept any box scene node, not only frames),
`LayoutSection/ColumnMinMaxDimensions/` (min/max fields; `useColumnMinMaxDimensions.ts` clamps on
commit, `<= 0` clears the bound), `ColumnFlow/` (flow + wrap), `ColumnClipContent/`.

## 4. Padding & gap

**Math.** `getFramePadding` = the raw `frame.padding* ?? 0` on each side. `getFrameLayoutPadding(frame,
layoutVersion)` optionally adds `frame.strokeWidth` to all four sides when the frame stroke affects
layout:

```ts
strokeAffectsLayout = layoutVersion === legacy
  ? (frame.insideStroke ?? included) === included                                    // legacy: the toggle alone decides
  : (frame.strokeAlign ?? center) === inside && (frame.insideStroke ?? included) === included; // updated: inside-aligned AND the toggle included
```

`getAutoLayoutContentBox(frame, padding)` → `{ x: frame.x + paddingLeft, y: frame.y + paddingTop,
width: max(frame.width - L - R, 0), height: max(frame.height - T - B, 0) }` — the box the packer
fills.

**Canvas padding handles.** Geometry `src/utils/canvas/autoLayoutPadding/` (`getAutoLayoutPaddingHandles`
+ band/inset/centre helpers, `isAutoLayoutPaddingHandleHit`). Hit test
`getAutoLayoutPaddingHandleAtPoint`. Draw `drawScene/drawAutoLayoutPaddingHandles/` (bar + drag
label). Arm/continue/disarm under the pointer-handler folders
(`armAutoLayoutPaddingOnPointerDown` → `armAutoLayoutPaddingDrag`,
`continueAutoLayoutPaddingDrag`, `disarmAutoLayoutPaddingDrag`). Hover ref
`refs.hover.hoveredAutoLayoutPaddingRef`.

**Padding value popup** (click a handle to type a value): `src/components/Design/Canvas/AutoLayoutPaddingEditOverlay/`
(overlay + `AutoLayoutPaddingValueInput` wrapping `CanvasValueLabelInput` + `useAutoLayoutPaddingEditor`).
Store state `state.design.editingAutoLayoutPadding` (+ `handleStopAutoLayoutPaddingEdit`), ref
`refs.transform.autoLayoutPaddingEditRef`. Gaps have **no** type-in popup — only the drag label;
numeric gap entry is the RightPanel `GapField`.

**RightPanel-hover guide lines.** Hovering a `ColumnPadding` field draws that side's guide line(s) on
the canvas, no mouse activity on the canvas needed. `buildPaddingHoverHandlers` writes
`refs.hover.rightPanelPaddingGuideRef = { frameId, sides } | null`; `drawAutoLayoutPaddingHandles`
reads it each frame. There is no gap equivalent.

**Gap handles.** Geometry `src/store/design/utils/autoLayout/getAutoLayoutGapHandles/`
(`getAutoLayoutGapHandles` returns `{horizontal, vertical}`; empties an axis in `GapMode.auto` or
with `< 2` children; `getAutoLayoutEffectiveGaps` reads the **live** gap off already-synced sibling
bounds so switching auto→fixed commits whatever the distributed gap actually was). Hit test
`getAutoLayoutGapHandleAtPoint`. Draw `drawScene/drawAutoLayoutGapHandles/` (bar + label + hatch
fill, styled after Smart Selection and the vector-paint hatch preview; gated on the frame being
selected and the gap area hovered or dragged). Arm/continue/disarm as for padding;
`continueAutoLayoutGapDrag` dispatches `updateNode({ changes: { horizontalGap | verticalGap } })`,
snapping to 10 with Shift via `getAutoLayoutHandleSnappedValue`. Gap is allowed to go negative
(children overlap). `GapField`'s Auto mode holds the literal string `"Auto"` as the input value
(`type` swaps to text); typing a number or scrubbing commits it and reverts the mode to fixed in one
dispatch.

## 5. Wrap

`isAutoLayoutWrapEnabled(frame, isHorizontal, widthMode, heightMode)` = `layoutWrap && (primaryMode
!== hug || primaryMax !== undefined)` — a hug primary axis can still wrap if it has a max.

`computeAutoLayoutWrappedPositions` → `getAutoLayoutWrapSizingModes` → `getAutoLayoutWrapAvailablePrimarySpace`
(hug + max → `primaryMax - primaryPadding`, else the content box) → `buildAutoLayoutWrapLines`
(`groupAutoLayoutChildrenIntoLines` packs children into lines that fit `availablePrimary`, then a
`switch` per axis applies `applyAutoLayoutWrapPrimaryHugSize` / `applyAutoLayoutWrapCounterHugSize`)
→ `getAutoLayoutWrapFilledLines` (`getAutoLayoutContentBox` + per-line `getAutoLayoutFilledLines`,
which runs the §3 fill pipeline scoped to each line's own leftover) → `getAutoLayoutWrappedChildPositions`.

`getAutoLayoutWrappedChildPositions` mirrors the single-line packer one level up:
`getAutoLayoutWrappedCounterLayout` computes each line's thickness and the between-line gap
(`counterAxisSpacing`, or `getDistributedGap` when the counter gap mode is auto, falling back to
`itemSpacing` if unset), then per line `getAutoLayoutWrappedLinePositions` places children along the
primary axis (`getLinePrimarySpacing` — the same auto/fixed split as §2) and aligns each **within its
own line's thickness** on the counter axis (baseline or `getAxisOffset`).

## 6. `legacy` vs `updated` (`layoutVersion`)

Figma split its auto-layout engine into `legacy` and `updated` behaviour on 2026-07-24; new frames
default to `updated`, existing ones stayed `legacy`. This app matches that per-frame via
`frame.layoutVersion`. The value is threaded through the whole pipeline but branched on in exactly
**five** places, covering the six documented behaviour differences:

| # | Difference | Where | `updated` | `legacy` |
|---|---|---|---|---|
| 1 | Frame never narrower than its padding | `clampAutoLayoutFrameToPadding.ts` | floor a non-hug axis at `paddingStart + paddingEnd` | never clamps |
| 5 | Auto gap never overlaps | `getAutoLayoutPrimarySpacing.ts` (`clampToZero = layoutVersion !== legacy`) → `getDistributedGap` | distributed gap / around / evenly leftovers floored at 0 | may go negative, children overlap |
| 6 | Lone child in a "between" auto stack | `getAutoLayoutPrimaryLayout.ts` (`isLegacyLoneBetween`) | start-aligned (`edgeOffset: 0`) | centred |
| 2, 3 | Only an inside-aligned stroke is even eligible to affect layout | `getFrameLayoutPadding.ts` | eligible only when `strokeAlign === inside`, then the `insideStroke` toggle still decides | eligible unconditionally, the `insideStroke` toggle alone decides |
| 4 | Fill children split by content area | `getAutoLayoutChildStrokeInset.ts` → `getAutoLayoutFillSizes.ts` | reserve each fill child's inside-stroke width so **content areas** end up equal | split total width evenly, ignore child strokes |

Everything else just threads `layoutVersion` through; the default is `updated` at every level.

**`strokeAlign` reads under `src/store/design/utils/autoLayout`:** `getFrameLayoutPadding` (diff
#2/#3), `getAutoLayoutChildStrokeInset` (diff #4), the `TAutoLayoutChildSize` field, and
`getAutoLayoutSyncChildren` populating it. Nothing else. `strokeAlign` also drives stroke **rendering**
and hit-testing outside this tree — see the enum's other consumers, not covered here.

## 7. The Auto layout settings popover

The gear button on the Alignment row (`AutoLayoutSettingsButton/`) opens
`PopoverAutoLayoutSettings/`. `usePopoverAutoLayoutSettings.ts` holds all state, reads the single
selected frame, and every row's commit util is the same one-liner: `dispatch(updateNode({ changes: {
<field>: value }, id: frameNode.id }))`.

| Row | Shown when | Field | Engine effect |
|---|---|---|---|
| Inside stroke / Strokes | always (labeled "Strokes" under legacy, "Inside stroke" under updated) | `insideStroke` | `included` adds the frame's stroke width to all four padding sides — unconditionally under legacy, only when `strokeAlign === inside` under updated (§6) |
| Canvas stacking | not grid | `canvasStacking` | `getFrameChildIdsInPaintOrder(frame)` = `firstOnTop ? [...childIds].reverse() : childIds`; used by `renderClippedFrame` / `renderFrameNode` / `getRenderOrderedNodes` |
| Align text baseline | horizontal only | `alignTextBaseline` | `getAutoLayoutSyncPositions` gates it to horizontal+`on`; then text children align by baseline (`counterOffset = maxBaseline - getAutoLayoutChildBaselineOffset(child)`, `getTextBaselineOffset(fontSize)` from the MSDF atlas metrics) and the frame's counter hug size uses `getAutoLayoutBaselineExtent` |
| Auto spacing | not grid; disabled unless the primary gap mode is auto | `autoSpacing` | `getAutoLayoutPrimarySpacing`: `between` / `around` / `evenly` (§2) |
| Layout version | always | `layoutVersion` | `legacy` vs `updated` (§6) |

The popover also renders a live mini preview (`PopoverAutoLayoutSettingsPreview/`) driven by hover
over each row. The Inside-stroke/Strokes row swaps preview graphics with the layout version too:
`PreviewInsideStroke` (two side-by-side tiles) for legacy, `PreviewInsideStrokeUpdated` (a single
tile) for updated — `getPreviewContent.ts` picks between them off the same `isLegacyLayout` flag
that picks the row's label. Per-child `ignoreAutoLayout` is a separate toggle (not in this popover).

## 8. Rotation — two "bounds" concepts, don't mix them up

There are **two same-purpose, differently-scoped** functions:

- **`src/components/Design/Canvas/utils/getRotatedNodeBounds.ts`** — excludes only `line` from
  rotation math (vectors get rotated-AABB treatment). Used by selection / snapping / hit-testing.
- **`src/store/design/utils/getRotatedNodeBounds.ts`** — excludes `line` **and** `vector` (vectors
  bake geometry into absolute vertex coords). This is the one every auto-layout file uses.

Both wrap `src/store/design/utils/getNodeAxisAlignedBounds.ts`, which — despite the name — does **not**
rotate; it's the plain local `{x, y, width, height}`. `getNodeWorldCorners` / `getNodesBoundingBox`
apply their own corner rotation afterward on purpose. **Do not "fix" `getNodeAxisAlignedBounds` to
rotate** — multiple callers depend on it staying raw.

**Why it matters here:** a child rotated to anything other than 0/90/180/270° has a rotated AABB
larger than and offset from its raw box; measuring by the raw box lets neighbours overlap it. The
rotated-corner math is exact for 0/90/180/270° too, so there's one code path for any angle.
`applyAutoLayoutSyncChildPosition` computes its delta in rotated-AABB space and applies a pure
translation to the whole subtree (correct regardless of the child's own rotation);
`getAutoLayoutRotatedSlotPosition` maps a slot to the rotated child's top-left.

## 9. Live drag-reorder preview — `useSelectionTool/.../handlePointerMove/continueDrag/`

Separate code path from §2 — this only *previews* (refs, not dispatched state) during a pointer drag;
the real reorder is committed by `commitDropIntoFrame.ts` → `handleMoveNodes` →
`syncAutoLayoutChildren` on drop.

`updateDragDropTarget/` clears the drop refs, then `resolveDragReparentTarget` →
`armAutoLayoutDropTarget/` (only when the hovered drop frame is auto-layout). That is now a
`switch (true)` over three preview modes, sharing one context object
(`getAutoLayoutDropTargetContext.ts`: siblings minus the dragged node(s) with real
`getRotatedNodeBounds`, the dragged node's original index among the remaining siblings, ordered
dragged sizes, the reorder block):

- `armAutoLayoutSingleLineDropTarget.ts` (default),
- `armAutoLayoutMultiRowReorderPreview/` (wrap, multi-node — member slots),
- `armAutoLayoutFloatingReorderPreview.ts` (suppressed / floating).

Landing index — pure engine math in `src/store/design/utils/autoLayout/getAutoLayoutDropTarget/`
(`getAutoLayoutDropTarget` → `getAutoLayoutDropInsertionIndex`), wrapped variant in
`getAutoLayoutWrappedDropTarget/`:

- **original index `null`** (reparent into a frame this node wasn't in): plain symmetric midpoint
  threshold — `cursor vs sibling.start + sibling.size / 2`.
- **original index given** (reorder within the same frame): **touch-edge, not midpoint**. A sibling
  originally *before* the dragged node is compared against its own **far** edge, one originally
  *after* against its **near** edge — so the swap fires the instant the cursor touches the next
  sibling, at the same single boundary both directions (confirmed with the user against a pixel
  example; no hysteresis band). A naive "cursor > midpoint" waits for 50% overlap and was provably
  wrong for a sibling after the dragged node's slot (History #1).

`getAutoLayoutChildPositions` (the real §2 packer) then runs on `[...siblings, synthetic __dragged__
placeholder]` at that index to produce the **simulated final layout** — the drop bar position and
`siblingPositions` (what each sibling animates to). `armAutoLayoutReorderPreview.ts` feeds
`siblingPositions` into `animateAutoLayoutReorder.ts`'s eased tween, stored on
`canvasRefs.transform.autoLayoutReorderPreviewRef`. `updateAutoLayoutReorderGhostPosition/` positions
the dragged node itself (one entry per selected node — multi-node) at `bounds + delta` in that same
ref; `drawScene/getAutoLayoutReorderRenderNode.ts` reads a node's effective ref-overridden render
position each frame. `isAutoLayoutDropTargetActive(canvasRefs)` (`src/utils/canvas/signals/`) —
`autoLayoutReorderPreviewRef.current !== null || autoLayoutDropTargetRef.current !== null` — is the
one shared "the auto-layout system is handling this drag" signal §10 reads.

## 10. Drag-snap-guide suppression during an auto-layout drag

While dragging into/within an auto-layout frame, its own reorder-preview/drop-indicator is the only
feedback that should show — the ordinary free-drag guides (alignment snap, chain-gap/equal-spacing,
matched-pair, shape-contact) are redundant clutter on top of it (user-reported: "mnóstwo linii się
pokazuje... trzeba je wyłączyć"). `continueDrag.ts` computes `isAutoLayoutDropTargetActive(canvasRefs)`
**after** `updateDragDropTarget` (refs already armed) and passes it into `armDragSnapGuides.ts`, which
nulls `alignmentGuideRef` / `equalSpacingGuidesRef` / `matchedPairGuidesRef` when true.
`resolveShapeContactGuides.ts` checks the same signal itself and clears `contactGuidesRef`.

## 11. Multi-node drag-reorder — three mechanisms had to agree

Dragging a **multi-node selection** to reorder it within its own auto-layout frame is three
independent fixes, each undoing a single-node-only or order-blind assumption:

1. **Ghost tracking.** `updateAutoLayoutReorderGhostPosition` writes a cursor-tracked position into
   `autoLayoutReorderPreviewRef.positions` for **every** selected node, not just when one is
   selected. Falling back to a real store dispatch while a preview is active is wrong for any count —
   `syncAutoLayoutChildren` fights and overwrites a real positional dispatch every tick.
2. **Pointerdown priority.** `armSmartSelectionSwapOnPointerDown` / `armSmartSelectionGapOnPointerDown`
   run before the general drag resolver and would claim a pointerdown on a 2-node same-size adjacent
   selection for Smart Selection's own `swapDragRef` / `gapDragRef`. Both now check
   `isNodeAutoLayoutChild(node, nodesById)` over `smartSelectionNodes` and skip entirely when true,
   falling through to the real drag resolver. `drawSmartSelectionHandles.ts` also skips drawing while
   `refs.transform.draggedNodeIdsRef.current !== null` (populated only by the plain move-drag path).
3. **Commit order.** `commitDropIntoFrame.ts` used to build `moveNodes`'s `nodeIds` from selection
   (click) order. For a same-parent multi-node reorder it's the block's *current* order in `childIds`
   that must survive — deriving `nodeIds` from the shared parent's `childIds` filtered to the selected
   ids fixes a bottom-then-top shift-click block silently swapping on commit.

None is optional — fixing only (1) still looks broken from (2); fixing (1)+(2) still mis-orders from
(3). Each needed its own e2e reproduction.

## 12. Reflowing an auto-layout ancestor when a nested group's box changes

`syncAutoLayoutChildren` measures a frame's **direct** children. When a child is a group/mask and
something *inside* it reshapes, `syncGroupBounds` ([[group-nodes]] §4) resyncs the group's box but
the auto-layout frame two levels up is not re-triggered.

`resyncGroupAutoLayoutAncestors(dispatch, nodeOriginIds)`
(`useSelectionTool/utils/handlePointerUp/`) walks `getGroupLikeParentIds` (the moved nodes' group-like
parents that are **not themselves** moved) and dispatches a no-op `updateNode({ changes: {}, id:
groupId })` per group, routing through `handleUpdateNode` → `syncGroupBounds` →
`syncAutoLayoutChildren` for every ancestor.

- **`isRigidGroupMove` guard** — skip when **every** child of the group is in the moved set (the
  group moving as one body, not an internal reshape).
- **Timing** — call it from inside the rAF-throttled dispatch callback, **after** the position
  dispatch lands, so `syncGroupBounds` sees the new positions before the ancestor reflow reads the
  group box.
- **Call sites** — live child-drag (`dispatchDraggedNodeUpdates`), Smart-Selection gap-drag,
  plain drag disarm, resize (`resyncResizedGroupAutoLayoutAncestors`, no rigid-move filter — a
  resize is always a reshape). Mask create/remove and full ungroup call `syncAutoLayoutChildren`
  directly in their reducers.

## 13. Grid layout (`LayoutMode.grid`)

Figma's third flow: children fall into a 2-D cell grid instead of a single row/column. **Phase 1
shipped the position engine only — no dedicated grid UI.** The `ColumnFlow` toggle's existing
(previously dead) "Grid" button now produces a real layout; everything else (track-size controls,
canvas track handles, drag-into-cell, manual cell placement, spanning UI) is later phases.

### Data model (`src/types/design/types.ts`)

- **`TFrameNode`:** `gridColumnCount?` (min 1; `useColumnFlow` seeds `2` on first switch to grid),
  `gridRowCount?` (absent → derived from the placed cells), `gridColumnSizes?` /
  `gridRowSizes?: TGridTrackSize[]`, `gridAutoPlacement?` (absent → `true`). The two gaps **reuse
  `horizontalGap` (columns) / `verticalGap` (rows)**; padding reuses `paddingTop/Right/Bottom/Left`;
  frame `widthSizingMode` / `heightSizingMode` still mean hug/fixed/fill.
- **`TGridTrackSize = { mode: SizingMode; value? }`** — `fixed` → `value` px, `fill` → `value` fr
  weight (default 1), `hug` → `value` unused. Missing / short arrays default every track to `1fr`.
- **`TBaseNode` (grid child):** `gridColumnAnchorIndex?` / `gridRowAnchorIndex?` (manual cell),
  `gridColumnSpan?` / `gridRowSpan?` (default 1), `gridChildHorizontalAlign?: AlignmentHorizontal`
  / `gridChildVerticalAlign?: AlignmentVertical` (per-cell alignment, default start). Deliberately
  **not** the existing `alignment` field (that one is constraints/position). `getAutoLayoutSyncChildren`
  copies these onto `TAutoLayoutChildSize` (box children only — line/vector default them).

### Engine (`src/store/design/utils/autoLayout/computeGridLayoutPositions/`)

`syncAutoLayoutChildren` widened its guard to `horizontal | vertical | grid`; for grid it calls
`getGridLayoutSyncPositions(frame, sizes)` (sibling of `getAutoLayoutSyncPositions`) instead of the
linear path — the shared `getAutoLayoutSyncChildren` → `applyAutoLayoutSyncChildPosition` loop and
`frameCenter` are unchanged, so **rotation is free** (the applier already orbits each slot about the
frame centre). `applyAutoLayoutSyncChildPosition` also recurses into a nested `grid` frame child.

`computeGridLayoutPositions(input)` pipeline:

1. `clampAutoLayoutFrameToPadding` (reused — diff #1, frame never narrower than its padding under
   `updated`).
2. `placeGridCells(sizes, columnCount, autoPlacement)` → `TGridCellPlacement[]`
   (`{ id, columnStart, rowStart, columnSpan, rowSpan }`). Auto: sweep `childIds` order into the
   next free region that fits (CSS-Grid sparse flow, span-aware). Manual (`autoPlacement === false`
   + both anchors set): honour the anchor (clamped into range), leave holes.
3. `derivedRowCount` = furthest occupied row; `rowCount = max(gridRowCount ?? derived, derived)`.
4. `resolveGridTrackSizes(tracks, available, gap, isFrameAxisHug, contentMaxPerTrack)` per axis —
   `fixed` → value, `hug` → max intrinsic size of the children spanning exactly that one track,
   `fill` → weighted share of `max(available − reserved − gaps, 0)`. When that axis's frame sizing
   is hug, `fill` collapses to the content max instead.
5. If `widthSizingMode === hug`, `frame.width = padL + padR + Σ columnSizes + (n−1)·columnGap`
   (clamped to min/max, mirrors `applyAutoLayoutHugSize`); same for height/rows.
6. `getGridTrackOffsets` → running world-space offsets from the content box origin; per placement,
   `getGridCellRect` (union of the spanned tracks — interior gaps are already baked into the
   offsets) then `getGridChildPosition`: a `fill` child stretches to the cell (clamped to
   min/max), otherwise it keeps its intrinsic size and offsets by
   `getAxisOffset(gridChild*Align ?? start, cellSize, childSize)`.

Returns `TAutoLayoutChildPosition[]` in `sizes` order — the exact shape the applier already
consumes.

### Panel — `LayoutSection/ColumnAlignmentLayout/GridArea/`

Ported faithfully from x-design's `shared/UITools/GridArea/` (structure + popup). When
`layoutMode === grid`, `ColumnAlignmentLayout` swaps `AlignmentArea` for `<GridArea>` and shows
**both** `GapField`s (column = `horizontalGap`, row = `verticalGap`; auto-gap mode disabled). The
widget is a 210px-wide popover (`var(--color-neutral-4)` ground) opened from a 56px preview tile
(`GridAreaPreview`, a `repeat(n, 1fr)` grid capped at 10×10 with a `"C × R"` caption). The popover
opens **anchored to the tile's own top-left corner**, overlaying the panel downward from there
(`side="bottom"`, `align="start"`, `sideOffset={-56}` = the tile height, and `avoidCollisions={false}`
so Radix never flips or shifts it off that corner — the prop is a new opt-out on `UITools.Popover`,
default `true`). The popover
holds `GridInputs` (two `GridInputCells` — `TextField` + `ScrubbableInput` 1–100, as shrinking
flex items so they fit the 210px), `CellsInput` (a 12×8 `data-value="col.row"` pick matrix of
`<button>`s, each `<Tooltip>`-wrapped so hover shows `"CxR"`), and a full-width **Open grid
settings** outline button — `onClick` runs `useColumnGridArea`'s `onOpenSettings`
(`openGridSettingsPanel`: forces `gridRowCount` explicit if it was Auto, then dispatches
`setGridSettingsPanelOpen(true)`) and closes the popover (§ "Panel — the dedicated Grid settings
panel"). `useColumnGridArea` is the single hook
(returned from `useColumnAlignmentLayout` as `gridArea` and passed whole into `<GridArea grid=…>`):
columns/rows come straight from the store, commit on blur via `clampGridCount` +
`commitGridColumnCountChange` / `commitGridRowCountChange` (no-op on empty / out-of-range),
`onClickCell` writes both at once. The **Rows** field has a chevron menu (`GridRowsModeMenu` in a
`UITools.ButtonMenu`) — **Auto** clears `gridRowCount` (`commitGridRowsAuto`), the fixed item pins
it to the current effective count; when Auto the field shows the effective count
(`getDerivedGridRowCount(frame, nodes)` = the engine's own `derivedRowCount` — runs
`placeGridCells` so a manually-anchored / row-spanning child in a far row still counts, not just
`ceil(childCount / columns)`) as the label "Auto". No per-track sizing UI (deferred).

A child of a grid frame also shows an editable **Column span / Row span** row
(`Common/ColumnGridChildSpan`, `useColumnGridChildSpan` gates on `parent.layoutMode === grid`).
Each field is a `TextFieldWrapper` + `ScrubbableInput` adornment (`min={1}`, `max` from
`getGridChildSpanBounds`). The `max` is **position-aware**, not just the track count: it runs
`placeGridCells` over the frame's children to find this child's own cell, builds an occupancy set
of *every other* child's placement (`getGridOccupancyExcludingNode`), then counts the contiguous
free run from the child's cell outward — right for columns, down for rows — stopping at the first
cell another child holds or at the grid's edge (`gridColumnCount`; `gridRowCount ??
getDerivedGridRowCount` for rows). So a child at column 2 of a 4-column grid with a neighbour on
column 3 gets `maxColumnSpan = 1`; growing a row span checks every cell across the child's *width*
on each candidate row (History #16). The scrubber clamps to `[1, max]` itself, so a drag just
stops there — no extra guard. **No `key` on `TextFieldWrapper`** (unlike `GridInputCells`): a key
that changes per keystroke/scrub-step remounts the adornment mid-drag and the scrub dies after one
step (History #16) — instead the pattern is `PaddingInput`'s: stable adornment, and a *typed*
value out of range is reverted imperatively in `onBlur` (`event.target.value = currentSpan`) when
`onCommitColumnSpan` / `onCommitRowSpan` returns `false`. `clampGridChildSpan(raw, max)` returns
`null` for anything non-integer, `< 1`, or `> max`; a valid value only dispatches
(`commitGridChildColumnSpanChange` / `…RowSpanChange` → `updateNode`) when it actually differs
from the current span, so a min===max scrub doesn't spam the store.

The **Padding** row (`ColumnPadding`) and a grid child's **Width/Height sizing dropdown**
(`ColumnDimensions`, gated by `canFillWidth`/`canFillHeight`) both include `LayoutMode.grid` in
their visibility gate, same as `horizontal`/`vertical` — Padding because the grid engine already
reads `getFrameLayoutPadding` (§13 engine notes above), Fill because a grid child stretching to
its cell is the same `widthSizingMode`/`heightSizingMode: fill` mechanism a drop into a cell
already sets (§ Canvas — drag a child into a cell), just settable from the panel too. The shared
`isManagedLayoutFrame` predicate (`utils/canvas/signals/`) is the single source of truth for "is
this frame's layout mode one of the three managed ones" — `useColumnPosition`,
`isNodeManagedLayoutChild` and `useColumnDimensions`'s `parentIsAutoLayout` all go through it.

### Panel — the dedicated Grid settings panel (`PanelProperties/GridSettings/`)

A **separate right-panel view** that replaces the normal frame properties, the way `FrameTool`
does for the Frame tool. `PanelProperties` renders `<GridSettings>` instead of `<Frame>` when a
single grid frame is selected **and** `state.design.isGridSettingsPanelOpen` is set (new optional
flag mirroring `isActionsPanelOpen`; `setGridSettingsPanelOpen` reducer +
`selectIsGridSettingsPanelOpen` selector — `Boolean(...)` so an unset fixture reads `false`). Only
entry point today is the GridArea popover's **Open grid settings** button; the panel's ✕
(`GridSettingsHeader`) clears the flag.

`GridSettings` = header + a `<GridTrackList axis>` for **Columns** and one for **Rows**. Each
`GridTrackList` is a `UITools.Section` (`onAdd` → the `+`) wrapping one `<GridTrackRow>` per
track, a 4-column CSS grid row: `GridTrackHandle` (the 1-based number, swapped for the
`RowGrabber` glyph on hover/drag via CSS) · `UITools.Dropdown variant="outline"` for the mode ·
a numeric `UITools.TextField` for the value · a **per-row** `−` delete button (own
`UITools.Button`, `visibility: hidden` unless that row is hovered or selected — not a single
section-level button). A selected row gets `var(--color-blue-2)` borders on its mode dropdown and
value field and `var(--color-neutral-1)` handle digits (`GridTrackRow--selected` /
`GridTrackHandle--selected`).

- **Mode dropdown** — `getTrackModeOptions(t, track, axis)` builds three `UITools.Dropdown`
  options from `TRACK_MODE_OPTIONS[axis]` (`GridTrackRow/constants.ts`, one entry per axis with an
  icon + `iconSize` + a short English `triggerLabel`): axis-specific icon + a descriptive label
  ("Fixed width / height (`roundTrackSize(track.resolvedSize)`)", "Hug contents", "Fill container
  (`track.value`fr)"), ordered fixed / hug / fill. The **collapsed trigger** shows the short
  `triggerLabel` ("Fixed" / "Hug" / "Fill"), never the full option text (`TDropdownOption` gained
  an optional `triggerLabel`, plus per-option `icon` / `iconSize` rendered by `DropdownOption`
  between the check mark and the label). Picking **Fixed** from the dropdown seeds the value with
  the track's current `resolvedSize` (the number the option label showed), not the old fr weight —
  `handleModeSelect` passes it as the third `onChangeMode(mode, value?)` arg, threaded through to
  `commitGridAxisModeChange`.
- **Value field** — `fr` weight for `Fill`, px for `Fixed`. For `Hug` it stays editable and shows
  the track's **real resolved px** (`track.resolvedSize`, greyed `var(--color-neutral-2)`,
  `var(--color-neutral-1)` on focus via `GridTrackRow__value--hug`); typing a number + Enter/blur
  switches the track to `Fixed` at that value (`useCommitHugTrackAsFixed`). There is **no** chevron
  `endAdornment` mode menu — the mode dropdown to its left is the only mode control.

- **Data** — `useGridSettingsPanel` reads `gridColumnCount` / effective `gridRowCount` and
  `buildGridTrackList(count, frame.gridColumnSizes|gridRowSizes)` (pads with
  `{ mode: fill, value: 1 }`), maps to `{ index, mode, value, resolvedSize, linkedIndices }`
  view-models (see "Spanning-child linking" below) via
  `makeAxisControls(dispatch, frame, nodes, axis, tracks)`, one bundle per axis. `resolvedSize`
  is the track's actual px from `getGridResolvedTrackSizes(frame, nodes)[axis]` (the real engine
  resolution, not a uniform split) — feeds the "Fixed width (N)" / Hug-field display and the
  Fixed-mode seed. Every mutation writes the **whole** normalised `gridColumnSizes` /
  `gridRowSizes` array (plus the count on add/delete) via `commitGridAxisTracks` — the engine's
  `resolveGridTrackSizes` already consumes those arrays, so the layout just reflows through
  `syncAutoLayoutChildren` on the next dispatch. `TGridAxisControls` also carries a `revision`
  field — the raw `frame` node reference itself, opaque, compared only for identity (see
  "Undo/redo safety" below).
- **Add / delete** (`store/design/utils/autoLayout/gridTracks/`) — `+` appends a default fill
  track and bumps the count. `−` runs `getGridTrackMultiDeleteResult(tracks, children, indices)`:
  splices the sizes (highest index first), never below 1 track, and folds per-child anchor/span
  fix-ups from `getGridTrackDeleteChildUpdates` — removed index `< anchor` → `anchor -= 1`;
  removed index inside `[anchor, anchor+span)` → `span -= 1` (anchor unchanged, since deleting the
  anchor track just shifts the rest down); a single-cell child whose only track goes is released
  to auto-placement (`anchorIndex`/`span` → `undefined`). `getGridTrackChildren` returns `[]` for
  an auto-placement grid, so those fix-ups only run for manually-anchored (`gridAutoPlacement:
  false`) frames. The `+` button carries an axis-specific tooltip ("Add column" / "Add row", passed
  down as `addTooltip` through `GridTrackList` into `UITools.Section`). Each row's `−` button gets a
  tooltip from `GridTrackRow` built off `axis` + `trackCount` + (`isSelected`, `selectedCount`):
  "Remove column 1 of 3" for a lone delete, but the count form ("Remove 2 columns", i18next
  `_one`/`_few`/`_many`/`_other` plurals) when that row is itself in a multi-selection — matching
  `commitGridTrackDelete`, which deletes the whole `selectedIndices` set only when the clicked row's
  index is in it.
- **Reorder** — drag the handle: `useGridTrackReorderDrag` opens a window `pointermove`/`pointerup`
  drag, `computeGridTrackDropIndex(rowRects, clientY)` counts the row midpoints above the pointer
  for the drop slot, and a `GridTrackDropIndicator` renders there — `position: absolute` (2px
  `var(--color-neutral-1)` line, offset via `transform: translateY(index * 32px)`), *not* an
  in-flow flex sibling, so it never reflows the rows below it while it appears/disappears mid-drag.
  The drag state carries `hasMoved` (false until the first `pointermove`); the indicator is gated
  on it, so grabbing a handle and releasing without moving shows nothing, and a plain click on a
  handle never flashes an indicator. Dragged rows are **not** dimmed — there is no
  `--dragging` opacity rule, so the fields stay fully legible while a row is grabbed.
  On release `makeAxisControls.onReorder` runs `moveGridTrackBlock(tracks, start, count, slot)`
  (permutes the sizes array + returns `newIndexByOld`) then `getGridTrackReorderChildUpdates`
  remaps every anchored child's cells through that permutation — **rejected (`null`, nothing
  dispatched, the row snaps back)** if any child's `[anchor, anchor+span)` would stop being one
  contiguous run, if the drag selection is non-contiguous, or if the move is an identity (drop
  where it already is). On success it returns the block's own new positions (sorted), not just
  `true` — see "Selection follows the drag" below.
- **Spanning-child linking** — grabbing an unselected track that a spanning child covers no longer
  drags just that one track (which could only ever be rejected or a no-op — moving one cell of a
  2-cell span always either breaks it or leaves it in place). `getGridTrackLinkedIndices(children,
  trackCount)` builds, per axis, a `number[][]` — one group per track index, `[index]` alone by
  default, or every index a spanning child's `[anchor, anchor+span)` covers, shared by all of
  them. `makeAxisControls` folds this into each view-model's `linkedIndices`. `beginRowDrag` (in
  `useGridTrackList`) reads `controls.tracks[index].linkedIndices` and drags (and selects) the
  *whole* group instead of the bare index whenever the grabbed row isn't already part of an
  explicit multi-selection — an explicit Ctrl/Shift selection is never auto-extended, so a
  deliberate partial selection can still exercise the rejection path.
- **Ctrl/Shift multi-select** lives in `useGridTrackList` (`getGridTrackRangeIndices` /
  `getGridTrackToggledIndices`, called from `commitGridTrackSelect`); a contiguous selection drags
  as one block.
- **Two independent selection fields, written directly by whichever side the interaction happened
  on** — `TDesignState` carries `gridTrackSelection` (canvas-facing, what `drawGridTrackAffordance`
  paints) *and* `panelGridTrackSelection` (panel-facing, what `useGridTrackList` reads) as two
  separate `TGridTrackSelection | null` fields, instead of the panel deriving its own display from
  the canvas field. A canvas pointer handler (`armGridTrackAffordanceOnPointerDown` /
  `armGridTrackAffordanceDrag` / `disarmGridTrackAffordanceDrag`) and every panel commit
  (`commitGridTrackSelect` / `commitGridTrackReorder` / a delete) each call the one shared
  `publishGridTrackSelection(dispatch, selection)` helper, which writes **both** fields with the
  same value in the same dispatch — never a `useEffect` that watches one field and republishes the
  other. `useGridTrackList` reads `panelGridTrackSelection` straight off the store via
  `useAppSelector`, falling back to its own `useState` (`localIndices`, seeded from
  `initialSelectedIndices`) only when nothing external currently applies to this axis+frame;
  `getGridTrackRawIndices(panelSelection, axis, frameId, isSuppressed, localIndices)` is the one
  place that picks between them (see History #21 for why the fields had to split).
- **Only one axis selected at a time** — `useGridTrackSelectionCoordinator` (one instance per
  panel, shared by both `GridTrackList`s via props) tracks a single `activeAxis: 'column' | 'row'
  | null`, defaulting to `'column'`. `isSuppressed(axis)` is true whenever a *different* axis owns
  the selection — `getGridTrackRawIndices` returns `[]` for a suppressed axis's local fallback, and
  also for either axis when `panelGridTrackSelection` belongs to the *other* axis of the same
  frame (so a canvas click on a row hides the column list's stale local default instead of both
  showing selected at once). `onSelectRow`, a successful reorder and the auto-extend-on-grab path
  all call `onSelectionChange(axis, true)` to claim the axis synchronously (in the same handler as
  the state change, not a later effect). Columns starts with column 1 pre-selected (`GridSettings`
  passes `initialSelectedIndices={[0]}` only to the Columns list), matching the coordinator's own
  `'column'` default so nothing needs to reconcile at mount.
- **Selection follows the drag, not "clears on drop"** — a successful reorder publishes
  `onReorder`'s returned new positions instead of clearing, so the moved track(s) stay visibly
  selected wherever they landed. A rejected reorder leaves the selection exactly as the grab
  already set it. Deleting still clears (nothing sensible to keep selected). **A plain click on a
  handle that's part of a multi-selection**, released without any `pointermove`, collapses the
  selection to just that one row (its own `linkedIndices` group) — `commitGridTrackReorder`
  branches on `hasMoved`, and only an actual move goes through `controls.onReorder`.
- **Undo/redo carries the track selection via the design snapshot itself — see History #21/#22.**
  The revision-keyed `WeakMap<frameRef, number[]>` restore mechanism this section used to describe
  (`syncExternalGridTrackSelection`) was removed along with the parent-level selection mirror it
  depended on, which briefly regressed undo/redo of the track selection (e2e
  test-cases-auto-layout.md #37 was `test.skip`ped for a time). The replacement is not a watcher:
  `gridTrackSelection`/`panelGridTrackSelection` were added as two more fields on
  `TDesignSnapshot`, captured by `getDesignSnapshot` and restored by `handleReplaceDesignSnapshot`
  exactly like `pages` already is — the same mechanism node `selectedIds` rides on "for free"
  because it's nested inside `TDesignPage`. `historyMiddleware` snapshots `design.gridTrackSelection`
  / `design.panelGridTrackSelection` immediately before every undoable action (they are not
  themselves in `UNDOABLE_ACTION_TYPES`, so selecting a track is not its own undo step), so undoing
  e.g. a track reorder restores whatever the selection was the instant before that reorder
  committed. No `useEffect`, no ref, no equality guard — a plain read/write into the existing
  snapshot pipeline.
- **Global keyboard shortcuts (undo included) work from inside the panel's own fields** —
  `UITools.TextField`/`TextFieldWrapper` and `UITools.Dropdown` both unconditionally rendered
  `data-test-bypass-global-shortcuts="true"` on their input/trigger (the mechanism
  `useKeyboardHandler` checks via `target.closest(...)` before running *any* global shortcut,
  Cmd+Z included, so with focus inside one of those elements the shortcut is swallowed before it
  ever dispatches). Both now take an optional `bypassGlobalShortcuts` prop (default `true`,
  preserving every other call site's existing behaviour) that `GridTrackRow` passes `false` for
  its mode dropdown and value field specifically, so Cmd+Z reaches the app's `undo` thunk even
  while the user is still focused on a field they were just editing.
- **Editing a track's value directly on the canvas** — clicking an *already-selected* pill's value
  band (`hoveredHandlePart === 'value'`) opens an inline editor there, with the same fr/fixed/hug
  parsing rules and multi-selection propagation as the panel's own value field (see History #23).
  It is a second plain click, not a double-click: `armGridTrackValueEditOnPointerDown` runs *before*
  `armGridTrackAffordanceOnPointerDown` in the resolver chain and only fires when the clicked index
  is already part of `gridTrackSelection` for that axis+frame, in which case it dispatches
  `gridTrackValueEditRequest` (a `{axis, frameId, index} | null` redux field) and returns `true`,
  short-circuiting the chain before the ordinary select-resolver can run — this is *why* clicking a
  value that's part of a multi-selection opens editing instead of collapsing the group to just that
  row, the opposite of the panel's own handle-click behaviour a few bullets up. A resolver (plain
  dispatch, no React) can't hold local edit state itself, so redux is the bridge to
  `GridTrackValueLabelEditOverlay`'s `useGridTrackValueLabelEditor` hook, which watches the request
  via `useSelector` and renders a real `<input>` (`CanvasValueLabelInput`, shared with the vector
  variable-width tool) positioned over the pill with `worldToScreen`. Typing calls
  `commitGridTrackValueLiveChange` on every keystroke, which recomputes the pill's badge/grip/chevron
  geometry from the *live* typed text (capped at `GRID_TRACK_AFFORDANCE_VALUE_MAX_WIDTH_PX`) and
  writes it into `refs.hover.editingGridTrackValueRef` so `drawGridTrackAffordanceExpanded` draws the
  grip and chevron pushed apart to match — otherwise a long typed value would grow independently on
  each side (the WebGL pill computing its own, uncapped width from the full raw string) and visibly
  diverge from the input's width. While a pill is mid-edit its real WebGL text glyphs aren't drawn at
  all (the opaque input already covers that area); `CanvasValueLabelInput`'s font was changed to
  `'Inter MSDF'` (a `@font-face` already declared for exactly this, pointing at the same `.ttf` the
  MSDF atlas was built from) so the DOM input's own text measurement lines up with the WebGL
  measurement without a fudge factor. Enter/blur commits via `commitGridTrackValueEdit` (the same
  per-mode fill/fixed/hug branches as the panel), Escape cancels; either way the hook dispatches
  `gridTrackValueEditRequest(null)`, whose `useEffect` clears the ref and local state.
- **Picking a track's mode from its chevron, on the canvas** — clicking the pill's chevron band
  (`hoveredHandlePart === 'chevron'`) opens an on-canvas dropdown (`GridTrackModeMenuOverlay`, a
  `Menu`/`MenuCompound.MenuItem` from `@xigma/components` with a virtual `anchorRef` positioned
  under the chevron via `worldToScreen`) listing the same three options — icon, label and current
  value/checkmark — as `GridTrackRow`'s own mode dropdown in the panel
  (`getGridTrackModeMenuOptions` reuses the shared `TRACK_MODE_OPTIONS` icon/label-key table and
  `translationNameSpace`, both relocated — alongside `roundTrackSize` — from the panel's
  `GridTrackRow` folder into `store/design/utils/autoLayout/gridTracks/` so Canvas can import them
  cleanly, mirroring how `commitGridAxisValueChange`/`commitGridAxisModeChange`/`parseFillFieldInput`
  were relocated for the value-edit feature above). Unlike the value editor, this does *not* need a
  second click to disambiguate from the ordinary select-resolver: `armGridTrackAffordanceOnPointerDown`
  itself handles the chevron case (no separate earlier resolver), but only recomputes the click's
  selection via `getGridTrackAffordanceClickIndices` when the clicked index is *not already* part of
  the current `gridTrackSelection` — when it is, the whole multi-selection is left untouched before
  dispatching `gridTrackModeMenuRequest`, which is what lets picking a mode from the canvas menu apply
  to every selected track (`commitGridTrackModeMenuChange`, same `selectedIndices.includes(index) ?
  selectedIndices : [index]` fan-out as the panel's `commitGridTrackModeChange`) instead of just the
  one clicked. A chevron click also no longer dispatches `setGridSettingsPanelOpen(true)` (unlike
  every other part of the pill) since the on-canvas menu already offers the same control inline.

### Panel — resizing a grid that already has children (`resolveGridResize`)

Every dimension commit that can shrink the grid (`onCommitColumns`, `onCommitRows`, `onClickCell`
picking a matrix cell) routes through `store/design/utils/autoLayout/getGridResizeRepack.ts`'s
`resolveGridResize(frame, nodesById, newColumnCount, capacityRowCount)` before dispatching
anything — matching Figma, not the engine's own "always grows to fit" instinct (§ Canvas — drag a
child into a cell already relies on that instinct for *drop*, but a *resize* the user typed in is
different: an impossible request should be rejected, not silently reinterpreted):

- **Reject outright** when `capacityRowCount !== undefined && newColumnCount * capacityRowCount <
  childIds.length` — e.g. a 2×4 grid holding 6 children, requesting 1×1: 1 cell can't hold 6, so
  the commit is dropped entirely (no dispatch at all, the fields snap back to the real value).
  `capacityRowCount` is the *fixed* row count when rows aren't Auto, or `undefined` when they are
  (Auto rows have no ceiling — `onCommitColumns` passes `isRowsAuto ? undefined : rowCount`;
  `onCommitRows` and `onClickCell` always pass the row value being committed, since typing/clicking
  a row count always pins it).
- **Repack, not just clamp**, when the frame is in manual placement (`gridAutoPlacement === false`)
  and the new size is *accepted*: a naive per-axis anchor clamp (`getAnchoredGridPlacement`'s own
  `Math.min(Math.max(anchor, 0), columns - span)`) can silently collide two children into the same
  cell — e.g. a 2×2 with A anchored (0,0) and B anchored (1,0), shrunk to 1 column: both anchors
  clamp to column 0, landing on top of each other. `resolveGridResize` instead re-derives every
  child's **current** reading-order position (`placeGridCells` at the *old* column count, sorted by
  `row * oldColumns + column`), then re-packs that exact order into the *new* column count via a
  fresh auto-flow pass (`placeGridCells(orderedInputs, newColumnCount, true)` — collision-free by
  construction). Only children whose resolved cell actually changed get a new
  `gridColumnAnchorIndex` / `gridRowAnchorIndex` dispatch (`commitGridRepackedAnchors`); a growing
  resize that doesn't dislodge anyone dispatches nothing. When the frame is still auto-placing,
  repacking is a no-op — the live engine already re-flows every render, there's nothing to persist.
- **Reset every spanning child to 1×1** on an accepted resize (`resolution.spanReset` — the ids of
  children with `gridColumnSpan > 1` or `gridRowSpan > 1`; `commitGridSpanReset` clears both
  fields). A grid resize doesn't try to re-fit a 2×2 child into the new track grid — it's dropped
  back to a plain single cell and re-flows like any other (user's call: "less complication than
  resolving the grid against every child"). `resolveGridResize` also runs its capacity check and
  repack off `resetInputs` (every child forced to 1×1), so `newColumnCount * capacityRowCount ≥
  childIds.length` is an accurate cell count again — a 2×2 child used to count as one cell there
  and mis-size the check. The reset happens for auto-placing frames too (span is a per-child
  field independent of `gridAutoPlacement`).

### Canvas — cell slots

`src/utils/canvas/gridSlots/` holds the shared geometry: `getGridTrackLayout(frame, nodesById)`
→ `{ columnCount, columnGap, columnSizes: number[], padding, rowCount, rowGap, rowSizes: number[] }`.
It delegates to **`getGridResolvedTrackSizes`** (`store/design/utils/autoLayout/`) — the same
`placeGridCells` → `resolveGridTrackSizes` pipeline the engine's `resolveGridLayout` runs (real
`contentMax` per track from `getGridContentMaxPerTrack`), minus the child-position pass — so the
overlay's per-track px **match the actual layout**: a Fixed track keeps its value, a Hug track
collapses to its widest single-cell child, the Fill tracks share the rest (or collapse to content
on a hug frame). `columnCount` / `rowCount` are just the resolved arrays' lengths (`rowCount` still
grows for an anchored child in a far row, via the engine's `derivedRowCount`).
`getGridSlotRect(layout, frame, column, row)` places a cell from the **cumulative** track offset
(`getGridTrackOffset(sizes, gap, index)` = Σ preceding sizes + index·gap) and that track's own
size; an index past the resolved tracks gets a zero size (the grid grows on drop).
`getGridTrackIndexAt(sizes, gap, coord, allowOverflow)` is the inverse — which track a frame-local
coordinate falls in (columns clamp to the last; rows extrapolate past the end using the last row's
stride) — used by `getGridDropCell` / `getHoveredGridCell` in place of the old uniform-stride
division.

When a single `LayoutMode.grid` frame is **selected**, `drawGridSlots` (`getSelectedGridFrame`
gate, in `drawScene` next to the padding/gap handles) strokes every cell faint blue
(`GRID_SLOT_STROKE`), rotation about the frame centre like the padding guides.

### Canvas — section highlight (`gridSectionHighlight`)

A **standalone** "light up these grid cells" facility, not wired into the Grid panel: any feature
can point the canvas at a set of cells. `design` slice carries `gridSectionHighlight:
{ cells: { column; row }[]; frameId } | null` (`setGridSectionHighlight` reducer,
`selectGridSectionHighlight` selector, **not** undoable — outside the `getDesignSnapshot`
`{ activePageId, pages }` shape). `drawScene` reads it and calls `drawGridSectionHighlight`
(`isGridFrame` gate): `getGridSectionHighlightRects(frame, nodesById, cells)` drops cells outside
the current `getGridTrackLayout` bounds, returns a `getGridSlotRect` per surviving cell plus one
`outlineRect` = the bounding box of them all. Each cell is filled `GRID_SLOT_ACTIVE_FILL` @
`GRID_SLOT_ACTIVE_FILL_ALPHA` (the same wash a slot/drop-target cell gets); the bounding box is
stroked once with `drawThickOutline` at `GRID_SECTION_HIGHLIGHT_STROKE_WIDTH` (2, i.e. "2×" the
1px slot line) in `GRID_SLOT_ACTIVE_STROKE`, rotation about the frame centre (`drawThickOutline`
gained an optional trailing `rotationCenter` for this — otherwise it pivots about the rect's own
centre). Disjoint cells get one enclosing outline (fine for the current caller — whole
columns/rows are contiguous).

The Grid settings panel is currently the only caller: each `GridTrackList` gets a
`crossAxisTrackCount` (the *other* axis's track count) and an `onHighlightCellsChange` callback; a
`useEffect` on its `selectedIndices` runs `getGridSectionCells(axis, selectedIndices,
crossAxisCount)` (a selected column → a cell per row, a selected row → a cell per column, `[]`
when nothing is selected) and reports up. `GridSettings` merges the column and row lists' cells
and, in one effect, dispatches `setGridSectionHighlight({ cells, frameId })` (or `null` when
empty); a cleanup effect clears it on unmount. One dispatcher, so no set/clear race between the
two lists.

### Canvas — drag a child into a cell

While an element is dragged over a grid frame, `resolveDragReparentTarget` branches on
`isGridFrame(desiredParent)` → `armGridDropTarget` resolves the drop and writes
`transform.gridDropTargetRef = { cells, frameId, indicator?, insertIndex? }` plus
`dropTargetFrameIdRef`. The resolution (`resolveGridDropHover`) branches on what's under the
cursor:

- **Empty hovered cell** — `getGridDropPlacements` walks reading order from there and collects
  one **free** cell per top-level dragged node: it runs `placeGridCells` over the frame's *other*
  children (`getGridPlacementInputs`, minus `movedNodeIds` for a same-parent drag) to build an
  occupancy set, so cells already holding an anchored child are skipped and a resolved cell can
  land past the current grid. The scan is **span-aware**: for each dragged node it asks
  `isGridRegionFree` for that node's whole `columnSpan × rowSpan` footprint (span clamped to the
  column count so a too-wide child still resolves), so a spanning child's resolved anchor never
  puts its body over an occupied cell or past the right wall — it drops into the next row instead
  (History #17). `hover.cells` is set, `hover.indicator` is absent.
- **Occupied hovered cell, cursor on its free-neighbour side** — same-row neighbour (left when
  the cursor is in the left half of the cell, right for the right half) is empty → highlight that
  neighbour instead (`getGridDropPlacements` from the neighbour). Still a plain `cells` hover.
- **Occupied hovered cell, cursor on its boxed-in side** — the same-row neighbour on that side is
  either a wall (edge column) or itself occupied → arm an **insertion indicator** instead of a
  cell: `hover.cells = []`, `hover.indicator = { column, row, side }`,
  `hover.insertIndex = row * columnCount + column (+1 for the right side)`. No cells are
  highlighted; nothing is previewed being pushed (the shift only happens on drop, same "grid
  changes only on drop" rule as row growth).
- **Hovered cell owned by a child that spans more than one cell** — a multi-cell child has no
  interior insertion points, so the reading-order-indicator branch is skipped entirely and the
  hover resolves to the **next free cell** (`getGridDropPlacements` from the hovered cell, which
  scans forward past the whole span). `resolveGridDropHover` now builds a `cellOwner` map
  (cell key → owning `TGridCellPlacement`) alongside the `occupied` set — `getGridOccupancyIndex`
  — and `resolveOccupiedCellHover` checks `owner.columnSpan * owner.rowSpan > 1` before doing
  anything else (History #16). A plain 1×1 occupied cell still gets the indicator/neighbour
  behaviour above. The file is split into `resolveGridDropHover/` (`getHoveredGridCell`,
  `getGridOccupancyIndex`, `resolveOccupiedCellHover`, `getGridDropPlacements`, `getSpanById`,
  `withGridSpanPreview`, `getGridFootprintCells`).

**Spanning-child footprint preview.** After any of the branches above, `withGridSpanPreview`
runs once (History #17): when the dragged selection's resolved `cells` line up one-to-one with
`movedNodeIds` and at least one dragged node spans more than a single cell, it expands each
anchor into that node's `columnSpan × rowSpan` block (`getGridFootprintCells`, column start slid
left to fit), unions the blocks (deduped), drops any cell another child occupies
(`getGridOccupancyIndex`), and stashes the result as `hover.previewCells`. `hover.cells` stays
the anchor list for `applyGridDrop`. Works for a multi-node drag too — every dragged member's
footprint is drawn. Indicator hovers are left untouched.

`drawGridDropTarget` branches on `hover.indicator`: if set, it draws a single vertical bar
(`getGridInsertIndicatorRect` — centred in the gap on that side of the cell, or clamped to the
frame's content edge for a wall) filled `FRAME_DROP_TARGET_STROKE`, the same colour/thickness as
the linear auto-layout drop indicator. Otherwise it draws the grid at its **current** `rowCount`
and fills `hover.previewCells ?? hover.cells` — the ones that fall inside the grid, omitting any
that overflow (the grid grows on drop, not on hover) — `GRID_SLOT_ACTIVE_FILL` at
`GRID_SLOT_ACTIVE_FILL_ALPHA`, marquee-style.
`getAutoLayoutDragOpacity` dims the dragged nodes to `0.5` whenever the ref is set, indicator or
not.

On drop (`commitDropIntoFrame`):
- **Cell hover** (`applyGridDrop`) — `moveNodes` appends the nodes, then per node `updateNode`
  sets `gridColumnAnchorIndex` / `gridRowAnchorIndex` from `cells[i]` and `widthSizingMode` /
  `heightSizingMode = fill` (the element ignores its own size and fills the cell), and the frame
  flips to `gridAutoPlacement: false` so the anchors take. The grid grows rows to the dropped
  cells via the engine's `derivedRowCount` — no explicit `gridRowCount` write.
- **Indicator hover** (`applyGridInsert`, driven by `getGridInsertPlacements`) — reading-order
  insert: `placeGridCells` resolves every *other* child's current reading index
  (`row * columnCount + column`); the dragged nodes take `insertIndex .. insertIndex + N - 1`;
  every existing child at or past `insertIndex` **ripples forward** to the nearest free reading
  index at or after `insertIndex + N` (a child that already sat further out than the ripple stays
  put — no gap is ever widened, only closed), growing a new row if it runs off the end. Every
  moved child (dragged + rippled) gets an explicit anchor and the frame flips to
  `gridAutoPlacement: false`; dragged nodes also get `widthSizingMode` / `heightSizingMode = fill`
  like a plain cell drop. `childIds` order itself is untouched — the reorder is anchor-driven.

Everything above is agnostic to where the dragged node came from: dragging a *fresh* element in
from outside the grid and dragging an *already-placed* grid child to a new cell go through the
exact same `armGridDropTarget` → `drawGridDropTarget` → `commitDropIntoFrame` pipeline (the same
occupancy scan naturally "merges" several scattered-but-selected grid children into adjacent free
cells, since `count`/`draggedCount` is just the selection size and their own old cells are simply
excluded from occupancy like any other moved node).

### Canvas — the grid drag ghost (dragging an already-placed grid child)

Reordering *inside* a grid has one problem the "fresh drop" case never hits: the dragged node is
itself grid-managed. `dispatchDraggedNodeUpdates` (the generic per-frame drag translate every
other node type uses) dispatches a live `updateNode` on x/y — but `handleUpdateNode` immediately
re-runs `syncAutoLayoutChildren` on the parent, which for a grid frame resyncs *every* child from
its anchor/auto-flow cell, stomping that live x/y right back. Net effect without a fix: the
dragged node visually freezes at its cell instead of following the cursor.

Fixed the same way the linear engine already solves this for its own reorder ghost
(`autoLayoutReorderPreviewRef` + `getAutoLayoutReorderRenderNode`, §9) — but simpler, since a grid
drag doesn't preview siblings shifting, only the dragged node(s) floating:

- `updateAutoLayoutReorderGhostPosition` (the single umbrella that decides how a drag frame's
  delta gets applied) now takes `nodesById` and checks `isGridFrame` on the dragged selection's
  **origin** parent (`selectedNodes[0].parentId`, looked up before any drop takes effect — this is
  stable for the whole drag since reparenting only happens on drop). Three outcomes: the existing
  linear `preview` ref wins if armed; else if the origin parent is a grid frame, arm
  `transform.gridDragGhostRef = { nodeIds, offset: { x: deltaX, y: deltaY } }` and skip the
  dispatch entirely (so there is nothing for the grid resync to stomp); else the plain
  `dispatchDraggedNodeUpdates` path (unmanaged nodes, or a fresh node not yet in a grid).
- `getGridDragRenderNode` (wired into `drawLeafNode` and `drawFrameOutlines`, chained after the
  linear `getAutoLayoutReorderRenderNode`) reads that ref at render time and returns the node
  shifted by `offset` via `getGeometryDeltaChanges` — the store's x/y are never touched, so this is
  purely a draw-time substitution. `getOverriddenGridDragAncestor` walks the parent chain (mirrors
  `getOverriddenAncestorNode`) so a dragged frame's own nested children ride along too.
- The ghost carries **no anchor/cell semantics of its own** — it is pure "let this node visually
  detach and track the cursor 1:1, like the linear ghost." The *actual* target cell/indicator is
  still `gridDropTargetRef`'s job (unchanged); on drop the real commit path
  (`applyGridDrop`/`applyGridInsert`/plain reparent) sets the final position and the ghost ref is
  cleared in `disarmDrag`.
- **The modifier (Ctrl/Cmd) turns the whole grid mechanism off, not just the ghost.**
  `resolveDragReparentTarget`'s grid case gained `&& !isModifierHeld` — holding the modifier while
  dragging a grid child never arms `gridDropTargetRef` at all (no highlight, no indicator), so on
  drop nothing anchors and no sibling is touched; the node behaves exactly like an ordinary
  unmanaged drag (plain reparent if it lands outside its original grid, a no-op if it lands back
  inside — `targetParentId === currentParentId` never satisfies `commitDropIntoFrame`'s drop
  conditions when no ref is armed). The ghost still applies while the modifier is held (the origin
  parent is still a grid frame), so the node visually detaches and rides the cursor free of any
  cell — "pull it out of its slot, nothing else reshuffles."

### Panel — a grid child's own cell alignment (the shared `ColumnAlignment` widget)

A grid child aligns *within its own cell* via the data model's own `gridChildHorizontalAlign` /
`gridChildVerticalAlign` (default top-left; §13 engine notes — `getGridChildPosition` already
consumed these from day one, only the RightPanel control was missing). Rather than a second,
duplicate widget, `PositionSection/ColumnAlignment` (the existing "Alignment" row — six buttons,
same icons, same layout) was made grid-aware in place:

- `useColumnAlignment`'s `isGridChild` (`parent.layoutMode === grid && !node.ignoreAutoLayout`)
  branches `onSelectHorizontal` / `onSelectVertical` to `setGridChildHorizontalAlign` /
  `setGridChildVerticalAlign` (write the grid fields only) instead of `moveNodeToAlignment` (write
  `alignment` + x/y). The pre-existing `horizontal` / `vertical` / `setHorizontal` / `setVertical` /
  `disabled` stay untouched in meaning — `ColumnPosition`'s constraints-icon affordance and
  `ColumnConstraints` (the pin/scale panel) both also consume this hook and must keep working
  exactly as before, grid or not. New `gridHorizontal` / `gridVertical` (defaulting to
  left/top) are additive fields read only by `ColumnAlignment` itself, which picks
  `isGridChild ? gridHorizontal : horizontal` for what button shows pressed.
- The icons' two-tone fill (`data-svg-fill-one` / `data-svg-fill-two`, added straight to the
  `align-*.svg` assets — `neutral-1` / `ramp-400` normally, `bg-selected` background +
  `blue-2` on `fill-one` when the button is `aria-pressed`) lives in
  `column-alignment.module.scss`, scoped under this file's own `.ColumnAlignment__buttons` class —
  plain nested attribute selectors (`button:not(:disabled) { [data-svg-fill-one='fill'] {…} }`),
  no `:global()` needed since a local class already anchors the chain (same pattern as
  `ActionsPanel__item:hover { [data-svg-property='fill'] {…} }`).
- **An absolute-position (`ignoreAutoLayout`) grid child "lets go" of both the panel behaviour and
  the actual cell**, matching the user's own framing exactly: `isGridChild` excludes it, so
  clicking an align button falls through to the ordinary edge-alignment/constrain path — the same
  as a linear-layout child today. Two separate canvas-side gaps had to close for this to actually
  hold, both pre-existing and undiscovered until this exact scenario surfaced:
  - `updateAutoLayoutReorderGhostPosition`'s grid-ghost branch (previous section) only checked
    `isGridFrame(originParent)` — an absolute child being dragged still hit it, so its live x/y
    dispatch was skipped and nothing ever committed the new position: on release it silently
    reverted to wherever it last was, looking exactly like "the alignment pulls it back into its
    slot." Fixed by also requiring `!isAbsoluteChild` (`isBoxSceneNode(grabbedNode) &&
    grabbedNode.ignoreAutoLayout`, the same check `resolveDragReparentTarget` already used) — an
    absolute grid child now falls straight to the plain `dispatchDraggedNodeUpdates` path, dragging
    freely like any other unmanaged node.
  - `getGridPlacementInputs` (the one shared input-builder behind every grid occupancy scan —
    drop-target hover, insert-index, drag-reorder) never excluded `ignoreAutoLayout` children at
    all, unlike `getAutoLayoutSyncChildren` (the layout-engine's own children list, which already
    did). So a child's old cell stayed "occupied" for every other drag/drop calculation even after
    it opted out of the grid — going absolute didn't actually free its slot. Fixed by filtering
    `ignoreAutoLayout` out there too, the single choke point every occupancy consumer already goes
    through.

### Not covered yet

On-canvas track pills / drag-a-track-edge-to-fixed-px (the panel now covers per-track
Fixed/Hug/Fill sizing, add, delete and reorder — § "Panel — the dedicated Grid settings panel";
the canvas overlay is still the last phase), `gridAutoPlacement` toggle UI, occupied-vs-empty
cell styling, span edge-handles (canvas resize-to-span), auto-placement obstruction reflow,
arrow-key reorder, ⌘D-into-next-cell. The Column span / Row span fields are wired
(`ColumnGridChildSpan`); the engine already honours spans and manual anchors when set in code.

## Tests

- **Unit — engine:** `src/store/design/utils/autoLayout/test/` (flat helpers — `getFrameLayoutPadding`,
  `getAutoLayoutPrimarySpacing`, `getDistributedGap`, `getAxisOffset`, `clampAutoLayoutSize`,
  baseline helpers, …), `syncAutoLayoutChildren/test/`, `computeAutoLayoutPositions/test/` (+
  `getAutoLayoutChildStrokeInset`, `getAutoLayoutFillSizes`, `getAutoLayoutFilledLines`,
  `clampAutoLayoutFrameToPadding`, `isAutoLayoutWrapEnabled`, `resolveAutoLayoutFillPrimarySizes`,
  hug), `computeAutoLayoutWrappedPositions/test/`, `getAutoLayoutChildPositions/test/`
  (`getAutoLayoutPrimaryLayout`), `getAutoLayoutWrappedChildPositions/**/test/`,
  `getAutoLayoutDropTarget/test/`, `getAutoLayoutWrappedDropTarget/test/`,
  `getAutoLayoutGapHandles/test/`, `getAutoLayoutReadingOrderSlot/test/`.
- **Unit — grid tracks / panel:** `src/store/design/utils/autoLayout/gridTracks/test/`
  (`buildGridTrackList`, `addGridTrack`, `deleteGridTrack`, `getGridTrackDeleteChildUpdates`,
  `getGridTrackMultiDeleteResult`, `moveGridTrackBlock`, `getGridTrackReorderChildUpdates`,
  `getGridTrackChildren`, `getGridTrackLinkedIndices`, `getGridAxisFieldNames`),
  `PanelProperties/GridSettings/**` (`GridSettings`, `GridSettingsHeader`, `GridTrackList`,
  `GridTrackRow` + `GridTrackHandle` + `GridTrackDropIndicator`, `useGridSettingsPanel`,
  `useGridTrackSelectionCoordinator`,
  `hooks/utils/{makeAxisControls,commitGridAxisTracks,commitGridDeleteChildUpdates,commitGridReorderChildUpdates}`,
  `GridTrackList/hooks/{useGridTrackList,useGridTrackSelection,useGridTrackReorderDrag}`,
  `GridTrackList/utils/{computeGridTrackDropIndex,getGridTrackRangeIndices,getGridTrackToggledIndices}`),
  `.../ColumnAlignmentLayout/hooks/utils/test/{openGridSettingsPanel,commitGridColumnResize,commitGridRowResize,commitGridCellClick}.spec.ts`,
  `shared/UITools/{Dropdown,TextField/TextFieldWrapper}` (`bypassGlobalShortcuts` opt-out).
- **Unit — UI / preview:** `.../PopoverAutoLayoutSettings/**/*.spec.tsx` (+ `hooks/utils/test/commit*Change`),
  `.../ColumnMinMaxDimensions/`, `.../ColumnPadding/hooks/test/`,
  `.../updateDragDropTarget/armAutoLayoutDropTarget/test/`,
  `.../updateAutoLayoutReorderGhostPosition/**/test/`,
  `.../drawScene/test/getAutoLayoutReorderRenderNode.spec.ts`,
  `Canvas/utils/test/animateAutoLayoutReorder.spec.ts`.
- **e2e:** `e2e/design/auto-layout/` — `flow`, `wrap-indicator-positions`,
  `horizontal-indicator-positions(-center-right)`, `vertical-indicator-positions`, `reorder`,
  `rotated-child`, `rotated-frame`, `fill-sizing`, `min-max-sizing`, `padding`, `padding-handles`,
  `gap-handles`, `ignore-auto-layout`, `settings` (the popover round-trip: Layout version, Auto
  spacing, Canvas stacking), `grid` (the Flow toggle's Grid button → grid engine → canvas
  round-trip). Scenario catalog with per-row rationale: `e2e/design/docs/test-cases-auto-layout.md`.
- **Unit — grid (§13):** engine — `computeGridLayoutPositions/**/test/` (`placeGridCells/*`,
  `resolveGridLayout/*`, `getGridTrackOffsets`, `getGridCellRect`, `getGridChildPosition`,
  `resolveGridTrackSizes`, `computeGridLayoutPositions`) +
  `syncAutoLayoutChildren/test/getGridLayoutSyncPositions.spec.ts`; canvas slots + drop —
  `store/design/utils/autoLayout/test/{getSelectedGridFrame,getDerivedGridRowCount,getGridPlacementInputs}.spec.ts`,
  `src/utils/canvas/gridSlots/test/*` (`getGridTrackLayout`, `getGridSlotRect(s)`,
  `getGridDropCell`, `getGridInsertIndicatorRect`) +
  `gridSlots/resolveGridDropHover/test/*` (`getHoveredGridCell`, `getGridOccupancyIndex`,
  `resolveOccupiedCellHover`, `getGridDropPlacements`, `resolveGridDropHover`, `withGridSpanPreview`,
  `getGridFootprintCells`),
  `gridSlots/getGridInsertPlacements/**/test/`,
  `updateDragDropTarget/{test/isGridFrame,armGridDropTarget/test,test/resolveDragReparentTarget}`,
  `disarmDrag/test/{applyGridDrop,applyGridInsert,resolveDropTargetIndex,commitDropIntoFrame}`,
  `drawScene/test/{drawGridSlots,drawGridDropTarget,getAutoLayoutDragOpacity,getGridDragRenderNode,getOverriddenGridDragAncestor}.spec.ts`,
  `continueDrag/updateAutoLayoutReorderGhostPosition/test/updateAutoLayoutReorderGhostPosition.spec.ts`
  (grid-ghost cases); panel —
  `ColumnAlignmentLayout/GridArea/**/*.spec.tsx` (`GridArea`, `GridAreaPreview`, `GridAreaPopover`,
  `GridInputs`, `GridInputCells`, `CellsInput`, `useCellsInput`),
  `ColumnAlignmentLayout/hooks/**` (`useColumnGridArea`, `clampGridCount`,
  `commitGridColumnCountChange` / `commitGridRowCountChange` / `commitGridRepackedAnchors` /
  `commitGridSpanReset`), and `Common/ColumnGridChildSpan/**` (`ColumnGridChildSpan`,
  `useColumnGridChildSpan`, `clampGridChildSpan`,
  `commitGridChildColumnSpanChange` / `commitGridChildRowSpanChange`,
  `getGridChildSpanBounds/**` — `getGridChildSpanBounds`, `growMaxSpan`, `isGridColumnClear`,
  `isGridRowClear`, `getGridOccupancyExcludingNode`);
  `store/design/utils/autoLayout/test/getGridResizeRepack.spec.ts` (the reject/repack rules
  standalone); `PositionSection/ColumnAlignment/**` (`ColumnAlignment`, `useColumnAlignment` +
  its `hooks/utils/{commitAlignmentConstraint,moveNodeToAlignment,setGridChild{Horizontal,Vertical}Align}`
  — the grid-branch cases specifically); `store/design/utils/autoLayout/test/getGridPlacementInputs.spec.ts`
  (the `ignoreAutoLayout` exclusion).
- **e2e — grid:** `e2e/design/auto-layout/grid.spec.ts` — the Flow toggle's Grid button, the
  `GridArea` popover's Columns field + 12×8 pick matrix, the on-canvas cell slots (appear on
  select, reflow on column-count change), dragging an element into a cell (hover highlight + dim,
  drop nests it filling the cell), shrinking columns on an already-anchored grid repacking instead
  of colliding, the shared Alignment widget moving a grid child within its own cell, an
  absolute-position grid child dragging freely instead of snapping back, and (§13's dedicated
  panel) opening it / resizing / adding / deleting a track, dragging a track by its handle to
  reorder (including the span-break rejection), and undo/redo from inside a panel field resetting
  a stale track selection — driving the engine + canvas + panel together.

## History (so it isn't repeated)

1. **2026-09-05 — drag-reorder threshold used the wrong sibling positions.** The insertion-index
   comparison recomputed sibling positions by closing the gap the dragged node left, then compared
   the real uncompacted cursor against those compacted positions — a mismatch that made a sibling
   *after* the dragged node's slot swap far too early. Fixed by comparing against each sibling's real
   undisturbed bounds.
2. **2026-09-05 — midpoint felt wrong even after the position fix.** The threshold itself waited for
   50% overlap; doesn't match Figma's "swap as soon as you touch it". Landed on "same single edge
   both directions" after confirming the exact boundary with the user via a pixel example (an earlier
   edge-based-hysteresis proposal was under-specified and dropped before any code).
3. **2026-09-05 — rotated children overflowed their frame.** Every auto-layout size/position call
   site was silently rotation-naive (`getNodeAxisAlignedBounds` never rotates, §8). Fixed by the
   store-layer `getRotatedNodeBounds.ts` wired into every call site — the applier *and* the
   drag-reorder sibling/ghost/render-preview code.
4. **2026-09-05 — multi-node reorder didn't exist as a mechanism.** Found by hand in three layers
   (§11) — each invisible until the one below it was fixed.
5. **~2026-09 — the "Layout" popover row.** Figma's `legacy`/`updated` engine split (§6). Shipped
   phased: persist `layoutVersion` + differences #1/#5/#6 first; then the `strokeAlign` model
   (rendering + hit-test + marquee); then #2/#3 (`getFrameLayoutPadding` keyed on `strokeAlign`, the
   Inside stroke row hidden under `updated`); then #4 (`getAutoLayoutChildStrokeInset` +
   `getAutoLayoutFillSizes` content-area split). `strokeAlign` still has no RightPanel control — the
   engine and renderer read it, but it can only be set in code.
6. **~2026-09 — grid flow, Phase 1 (§13).** `LayoutMode.grid` was a dead enum + dead Flow button
   (picking it just reset child fill and laid out nothing). Phase 1 added the full data model and a
   `computeGridLayoutPositions/` engine (placement, track sizing, gaps, padding, hug, spanning,
   per-cell alignment, rotation) wired behind that same button — engine only, no dedicated grid UI.
   The engine honours spans / manual anchors when set in code; the controls and canvas handles for
   them are later phases.
7. **~2026-09 — grid flow, Phase 2: the panel (§13).** Ported x-design's `GridArea` widget
   (preview tile + popup with two count inputs and a 12×8 pick matrix) into `ColumnAlignmentLayout`
   for grid mode, plus both gap fields. Deliberately no per-track sizing UI or canvas handles —
   x-design has neither, and the engine's `1fr` default already matches `repeat(n, 1fr)`. Per-track
   controls + on-canvas handles are the final phase.
8. **2026-09-10 — grid flow, Phase 3: canvas cell slots (§13 "Canvas — cell slots").** Selecting a
   grid frame now draws its cells as faint-blue outlines (`drawGridSlots` → `getGridSlotRects`,
   uniform `1fr` geometry since nothing sets per-track sizes yet). Display only. Also added a
   display-only Column span / Row span row to the child panel. Follow-up (2026-09-10): the "Auto"
   row count and the slot overlay used `ceil(childCount / columns)`, which ignored a child pinned
   to a far row — replaced by `getDerivedGridRowCount` (runs `placeGridCells`, matching the
   engine's own `derivedRowCount`); `placeGridCells` now takes a narrow `TGridPlacementInput`.
9. **2026-09-10 — grid flow, Phase 3b: drag a child into a cell (§13 "Canvas — drag a child into a
   cell").** First cut clamped the highlight to a reading-order insert index, so it always lit "the
   first empty slot" instead of the cell under the cursor — reported by hand. Switched to exact
   per-cell targeting: `getGridDropCell` returns the hovered `{ column, row }` (unbounded rows),
   the drop pins the element there via `gridColumnAnchorIndex` / `gridRowAnchorIndex` +
   `gridAutoPlacement: false`, and forces `widthSizingMode` / `heightSizingMode = fill` so the
   element takes the cell's size, not its own. Grid grows rows to the dropped cell through the
   engine's `derivedRowCount`. Multi-select fills forward from the anchor. Shares
   `getGridTrackLayout` with the slot overlay. Follow-up (same day): the highlight counted
   `draggedNodeIdsRef.size`, so dropping a frame **with children** lit one cell per descendant —
   `gridDropTargetRef` briefly carried `count` = top-level dragged nodes only. Follow-up 2 (same
   day): the reading-order fill was `firstIndex + i` — it stomped cells already holding an
   anchored child (drop 3 into a 2×2 with the bottom row full → one landed on an occupied cell,
   grid didn't grow). Now `getGridDropPlacements` builds an occupancy set from the other children
   (`placeGridCells` + `occupyGridRegion`) and hands back the next *free* cells, so the ref is
   `{ cells, frameId }` and `applyGridDrop` just reads `cells[i]`. Follow-up 3 (same day): that
   drew ghost rows in the hover preview — but the spec was always "grow the grid only on drop", so
   `drawGridDropTarget` now caps at the current `rowCount` and omits any resolved cell that
   overflows (it's still placed, and the engine grows the grid, on drop).
10. **2026-09-10 — grid flow, Phase 3c: reading-order insertion indicator (§13 "Canvas — drag a
    child into a cell").** Cell-targeted drop (#9) had no way to insert *between* two occupied
    cells — hovering one only ever retargeted that exact cell. Added a vertical insertion bar,
    modelled on the linear auto-layout drop indicator but constrained to columns only (no
    between-rows indicator): hovering the half of an occupied cell whose same-row neighbour is
    free just highlights that neighbour (no indicator); hovering the half whose neighbour is a
    wall or also occupied arms an indicator on that side instead. The model was locked with the
    user turn-by-turn before coding, including a correction — the first pass only spelled out the
    left-hovering case; the user pointed out the right side is the mirror, not "keep today's
    behaviour". On drop, `applyGridInsert` / `getGridInsertPlacements` compute every other child's
    reading-order index, place the dragged nodes at the insert index, and **ripple** every child
    at or past it forward to the nearest free reading index (closing gaps rather than rigidly
    shifting everyone by N; a child already further out than the ripple reaches stays put) —
    anchoring every moved child and flipping `gridAutoPlacement: false`, same as a plain cell
    drop. `childIds` order is untouched; the reorder is anchor-only.
11. **2026-09-10 — grid flow, Phase 3d: reordering an already-placed child (§13 "Canvas — the grid
    drag ghost").** The user specified this mode turn-by-turn, again locked before coding: (a) an
    in-grid reorder drag uses the exact same slot/indicator UI as a fresh drop-in (it already did,
    by construction — the occupancy scan just excludes `movedNodeIds` regardless of where they came
    from) and several scattered selected children "merge" into adjacent free cells (also already
    true — `count` is just the selection size); (b) holding the modifier disables the mechanism
    entirely — `resolveDragReparentTarget`'s grid case gained `&& !isModifierHeld`, so no ref arms
    and nothing anchors on drop; the user's own follow-up clarified the dragged node still visually
    "pulls out of its slot" while every other child stays untouched, not literally frozen. That
    follow-up surfaced a **separate, real bug**: a dragged grid child didn't visually move *at
    all*, modifier or not — `dispatchDraggedNodeUpdates`'s live x/y dispatch was being immediately
    stomped back to the cell position by the grid engine's own `syncAutoLayoutChildren` resync on
    every frame. Fixed with a grid-specific analogue of the linear engine's own reorder ghost
    (§9): `gridDragGhostRef` (armed by `updateAutoLayoutReorderGhostPosition` whenever the dragged
    selection's *origin* parent is a grid frame, in place of the dispatch) carries just a raw
    cursor offset, consumed at render time only by `getGridDragRenderNode` /
    `getOverriddenGridDragAncestor` — no store x/y is ever written until the real drop commit.
12. **2026-09-10 — grid flow, Phase 3e: safe resizing (§ "Panel — resizing a grid that already has
    children").** Locked from a single Figma example the user gave — a 2×4 grid holding 6
    children, requested down to 1×1 — then a follow-up correction once a 2×2→1×2 case was raised:
    the user pointed out that even an *accepted* resize (capacity is fine) can still leave an
    anchored child's position invalid, and that has to be actively repaired, not just capacity
    gated. `resolveGridResize` does both in one pass: reject when the requested capacity can't
    hold every child (no dispatch, no silent "grow to fit" the way a *drop* is allowed to), else —
    for a frame already in manual placement — re-pack every child's *current* reading order into
    the new column count via a fresh auto-flow pass, persisting an anchor only for whoever's cell
    actually moved. Auto-placing frames need no repair pass; the live engine already re-flows them
    every render.
13. **2026-09-10 — grid flow, Phase 3f: stale Columns/Rows input after a rejected commit (§13
    "Panel — resizing a grid that already has children").** A direct consequence of #12's capacity
    guard: `GridInputCells`' text field is uncontrolled (`TextFieldWrapper` remounts the native
    `<input>` only when its `defaultValue` prop actually changes), so when a commit is rejected or
    ignored — the capacity guard, or an out-of-range/empty count — `value` never changes and the
    field is left showing whatever invalid text the user typed instead of snapping back to the
    real grid. Fixed with a local `revision` counter bumped on every commit attempt (accepted or
    not), folded into the `key` handed to `UITools.TextField` so the field always remounts to the
    current `value` prop after a blur or scrub, regardless of whether the store actually changed.
14. **2026-09-10 — grid flow, Phase 3g: Padding and child Fill were both still linear-only.**
    Neither gate had ever been widened for grid: `useColumnPadding`'s `isVisible` only checked
    `horizontal`/`vertical`, so the whole Padding row stayed hidden for a grid frame even though
    the grid engine already reads `getFrameLayoutPadding` (§13 engine notes above) — the row was
    simply never surfaced. Separately, `useColumnDimensions`'s `parentIsAutoLayout` (which gates
    `canFillWidth`/`canFillHeight`, and therefore whether the Width/Height sizing dropdown even
    *renders* — `ColumnDimensions.tsx`'s `showWidthDropdown = canHug || canFillWidth`) also only
    checked `horizontal`/`vertical`, so a grid child's sizing dropdown didn't show at all (not just
    missing the Fill option) since a plain child is never itself huggable. Both widened to include
    `LayoutMode.grid`; the reorganiser folded the second fix into the shared `isManagedLayoutFrame`
    predicate (now `undefined`-safe) that `useColumnPosition` and `isNodeManagedLayoutChild` already
    used, dropping their redundant `!== undefined &&` guards.
15. **2026-09-10 — grid flow, Phase 3h: a grid child's own cell alignment (§13 "Panel — a grid
    child's own cell alignment").** First draft built a whole second widget (own folder, own hook,
    own icon-option constants, own i18n keys) — flagged immediately ("Dlaczego duplikujesz ten
    panel? To ten co już jest w position. Tylko trzeba go ograć logiką pod grid." / "Why are you
    duplicating this panel? It's the one already in Position. You just need to wrap it with grid
    logic."): reverted the new folder entirely and made the *existing* `PositionSection/
    ColumnAlignment` grid-aware in place instead — same component, same hook, same icons, just a
    branch. Two follow-up corrections while implementing, both about scope creep: the icon-fill
    CSS used `:global()` unnecessarily (a local class already anchors the selector chain, matching
    `ActionsPanel__item:hover { [data-svg-property='fill'] {…} }` — dropped it); and the fix had to
    explicitly *not* fire for an absolute-position (`ignoreAutoLayout`) child ("Jak przełączam
    element w pozycje absolutną. To powinine aligment go puścić, dwa aligment działac jak w layout
    hor i vertical." — switching a child to absolute should release it from grid-cell alignment,
    same as it already behaves for a linear-layout child). That last point surfaced two separate,
    pre-existing, previously-undiscovered canvas bugs once actually tried by hand: dragging such a
    child snapped it back on release ("Jak go przesuwam to puszczeniu aligment ciągnie go jakby był
    w slot" — the grid-ghost mechanism in `updateAutoLayoutReorderGhostPosition` only checked the
    *parent's* layout mode, never whether the dragged child itself opted out, so its live dispatch
    was skipped and nothing ever committed the drop); and its old cell stayed marked occupied for
    every other grid drag/drop calculation ("ten slot nadal jest zajęty… kiedy wchodzi absolute to
    powinien zwolnić też slot" — `getGridPlacementInputs`, the one shared input-builder behind every
    occupancy scan, never excluded `ignoreAutoLayout` children the way the layout engine's own
    `getAutoLayoutSyncChildren` already did). Both fixed at their respective single choke points.
16. **2026-09-10 — grid flow, Phase 3i: wiring the Column span / Row span fields + spanning-child
    fallout (§13 "Panel — a grid child's own cell alignment" sibling paragraph, and "Canvas — drag
    a child into a cell").** The display-only span row (#8) became editable: `TextFieldWrapper` +
    `ScrubbableInput` adornment, `min={1}`, `max` from `getGridChildSpanBounds` — the contiguous
    free run of cells from the child's *own* position outward (right for columns, down for rows),
    stopping at another child or the grid edge, so a child mid-grid with a neighbour ahead of it
    can't be stretched over it (raised with a 4×1 and a 2×2 example — "trzeba sprawdzić czy
    wszystkie pola pod nim mają puste miejsce"). A scrub just stops at that bound and a typed
    out-of-range value is rejected (the scrubber clamps itself — no extra guard, per the user:
    "tylko o jedno podnieść" once it was over-engineered). Three self-inflicted bugs on the way, all reported live: (a) both sibling
    `<TextFieldWrapper>` fields were handed the **same React `key`** (`"1-0"` — `columnSpan` and
    `revision` both `1`/`0`), so React duplicated/omitted children and bled the scrubber state
    between them ("3 inputy?", "nie można z niego wyjśc"); (b) even with distinct keys, a `key`
    that changes per keystroke/scrub-step remounts the adornment mid-drag, killing the scrub after
    one step — fixed by dropping the outer `key` entirely and matching `PaddingInput`'s pattern
    (stable adornment; a rejected typed value reverts imperatively in `onBlur` via
    `event.target.value`); (c) `min === max` (grid affords a span of 1) fed a zero-range scrubber
    — a valid value now only dispatches when it actually differs from the current span, so a
    stuck-at-1 scrub is a no-op. Separately, wiring spans surfaced that **grid drop-hover was never
    span-aware**: hovering *inside* a child that covers several cells offered a reading-order
    insertion indicator at every interior track boundary. `resolveGridDropHover` now carries a
    `cellOwner` map next to `occupied` and, when the hovered cell's owner spans more than one cell,
    skips the indicator branch and resolves to the next free cell. And a grid *resize* now
    **resets every spanning child to 1×1** (`resolveGridResize.spanReset` → `commitGridSpanReset`)
    rather than trying to re-fit a 2×2 child into the new track grid — "less complication than
    resolving the grid against every child"; it also means `resolveGridResize`'s capacity check
    counts real cells again (a spanning child used to count as one).
17. **2026-09-10 — grid flow, Phase 3j: previewing a spanning child's slots while it's dragged
    (§13 "Canvas — drag a child into a cell" → "Spanning-child footprint preview").** Dragging a
    multi-cell child only ever lit its single anchor cell. Added `hover.previewCells`
    (`withGridSpanPreview`): the union of each dragged node's `columnSpan × rowSpan` footprint,
    drawn by `drawGridDropTarget` via `previewCells ?? cells` — cells past the grid edge are
    already skipped by the draw loop ("the grid grows on drop, not on hover"). Three follow-up
    corrections, all from hand-testing: (a) "na multiple to nie działa" — the first cut bailed
    unless exactly one node was dragged; generalised to union every dragged member's footprint;
    (b) "pozwala swoim rozmiarem nachodzić na inne elementy" — the footprint could be drawn over
    an occupied cell; `withGridSpanPreview` now drops any footprint cell `getGridOccupancyIndex`
    marks taken; (c) "dalej mogę nachodzić np. 2x1 na jeden slot który jest zajęty" — the preview
    was clipped but the *drop* still overlapped, because `getGridDropPlacements` only ever scanned
    for a free 1×1 anchor. Made that scan span-aware: it asks `isGridRegionFree` for the dragged
    node's whole footprint (span clamped to the column count to stay terminating), so the resolved
    anchor — and therefore both the preview and the committed drop — never overlaps another child
    or runs off the right wall. A fourth: "1x1 wylądował w środku 3x1" on a multi-select drop —
    `getGridDropPlacements` resolves `cells[i]` for `movedNodeIds[i]` (selection/click order),
    but `commitDropIntoFrame`'s `applyGridDrop` reads `cells[i]` for `nodeIds[i]` built in
    *sibling* order, so with a mixed selection the wide child could take the narrow child's anchor
    and swallow it. Extracted the ordering into `getDropNodeOrder(selectedIds, currentParent,
    rootOrder)` — sibling order, selection-order remainder — and fed the same list to
    `armGridDropTarget` (via `resolveDragReparentTarget`) and to `commitDropIntoFrame`, so the two
    ends agree.
18. **2026-09-10 — grid flow, Phase 5a: the dedicated Grid settings panel (§13 "Panel — the
    dedicated Grid settings panel").** A separate right-panel view (like `FrameTool`), opened by
    the GridArea popover's formerly-inert **Open grid settings** button, gated on a new
    `isGridSettingsPanelOpen` design-state flag. Per-track Fill/Fixed/Hug + value editing, a `+`
    to add a track, a `−` to delete the selected track(s), and drag-the-number-to-reorder with a
    white drop line — all writing the whole `gridColumnSizes` / `gridRowSizes` array the engine
    already resolves. Model locked with the user before coding (full-panel swap not a popover;
    reorder that would break a child's span is rejected and the row snaps back; opening the panel
    forces `gridRowCount` explicit; one commit). Delete clamps a covered child's span (or releases
    a single-cell child to auto-placement); reorder remaps every manually-anchored child's anchor
    index through the track permutation and bails if any child's `[anchor, anchor+span)` stops
    being contiguous. Pure helpers under `store/design/utils/autoLayout/gridTracks/`; the
    background reorganiser split the panel hooks/utils and generated their specs mid-build.
19. **2026-09-10 — grid flow, Phase 5b: live design iteration on the Grid settings panel (§13
    "Panel — the dedicated Grid settings panel").** A single fast back-and-forth session against
    the running panel turned up several real bugs the unit suite alone hadn't caught, each fixed
    at its root: (a) **opening the popover silently repacked the whole grid** — radix autofocuses
    a popover's first focusable child on open, which landed on the Columns count field; clicking
    **Open grid settings** (itself inside that popover) then blurred it, and the blur handler
    always re-ran `resolveGridResize` even when the typed value matched the current count, which
    unconditionally repacks manually-anchored children and resets spans. `commitGridColumnResize`
    / `commitGridRowResize` now no-op when the committed value equals the current (derived) count.
    (b) **`Icon`'s `className` prop silently discarded its own `"Icon"` class** — `Icon.tsx`
    rendered `className="Icon"` then spread `...restProps` (which includes any caller `className`)
    *after* it, so passing a `className` (needed here to lay out `RowGrabber` in the handle)
    overwrote `"Icon"` outright and with it the `svg-color` recolor mixin scoped to that class,
    leaving the icon stuck on its placeholder fill regardless of the `color` prop. Root-caused and
    fixed in the sibling `xigma-app-shared` repo (`packages/components/src/Icon/Icon.tsx`,
    `xigma-app-shared@6542778`): merge via `classnames` instead of a hard overwrite; hot-patched
    the built `node_modules/@xigma/components` artifacts here too so the fix took effect without a
    `xigma:pull` round-trip. (c) **the selection-follows-the-drag fix (History #18's reorder
    clearing) didn't survive undo** — the first pass compared a content signature (`{ mode, value,
    linkedIndices }` per track) to detect external changes; for the very common case of several
    identical `Fill, 1fr` tracks, undoing a reorder that swapped two of them produced a
    byte-identical signature, so the stale selection silently stuck at its old index. Replaced the
    signature with the `frame` node's own object *reference* (a new `revision` field on
    `TGridAxisControls`, threaded from `useGridSettingsPanel`/`makeAxisControls`) — Redux/Immer
    always gives an updated node a fresh reference, content-independent, so this is the reliable
    "did something external touch this axis" signal (§13 "Undo/redo safety"). (d) **grabbing one
    track of a 2-track span could never actually move it** — dragging a lone track that belongs to
    a spanning child always either breaks the span (rejected) or is a no-op, so the drag silently
    did nothing; added `getGridTrackLinkedIndices` + auto-extending an unselected grab to the whole
    group (§13 "Spanning-child linking"), with an explicit multi-selection still exempt so the
    rejection path stays reachable. (e) **Cmd+Z did nothing while focus sat in the panel's own
    value field or mode dropdown** — both `TextFieldWrapper` and `Dropdown` unconditionally mark
    themselves as global-shortcut-bypass targets, which is `useKeyboardHandler`'s intended
    behaviour for ordinary text editing but meant undo/redo were unreachable while still focused
    on a field just edited in this structural-editing panel; gave both an opt-out
    `bypassGlobalShortcuts` prop (default `true`, every other call site unaffected) that
    `GridTrackRow` sets to `false` for its two fields. Also: the drop indicator was back to being
    an in-flow flex sibling (History #18 already fixed this once; a subsequent tweak reintroduced
    it) — re-fixed as `position: absolute`, offset by `transform: translateY(index * 32px)`, so it
    never reflows the rows around it. Per-row `−` delete button (each row owns one, `visibility:
    hidden` unless hovered/selected) replaced the original single section-level button. Only one
    axis can hold a selection at a time (`useGridTrackSelectionCoordinator`, §13 "Only one axis
    selected at a time"), Columns defaults to track 1 selected. `d`, `e` and the undo-signature fix
    each got a red→green e2e regression (`grid.spec.ts`) since they're real-browser timing/focus
    bugs a synthetic event can't reliably reproduce.
20. **2026-09-10 — grid flow, Phase 5c: more Grid settings panel iteration.** Another fast pass
    against the running panel: (a) **the panel silently reopened on a reselect** — after
    deselecting a grid frame, `isGridSettingsPanelOpen` stayed set, so clicking the same frame
    again jumped straight back into the panel instead of the normal frame properties.
    `useCloseGridSettingsPanelOnReselect` (a `useLayoutEffect` in `PanelProperties`) now clears the
    flag the moment a selection reappears after having been empty. (b) **shift/ctrl-clicking a
    track's drag handle couldn't multi-select** — the handle's own `pointerdown` started a drag
    unconditionally, swallowing the modifier; `useBeginTrackHandleDrag` now routes a modified
    pointerdown to `onSelect` instead of the drag, and the handle `stopPropagation`s its own click
    so it never double-fires the row's handler. (c) **the last column/row couldn't be deleted** —
    the delete button was disabled at one track. It's now always enabled; deleting the final track
    of an axis calls `commitGridLayoutExit` — switches the frame to `LayoutMode.freeForm`, clears
    every `grid*` field on the frame and its children (plus the linear child-fill reset the manual
    Flow switch does), and closes the panel back to the element properties. (d) **a plain click on
    a member of a multi-selection didn't collapse it** — grabbing an already-selected row and
    releasing without moving left the whole group selected; `useGridTrackReorderDrag` now tracks
    `hasMoved`, and `commitGridTrackReorder` collapses to just the grabbed row's own linked group
    when released unmoved (a real move still reorders / rejects as before). (e) **the drop
    indicator and the row's drag dimming both showed at grab time, before any movement** — the
    indicator is now gated on `dragState.hasMoved`, and the `.GridTrackRow--dragging { opacity }`
    rule was removed outright (nothing should obscure the fields mid-drag). (f) **undo didn't
    carry the panel's selection** — after selecting 2 tracks, reordering them, and undoing, only 1
    stayed highlighted (History #19's blunt "external revision change → reset to the axis
    default"). The user's call was full history integration: undo/redo restores the selection
    exactly as it was at that point. `syncExternalGridTrackSelection` now keeps a
    `WeakMap<frameRef, number[]>` — it records the live selection per frame reference, and on a
    reference change *restores* the recorded selection if it's a reference the map has seen (an
    undo/redo landing, since `replaceDesignSnapshot` round-trips the exact historical node
    references), only falling back to the axis-default reset for a reference it never recorded
    (§13 "Undo/redo carries the track selection"). This flipped e2e #31 — undoing an add now
    brings back the pre-add selection instead of resetting. `a`–`f` each got a `grid.spec.ts`
    regression.
21. **2026-09-11 — grid flow, canvas↔panel track-selection ping-pong crash (§13 "Only one axis
    selected at a time").** Live use hit `Uncaught Error: Maximum update depth exceeded`,
    specifically with a 2-column-spanning child selected. Root cause took most of a session to
    isolate: `GridSettings` mirrored each `GridTrackList`'s selection into its own
    `columnSelectedIndices`/`rowSelectedIndices` state (via an `onSelectedIndicesChange` callback)
    and published *that* to `gridTrackSelection`; the mirror lagged one render behind the child's
    live selection whenever the child was *also* syncing an external (canvas-driven) value in the
    same cascade, so the parent intermittently republished the stale value, the child's own
    `syncExternalSelectedIndices` effect reacted to that publish and corrected itself, the parent's
    next render republished *its* now-stale copy back — an unbounded loop with two real,
    alternating values (`[0]` / `[0, 1]`), not a false-positive from a bad equality check (several
    were fixed along the way — order-insensitivity in two comparisons, a decentralized publish
    that still let both axes race when `activeAxis` was `null` — none of which were the actual
    cause). Confirmed by disabling the panel's publish entirely and watching the loop stop.
    Fixed by removing the reactive relay altogether rather than patching the comparison again (the
    user's explicit call, after three narrower fixes each reproduced the same crash): split
    `gridTrackSelection` into the two independent `gridTrackSelection` (canvas) /
    `panelGridTrackSelection` (panel) fields described above, with every interaction site writing
    both directly through `publishGridTrackSelection` and neither side ever watching-then-rewriting
    the other. This also **removed** the revision-keyed undo/redo selection-restore mechanism from
    #20(f) — it was wired through the same relay-based `useGridTrackList` — regressing e2e #37,
    left `test.skip`ped (accepted tradeoff, not reintroduced) rather than rebuilt on top of a
    mechanism just proven to cause this class of bug.
22. **2026-09-11 — grid flow, undo/redo restored for track selection (§13 "Undo/redo carries the
    track selection via the design snapshot itself").** Follow-up to #21's accepted regression.
    Root cause of *why* undo/redo used to work at all: node selection (`selectedIds`) was never
    special-cased for history — it just happens to live *inside* `TDesignPage`, and
    `getDesignSnapshot`/`handleReplaceDesignSnapshot` already capture/restore the whole `pages`
    record on every undoable action, so `selectedIds` rides along for free. `gridTrackSelection` /
    `panelGridTrackSelection`, by contrast, are top-level sibling fields on `TDesignState` outside
    `pages`, so the snapshot never touched them — that was the entire mechanical cause of the
    regression, not anything about the relay removal itself. Fix: added both fields to
    `TDesignSnapshot`, captured in `getDesignSnapshot` and restored in
    `handleReplaceDesignSnapshot`, mirroring the exact pattern `selectedIds` already uses. Neither
    field is in `historyMiddleware`'s `UNDOABLE_ACTION_TYPES` (selecting a track alone still isn't
    its own undo step), but every undoable action's pre-mutation snapshot now captures whatever the
    selection was at that instant, so undoing e.g. a two-track reorder restores both tracks
    selected at their old positions — no watcher, ref, or equality guard involved, just two more
    fields in an existing imperative snapshot/restore pipeline. Un-skipped e2e #37 (now passing) and
    reworded the doc/table entries that described it as a known regression.
23. **2026-09-11/12 — grid flow, editing a track's value directly on the canvas (§13 "Editing a
    track's value directly on the canvas").** New affordance: click a value pill that's already
    selected (a second plain click, not a double-click) to edit it in place, with the panel's exact
    fr/fixed/hug parsing and multi-selection propagation. First build used `useDoubleClickActivation`
    (the same mechanism `VectorWidthLabelEditOverlay`/frame-rename use) — dropped once the user asked
    for multi-selection to survive entering edit mode, since a double-click's own first pointerdown
    always runs the ordinary select-resolver first, collapsing any existing multi-selection before
    the dblclick handler even fires. Replaced with a dedicated pointerdown resolver
    (`armGridTrackValueEditOnPointerDown`), ordered *before* `armGridTrackAffordanceOnPointerDown`,
    that only claims the click when the index is already selected — dispatching a small
    `gridTrackValueEditRequest` redux field instead of local state, since a resolver has no React
    state to set directly; `useGridTrackValueLabelEditor` watches that field via `useSelector`. Two
    rendering-sync bugs surfaced once real (non-numeric, `"fr"`-suffixed) text needed to render
    inside the shared `CanvasValueLabelInput`: (a) the DOM input's `font-weight: 600` didn't match
    the MSDF atlas's `Inter-Regular` metrics the WebGL badge/grip/chevron geometry was computed from,
    so the two disagreed on how wide the same string was — fixed by pointing the input at the
    already-declared-but-unused `'Inter MSDF'` @font-face (the literal same `.ttf` the atlas was
    built from) instead of chasing the mismatch with padding constants; (b) for text long enough to
    hit the (separately, deliberately capped) 100px badge-width ceiling, the WebGL draw computed its
    *own* uncapped geometry from the full raw string independent of the input, so the two visibly
    diverged — fixed by extracting the clamp+pad bounds computation into
    `getGridTrackValueEditBounds` and having `drawGridTrackAffordanceExpanded` use it (and skip
    drawing the real glyphs entirely) whenever the pill it's drawing is the one currently being
    edited, rather than maintaining two independent geometry computations. Also added
    `data-test-bypass-global-shortcuts` to `CanvasValueLabelInput` (it didn't have it before; nothing
    that shared it needed to type letters like "f"/"r" that collide with tool shortcuts) — without it
    typing "fr" silently dropped those two keystrokes. Purely a test-authoring gotcha, not a product
    bug: e2e coverage for this needed `Meta` rather than `Control` as the multi-select modifier,
    since Chromium's macOS build treats a Control-held click as a contextmenu trigger (mimicking the
    native macOS convention) — harmless for the existing single ctrl-click assertions elsewhere in
    this file, but fatal for a test that clicks the canvas again afterward, since the still-open
    context menu silently swallows that next click.
24. **2026-09-12 — the Inside stroke/Strokes popover row was wrongly hidden under `updated`.**
    Entry #5 shipped `getFrameLayoutPadding` keyed on `strokeAlign === inside` for `updated` with no
    manual override, and hid the popover row entirely outside `legacy` — read at the time as "the
    toggle is gone" under the new engine. Checked against Figma's own docs
    (help.figma.com's auto-layout/Flexbox articles + the legacy `strokesIncludedInLayout` plugin-API
    property): that's wrong — `updated` still has a manual Included/Excluded toggle, it just only
    matters for a stroke that's already inside-aligned (a centered/outside stroke is unconditionally
    excluded regardless of the toggle). Fixed by reusing the same `insideStroke` field for both
    versions — `strokeAffectsLayout` in `getFrameLayoutPadding.ts` now requires `strokeAlign ===
    inside` *and* `insideStroke === included` for `updated`, `insideStroke === included` alone for
    `legacy` — and always rendering the row, labeled "Strokes" under legacy (matching Figma's own
    label there) and "Inside stroke" under updated. No new field, no change to how `strokeAlign`
    itself gets set (still code-only, see entry #5). Added a dedicated `PreviewInsideStrokeUpdated`
    (single-tile) preview component alongside the existing two-tile `PreviewInsideStroke`, since
    Figma's own mini-preview graphic for this row differs by version too;
    `getPreviewContent.ts` picks between them off the same `isLegacyLayout` flag used for the label.
25. **2026-09-12 — grid flow, picking a track's mode from its chevron on the canvas (§13 "Picking
    a track's mode from its chevron, on the canvas").** New affordance: the pill's chevron band,
    previously just part of the generic click-anywhere-selects-and-opens-the-panel fallback, now
    opens an on-canvas dropdown with the same three mode options as the panel's own `GridTrackRow`
    dropdown. First attempt reused the generic fallback's selection recomputation unchanged (only
    branching *after* selection on which action to dispatch) — broke exactly the multi-selection
    case the value-edit feature (#23) already had to solve: a plain chevron click always recomputes
    the click's indices via `getGridTrackAffordanceClickIndices`, which for an unmodified click
    always collapses to `[index]`, so opening the menu on one track of an existing multi-selection
    silently dropped every other selected track *before* the menu even opened — caught by a new e2e
    test, not the unit suite (the unit specs mock `canvasRefs`/`dispatch` directly and don't exercise
    two sequential real clicks). Fixed in `armGridTrackAffordanceOnPointerDown.ts` itself (no
    separate earlier resolver needed, unlike #23): the selection recompute is skipped — leaving
    `currentIndices` untouched — specifically when `hoveredHandlePart === 'chevron'` *and* the
    clicked index is already in the current selection; otherwise it behaves like any other click
    (collapses to just that track, same as clicking the value or grip band). Reused rather than
    duplicated: `TRACK_MODE_OPTIONS`/`getTrackModeOptions`'s icon+label-key table and
    `roundTrackSize`, relocated from the panel's `GridTrackRow` folder into
    `store/design/utils/autoLayout/gridTracks/` (mirroring the earlier relocation of
    `commitGridAxisValueChange`/`commitGridAxisModeChange`/`parseFillFieldInput` for the same
    reason) so the canvas overlay's `getGridTrackModeMenuOptions` could build byte-identical labels
    without hand-duplicating the `{{value}}` interpolation rules; `getGridAxisTrackCount` (already
    shared) turned out to be an exact pre-existing duplicate of the value-edit overlay's own
    file-local `getGridTrackEditTrackCount` — used the shared one for the new code rather than
    adding a third copy, but left the older duplicate alone (out of scope for this change).
