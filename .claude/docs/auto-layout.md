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
→ `{ columnCount, columnGap, columnSize, padding, rowCount, rowGap, rowSize }` —
`columnCount = gridColumnCount ?? 1`,
`rowCount = max(gridRowCount ?? getDerivedGridRowCount, getDerivedGridRowCount)` (so an anchored
child in a far row shows real rows), gaps
`horizontalGap` / `verticalGap`, padding `getFrameLayoutPadding`, and **uniform `1fr` tracks**
(`(content − gaps) / count`). `getGridSlotRect(layout, frame, column, row)` turns one cell into a
world rect. This matches the engine while every track is `1fr`; per-track sizing (next) swaps the
uniform split for `resolveGridLayout`'s resolved sizes.

When a single `LayoutMode.grid` frame is **selected**, `drawGridSlots` (`getSelectedGridFrame`
gate, in `drawScene` next to the padding/gap handles) strokes every cell faint blue
(`GRID_SLOT_STROKE`), rotation about the frame centre like the padding guides.

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
  land past the current grid. `hover.cells` is set, `hover.indicator` is absent.
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
  `getGridOccupancyIndex`, `resolveOccupiedCellHover`, `getGridDropPlacements`).

`drawGridDropTarget` branches on `hover.indicator`: if set, it draws a single vertical bar
(`getGridInsertIndicatorRect` — centred in the gap on that side of the cell, or clamped to the
frame's content edge for a wall) filled `FRAME_DROP_TARGET_STROKE`, the same colour/thickness as
the linear auto-layout drop indicator. Otherwise it draws the grid at its **current** `rowCount`
and fills the resolved cells that fall inside it, omitting any that overflow (the grid grows on
drop, not on hover) — `GRID_SLOT_ACTIVE_FILL` at `GRID_SLOT_ACTIVE_FILL_ALPHA`, marquee-style.
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

Per-track Fixed/Hug/Fill controls and on-canvas track pills (the engine already resolves
`gridColumnSizes` / `gridRowSizes` — UI is the last phase), `gridAutoPlacement` toggle UI,
occupied-vs-empty cell styling, span edge-handles (canvas resize-to-span), auto-placement
obstruction reflow, arrow-key reorder, ⌘D-into-next-cell, track reorder/delete. The Column span /
Row span fields are wired (`ColumnGridChildSpan`); the engine already honours spans and manual
anchors when set in code.

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
  `syncAutoLayoutChildren/test/getGridLayoutSyncPositions.spec.ts`; canvas slots + drop —
  `store/design/utils/autoLayout/test/{getSelectedGridFrame,getDerivedGridRowCount,getGridPlacementInputs}.spec.ts`,
  `src/utils/canvas/gridSlots/test/*` (`getGridTrackLayout`, `getGridSlotRect(s)`,
  `getGridDropCell`, `getGridInsertIndicatorRect`) +
  `gridSlots/resolveGridDropHover/test/*` (`getHoveredGridCell`, `getGridOccupancyIndex`,
  `resolveOccupiedCellHover`, `getGridDropPlacements`, `resolveGridDropHover`),
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
  of colliding, the shared Alignment widget moving a grid child within its own cell, and an
  absolute-position grid child dragging freely instead of snapping back — driving the engine +
  canvas.

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
