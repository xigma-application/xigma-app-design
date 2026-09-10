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
`alignTextBaseline` (`off | on`), `insideStroke` (`included | excluded`, **legacy only**),
`strokeAlign` (`center | inside | outside`, default `center` — the updated-version switch for whether
a stroke affects layout). `TBaseNode.ignoreAutoLayout` opts a single child out entirely.

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

RightPanel controls: `LayoutSection/ColumnDimensions/` (W/H + the Fixed/Hug/Fill menu),
`ColumnMinMaxDimensions/` (min/max fields; `useColumnMinMaxDimensions.ts` clamps on commit, `<= 0`
clears the bound), `ColumnFlow/` (flow + wrap), `ColumnClipContent/`.

## 4. Padding & gap

**Math.** `getFramePadding` = the raw `frame.padding* ?? 0` on each side. `getFrameLayoutPadding(frame,
layoutVersion)` optionally adds `frame.strokeWidth` to all four sides when the frame stroke affects
layout:

```ts
strokeAffectsLayout = layoutVersion === legacy
  ? (frame.insideStroke ?? included) === included          // the popover toggle
  : (frame.strokeAlign  ?? center)   === inside;            // updated: only inside strokes count
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
| 2, 3 | Only inside strokes affect layout; the toggle is gone | `getFrameLayoutPadding.ts` | keyed on `strokeAlign === inside` (no toggle) | keyed on the `insideStroke` popover toggle |
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
| Inside stroke | `layoutVersion === legacy` only | `insideStroke` | legacy branch of `getFrameLayoutPadding` — `included` adds the frame stroke width to all four padding sides |
| Canvas stacking | not grid | `canvasStacking` | `getFrameChildIdsInPaintOrder(frame)` = `firstOnTop ? [...childIds].reverse() : childIds`; used by `renderClippedFrame` / `renderFrameNode` / `getRenderOrderedNodes` |
| Align text baseline | horizontal only | `alignTextBaseline` | `getAutoLayoutSyncPositions` gates it to horizontal+`on`; then text children align by baseline (`counterOffset = maxBaseline - getAutoLayoutChildBaselineOffset(child)`, `getTextBaselineOffset(fontSize)` from the MSDF atlas metrics) and the frame's counter hug size uses `getAutoLayoutBaselineExtent` |
| Auto spacing | not grid; disabled unless the primary gap mode is auto | `autoSpacing` | `getAutoLayoutPrimarySpacing`: `between` / `around` / `evenly` (§2) |
| Layout version | always | `layoutVersion` | `legacy` vs `updated` (§6) |

The popover also renders a live mini preview (`PopoverAutoLayoutSettingsPreview/`) driven by hover
over each row. Per-child `ignoreAutoLayout` is a separate toggle (not in this popover).

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
holds `GridInputs` (two `GridInputCells` — `TextField` + `ScrubbableInput` 1–100, as shrinking
flex items so they fit the 210px), `CellsInput` (a 12×8 `data-value="col.row"` pick matrix of
`<button>`s, each `<Tooltip>`-wrapped so hover shows `"CxR"`), and an inert full-width **Open grid
settings** outline button (placeholder — no handler yet). `useColumnGridArea` is the single hook
(returned from `useColumnAlignmentLayout` as `gridArea` and passed whole into `<GridArea grid=…>`):
columns/rows come straight from the store, commit on blur via `clampGridCount` +
`commitGridColumnCountChange` / `commitGridRowCountChange` (no-op on empty / out-of-range),
`onClickCell` writes both at once. The **Rows** field has a chevron menu (`GridRowsModeMenu` in a
`UITools.ButtonMenu`) — **Auto** clears `gridRowCount` (`commitGridRowsAuto`), the fixed item pins
it to the current effective count; when Auto the field shows the effective count
(`getEffectiveGridRowCount` = `ceil(childCount / columns)`) as the label "Auto". No per-track
sizing UI (deferred).

### Not covered yet

Per-track Fixed/Hug/Fill controls and on-canvas track pills (the engine already resolves
`gridColumnSizes` / `gridRowSizes` — UI is the last phase), `gridAutoPlacement` toggle UI,
empty-cell rendering, drag-a-child-into-a-cell drop target, span edge-handles, auto-placement
obstruction reflow, arrow-key reorder, ⌘D-into-next-cell, track reorder/delete. The engine already
honours spans and manual anchors when set in code.

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
  `syncAutoLayoutChildren/test/getGridLayoutSyncPositions.spec.ts`; panel —
  `ColumnAlignmentLayout/GridArea/**/*.spec.tsx` (`GridArea`, `GridAreaPreview`, `GridAreaPopover`,
  `GridInputs`, `GridInputCells`, `CellsInput`, `useCellsInput`) and
  `ColumnAlignmentLayout/hooks/**` (`useColumnGridArea`, `clampGridCount`,
  `getEffectiveGridRowCount`, `commitGridColumnCountChange` / `commitGridRowCountChange`).
- **e2e — grid:** `e2e/design/auto-layout/grid.spec.ts` — the Flow toggle's Grid button, and the
  `GridArea` popover's Columns field + 12×8 pick matrix, driving the engine + canvas.

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
