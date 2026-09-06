# Auto-layout — test case catalog

Test cases for the auto-layout engine's canvas/RightPanel integration that live in
`e2e/design/auto-layout/`. The position math itself (padding, alignment, hug/fixed sizing, wrap,
treating vector/line/text children as boxes) is exhaustively covered by the unit suite under
`src/store/design/utils/autoLayout/test/`; these e2e tests exist for the parts only a real browser
proves: the RightPanel's Flow toggle (`ColumnFlow`) actually dispatching into the store, a live
reflow repainting the WebGL canvas, and the real drag-into-frame gesture (not a synthetic
`updateNode` call) reparenting a node through the auto-layout drop-indicator path built earlier
this session.

## Flow (Horizontal / Vertical)

| #   | Scenario                                                                                             | Unit |                        E2E                        |
| --- | ---------------------------------------------------------------------------------------------------- | :--: | :-----------------------------------------------: |
| 1   | Switching a frame's Flow between Horizontal and Vertical reflows its children on the canvas          |  ✅  |        ✅ `flow.spec.ts` (round-trip test)        |
| 2   | Switching back to a previously-used Flow direction restores a pixel-identical layout                 |  —   |        ✅ `flow.spec.ts` (round-trip test)        |
| 3   | A child dragged into an already-Horizontal frame joins the row live, no re-toggle needed             |  —   |     ✅ `flow.spec.ts` (horizontal-grows test)     |
| 4   | Vertical flow arranges mixed node types (rectangle, ellipse, line) as boxes, same as Horizontal      |  ✅  |     ✅ `flow.spec.ts` (mixed-node-types test)     |
| 5   | Setting Flow to Vertical for the first time spreads out children that were freely overlapping        |  —   |   ✅ `flow.spec.ts` (vertical-cold-start test)    |
| 6   | Deleting a child from a Horizontal-flow frame closes the gap live for the remaining children         |  ✅  |    ✅ `flow.spec.ts` (delete-closes-gap test)     |
| 7   | Horizontal flow packs five children into a single row, not just the two or three the other tests use |  —   | ✅ `flow.spec.ts` (horizontal-five-children test) |

Each test builds its frame by dragging children in from outside the frame's own bounds — drawing a
shape directly over a frame's area does **not** auto-parent it (only a real drag through the
drop-indicator path, or a Layers-panel reparent, does) — so this also exercises the drag-into-frame
gesture live, not just the Flow toggle in isolation.

## Reordering a child within its own frame

| #   | Scenario                                                                                                                                                                                                                                    | Unit |         E2E          |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: | :------------------: |
| 1   | Dragging a child to a new position among its own siblings reorders it, without ejecting it                                                                                                                                                  |  —   | ✅ `reorder.spec.ts` |
| 2   | Dragging a child swaps past a sibling the instant it touches that sibling's own near edge (not its midpoint), and reverts at that same edge                                                                                                 |  —   | ✅ `reorder.spec.ts` |
| 3   | Dragging a multi-node selection reorders the whole block together, preserving the block's own current relative order (not selection/click order)                                                                                            |  ✅  | ✅ `reorder.spec.ts` |
| 4   | Wrap: nudging a child that sits alone on its own row doesn't perturb the siblings on a different row                                                                                                                                        |  ✅  | ✅ `reorder.spec.ts` |
| 5   | Wrap: a dragged multi-row block previews as its own individual members, not one merged bounding box                                                                                                                                         |  ✅  | ✅ `reorder.spec.ts` |
| 6   | Wrap: moving a child into another row keeps the reorder's whole-cell (edge-based) insert zone instead of a half-cell midpoint one                                                                                                           |  ✅  | ✅ `reorder.spec.ts` |
| 7   | Wrap: a child dragged toward another row can be dropped straight back onto its own vacated slot                                                                                                                                             |  ✅  | ✅ `reorder.spec.ts` |
| 8   | Wrap: a dragged multi-node block lands by reading-order slot minus the grabbed member's offset within the block                                                                                                                             |  ✅  | ✅ `reorder.spec.ts` |
| 9   | A dragged multi-node block's ghost shows its members merged into their final layout (contiguous, right gap/order) and rides the cursor as one unit — for plain horizontal / vertical, not only wrap                                         |  ✅  | ✅ `reorder.spec.ts` |
| 10  | The internal arrangement of the block's ghost re-tweens (200 ms) when it changes mid-drag — e.g. a companion flips from the right of the cursor to its left near the last slot — while the grabbed member keeps tracking the cursor exactly |  ✅  |          —           |
| 11  | Non-adjacent block (e.g. {1,4}): siblings make room for the block's individual members, not one merged bounding box spanning the members it straddles                                                                                       |  ✅  | ✅ `reorder.spec.ts` |

This is the one path here that a unit test genuinely can't stand in for: the real position math
(`getAutoLayoutDropTarget`'s `siblingPositions`, the live tween in `animateAutoLayoutReorder`) is
already covered exhaustively at the unit level, but whether an actual pointer drag ends up
committing the right index — real `mousedown`/`mousemove`/`mouseup` timing, not a synthetic
`moveNodes` dispatch — is only provable in a real browser. Asserted via the Layers panel's exact
row order (precise and unambiguous) rather than a canvas screenshot diff, since the three children
are identical green squares and a pixel diff would tell you _something_ changed without saying
what.

### Multi-node reorder was a genuinely missing mechanism, made of three separate bugs

#3 above didn't exist before — dragging more than one selected child inside an auto-layout frame
silently did nothing (or worse, swapped the two dragged nodes with each other). Three independent
bugs stacked up:

1. `updateAutoLayoutReorderGhostPosition.ts` only ever wrote a ghost position for the drag into the
   preview ref when exactly one node was selected (`selectedNodes.length === 1`); for 2+ it fell
   back to `dispatchDraggedNodeUpdates`, a plain positional dispatch that the auto-layout engine's
   own resync immediately overwrote on every tick — the dragged block never visibly moved. Fixed by
   writing a ghost position for every selected node, unconditionally.
2. Even with (1) fixed, the pointerdown for a 2-node, same-size, adjacent selection never reached
   the general drag/reorder resolver at all — `armSmartSelectionSwapOnPointerDown` (and the
   `...Gap...` sibling) claim that exact shape (see `smart-guides.md`'s sibling doc,
   `getSmartSelectionSwapHandleAtPoint`) earlier in `ARM_RESOLVERS`, arming their own
   `swapDragRef`/`gapDragRef` instead of the ordinary `dragStateRef` `continueDrag.ts` reads. Fixed
   by having both resolvers skip claiming the event (`isNodeAutoLayoutChild`, `utils/canvas/signals/`)
   when the involved nodes are children of an auto-layout frame — Smart Selection swap/gap doesn't
   understand auto-layout positioning at all, so deferring to the (already more general) auto-layout
   reorder mechanism is strictly correct, not just a workaround. `drawSmartSelectionHandles.ts` also
   now skips drawing its handles/shadow entirely while a plain move drag is active
   (`draggedNodeIdsRef !== null` — move only, not resize/rotate, since those never populate that
   ref), so the now-non-functional-here handles don't linger on screen mid-drag either.
3. `commitDropIntoFrame.ts` built the `moveNodes` `nodeIds` array straight from `selectedIds` —
   click/selection order, not the dragged nodes' own current spatial order. Selecting a
   bottom-then-top pair (shift-click in that order) and dragging them together committed them in
   that same (visually backwards) order, silently swapping the pair relative to each other even
   though the user only meant to move them as a block. Fixed by deriving the commit order from the
   nodes' own current parent's `childIds` (or `rootOrder`), falling back to selection order only for
   ids that don't share that common parent (an already-dubious pre-existing edge case, left
   unregressed rather than "fixed" further).

Reproduced and fixed live (2026-09-05) after the user found it by hand — no automated test caught
any of the three until these were added afterward, one `e2e/design/auto-layout/reorder.spec.ts` case
per distinct symptom (bugs 1+2 together, since they only manifest combined; bug 3 specifically via a
reversed-click-order case) plus matching unit coverage on each of the four touched files.

### Wrap reorder: a dragged child's own row used to vanish, not just its indicator

Found live by the user (2026-09-05), right after the wrap-aware drop-indicator work above:
same-parent reorder for a wrapped frame reused `getAutoLayoutWrappedDropTarget`, but that function
never received `originalIndex` at all — it was silently dropped at the call site. For a cross-parent
drop this doesn't matter (there is no original index), but for a same-parent reorder the dragged
child is excluded from the sibling list passed in (it's the node being moved), so if that child was
**alone on its own row**, removing it collapsed that row out of existence entirely. The cursor,
still squarely over where that row used to be, then misresolved into a neighbouring row — dragging
unrelated siblings there along with it even though they no longer fit.

Fixed by threading `originalIndex` through to `getAutoLayoutWrappedDropTarget`, which reinserts a
placeholder at that index _only_ for the row-detection step (`getAutoLayoutCursorRowRange`), so the
dragged child's own row still exists for cursor purposes, then maps the detected row back to real
(placeholder-free) sibling indices for the actual insertion-index math. The resulting sibling
positions are now also computed by re-running the real wrap engine
(`getAutoLayoutWrappedChildPositions`) over the full simulated array with the dragged item inserted
at its resolved index — not just the affected row in isolation — so a child that can't coexist with
its neighbours on one row correctly cascades the rest onto the next row(s) live, matching what
committing the drop would produce anyway (mirrors Figma: dropping an item the combined size of two
siblings pushes both of them onto the next row rather than overflowing the first).

### Wrap reorder: a dragged multi-node block was modelled as one merged bounding box

Found live by the user (2026-09-05), the last of the wrap-reorder issues. Dragging a multi-node
selection whose members span more than one wrap-row in the current layout (e.g. the block `{3,4,5}`
out of rows `[1,2] / [3,4] / [5,6]`) previewed wrongly: the siblings below the drop (`1` and `2`)
slid down _together_ by a whole extra row instead of redistributing (`1` up into row 2, `2` into
row 3, `6` holding) — even though releasing the drag committed exactly that redistribution.

The live preview represented the whole selection as a single placeholder sized to
`getNodesBoundingBox(selectedNodes)` — for `{3,4,5}` a 100×100 square (3 and 4 side by side, 5
beneath). The wrap engine then treated that as one item occupying a full double-height row of its
own, so everything after it dropped a row too far. Fixed by passing the dragged block's members as
their own individually-sized entries (`getAutoLayoutOrderedDraggedSizes`, ordered by the parent's
own `childIds`, each tagged `__dragged__` so it's still filtered out of the returned positions) and
splicing all of them into the simulated array — so the wrap re-flow the preview runs is the same
one the commit runs. The e2e case samples a single pixel in the row-3 band mid-drag (held, before
release): gray there means a sibling was shoved down a row too far; empty means the block reflowed
as its real members.

### Wrap reorder: crossing rows collapsed the insert zone to a half-cell

Found live by the user (2026-09-05). Once a child was dragged into a row it didn't originate from,
the "insert before this neighbour" zone shrank to the left _half_ of the neighbour's cell — cross
its horizontal midpoint and the dragged child snapped back to its old position even though the
cursor was still plainly over the neighbour.

`getAutoLayoutWrappedRowBounds` was handing the row-scoped `getAutoLayoutDropTarget` a `null`
`rowOriginalIndex` whenever the drag's origin fell outside the cursor's row, which drops
`getAutoLayoutDropInsertionIndex` onto its midpoint threshold (`start + size / 2`). A same-parent
reorder is supposed to use edge-based thresholds (the whole cell, no dead zone) — the same ones the
non-wrap path already uses. Fixed by always passing `originalIndex - realStart`: it lands in
`[0, row length]` for a same-row drag, goes negative when the child came from an earlier row (no
member is "before" the origin → near-edge threshold, generous "insert after") and `>= row length`
when it came from a later row (every member is "before" it → far-edge threshold, the neighbour's
whole cell is the "insert before" zone). Only a genuine cross-parent drop keeps `null`/midpoints.

### Wrap reorder: the vacated slot was gone the instant the drag started

Found live by the user (2026-09-06). Reordering `3` out of rows `[1,2] / [3,4] / [5,6]`: the moment
the drag began, `4` slid left into `3`'s slot and left a hole at its own — and there was no cursor
position that put `3` back where it started; dropping over its own row committed `[1,2,4,3,5,6]`.

The non-wrap reorder path never had this because the sibling positions it compares the cursor
against come from the store, which still holds the pre-drag layout mid-drag — so `4` is still at its
own x and `3`'s slot is still open. The wrap path instead **recomputes** positions with
`getAutoLayoutWrappedChildPositions` over the real siblings (`3` already excluded), so `4` was
placed at the row's left wall and its near-edge insert threshold made `3`'s slot unreachable. Fixed
by feeding that recompute a `getAutoLayoutReorderOriginChildren` list — the real siblings plus a
placeholder for the dragged item back at its origin index — then dropping the placeholder's own
entry, so every real sibling keeps its pre-drag position for index resolution (the sibling ghost
positions are still computed separately and do reflow).

### Wrap reorder: a multi-node block landed one slot off, ignoring which member you grabbed

Found live by the user (2026-09-06). Non-wrap multi-node block reorder works fine — one axis, so
"which slot is the cursor over" maps straight to a splice index. Wrap has two axes: the old wrap
path computed the block's insertion index _row-scoped_ (`realStart + rowDropTarget.index`) against a
re-simulated collapsed layout, and never accounted for which member of the block the pointer went
down on. Grabbing `{3,4}` by `3` vs by `4` gave the same result, one slot off from where the block
should land.

Agreed model (matches Figma): the block is a contiguous run ordered by `childIds`; it lands at
`clamp(readingOrderSlot − grabbedIndexInBlock, 0, siblingCount)` in the reduced (block-removed)
list, where `readingOrderSlot` is which grid slot the cursor is over **in the current, on-screen
layout** (walk rows top-to-bottom, items across, an item passed once the cursor clears its far
edge), and `grabbedIndexInBlock` is the grabbed member's position within the block. The commit
already re-orders the moved ids by `childIds` and splices them contiguously, so only the index math
had to change.

Implemented for wrap + same-parent + `≥2` selected only (`armAutoLayoutMultiRowReorderPreview`):
`getAutoLayoutReadingOrderSlot` does the 2D slot count from the children's real bounds; the grabbed
member is captured at pointer-down as `dragState.grabbedNodeId` (`armDrag` — the hit node, or the
nearest selected node when the pointer went down in the gap between block members) and threaded
through `continueDrag → updateDragDropTarget → resolveDragReparentTarget → armAutoLayoutDropTarget`.
Non-wrap, single-node wrap, and cross-parent drops are untouched.

### The dragged block's ghost now shows the final layout — for every flow, not just wrap

Found live by the user (2026-09-06). Two related gaps once the wrap block-reorder felt right:

1. **The block's ghost kept its pre-drag geometry.** Selecting `{2,4}` (non-adjacent) and dragging
   showed `2` and `4` still a gap apart with `3` visually between them — not how they land. The
   ghost should show the block **merged into its committed layout** (contiguous, correct
   gap/order), and near a boundary the companion should sit on whichever side of the cursor it will
   actually land (a flip from right-of-cursor to left-of-cursor as you cross the last slot's
   midpoint) — while the grabbed member keeps riding the cursor pixel-for-pixel. The block still
   moves as one unit; only the offsets between members change, and they **tween** (200 ms, same
   easing as the sibling reflow) when they change, with a `requestAnimationFrame` settle so the
   animation finishes even if the pointer stops. Modelled as `draggedMemberSlots` (each member's
   final slot) + `draggedGrabbedId` on `TAutoLayoutReorderPreview`; the ghost picks which slot the
   cursor is nearest and swaps that slot with the grabbed member's. Wrap already computed the
   per-member slots (`getAutoLayoutWrappedDraggedMemberSlots`); the non-wrap path gained the
   one-axis equivalent (`getAutoLayoutDraggedMemberSlots`), so horizontal and vertical get the same
   ghost. The commit index is unchanged.

2. **The non-wrap sibling reflow modelled the block as one merged bounding box.** Same class of bug
   as the wrap "merged bounding box" case (#5 / _Wrap reorder: a dragged multi-node block was
   modelled as one merged bounding box_ above), but in `getAutoLayoutDropTarget`: `getNodesBoundingBox({1,4})`
   spans all four cells, so dragging `{1,4}` shoved `2` and `3` a full row-width to the right — out
   of the frame, into slots the ghost never showed. Fixed by `getAutoLayoutSingleLineSiblingPositions`
   (mirror of `getAutoLayoutWrappedSiblingPositions`): simulate the reflow with the block's
   individual `draggedSizes` spliced in, not one placeholder. Applied only for same-parent
   multi-node reorder (`getSingleLineReorderDropTarget`); single-node reorder and the cross-parent
   drop indicator keep the merged placeholder.

### A real, pre-existing selection bug found while writing these tests

Reselecting the frame after giving it a child was originally attempted with a plain canvas click on
the frame's own empty body (the same pattern `frame-nested.spec.ts` uses successfully for a
_freeform_ frame). That reproducibly failed here: **once a frame has any child at all — regardless
of `layoutMode`, and regardless of whether the child was nested via a canvas drag or a Layers-panel
drag — a plain click on the frame's own empty body deselects everything instead of selecting the
frame.** Confirmed with `layoutMode` unset (freeform) too, so it isn't specific to auto-layout.
`frame-nested.spec.ts` itself is currently failing at HEAD independently of this work (times out
much earlier, building its own nested-frame fixture), so this looks like a real, currently-broken
regression somewhere in canvas click hit-testing, not something introduced by the Flow work.

Worked around here by reselecting through the frame's own **Layers panel row** instead
(`useSelectTreeItem` — a separate selection path with no canvas hit-testing involved), which is
unaffected. The underlying canvas-click bug is still open and worth its own investigation/fix; these
tests don't attempt to root-cause or resolve it, only to route around it so Flow itself stays
covered.

## Drop indicator positioning

| #   | Scenario                                                                                                                                       | Unit |                                                E2E                                                |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------- | :--: | :-----------------------------------------------------------------------------------------------: |
| 1   | Indicator centres in the real gap between two siblings (or the frame's edge) instead of sitting flush against the next one, Top-left alignment |  ✅  |                            ✅ `horizontal-indicator-positions.spec.ts`                            |
| 2   | Centre alignment never hugs a frame edge for the first/last position — always the gap's own midpoint, on both axes                             |  ✅  | ✅ `vertical-indicator-positions.spec.ts` / `horizontal-indicator-positions-center-right.spec.ts` |
| 3   | Bottom/Right alignment hugs the correct far edge, anchored to the indicator's own thickness rather than the dragged item's full size           |  ✅  | ✅ `vertical-indicator-positions.spec.ts` / `horizontal-indicator-positions-center-right.spec.ts` |
| 4   | Wrap: the indicator resolves against the real row/column the cursor is actually over, ignoring whether the dragged item would fit there        |  ✅  |                               ✅ `wrap-indicator-positions.spec.ts`                               |

Found live by the user across several rounds of screenshots/manual dragging (2026-09-05), not from a
pre-existing report. Four distinct, compounding issues in the same drop-indicator math:

1. **Flush-against-the-next-sibling, not centred in the gap.** The indicator's position was taken
   straight from a full simulated re-pack of the dragged item into the child array, which places its
   leading edge exactly `itemSpacing` away from the previous sibling — i.e. flush against the next
   real (unmoved) sibling's own edge, not centred in the gap. Fixed in `getAutoLayoutDropTarget` by
   deriving the primary-axis coordinate directly from the real neighbour(s) (`previousEnd +
itemSpacing / 2`, mirrored for "no previous"), independent of simulation.
2. **Edge-hugging applied unconditionally regardless of alignment.** The "snap to the frame's own
   edge" special case (for the very first/last child) fired for every alignment, when it should only
   apply on the end of the primary axis that alignment actually anchors to — Centre alignment has no
   fixed edge on _either_ end. Fixed via `getAutoLayoutPrimaryAnchoredPosition`, which only hugs an
   edge when `primaryAlign` matches that end (`start` for the leading edge, `end` for the trailing
   one); otherwise it's the same gap-midpoint formula as any middle insertion.
3. **The Bottom/Right edge-hug itself was wrong by the dragged item's own size.** Even once (2)
   correctly identified _when_ to hug the far edge, the position used was the packed item's own
   near edge — which sits `draggedSize` away from the actual far edge, since the indicator is a thin
   3px bar, not the full item. Fixed by anchoring to `simulatedPrimary + draggedPrimarySize -
INDICATOR_THICKNESS_PX` instead.
4. **Wrap wasn't wired into the drop-target math at all.** `armAutoLayoutDropTarget` always used the
   plain single-line `getAutoLayoutDropTarget`, which compares the cursor against every sibling's
   primary-axis position in flat `childIds` order — meaningless once a frame has wrapped, since a
   second row's near-zero primary position can sort _before_ a first-row sibling. This produced
   index/indicator mismatches and items snapping to the wrong row entirely. The fix went through two
   designs: first a brute-force "simulate every insertion index, pick whichever ends up closest to
   the cursor" search (correct for same-size items, but let a narrow item "escape" to a different,
   nearer-fitting row the user was never actually hovering over); then a full pivot, prompted by the
   user pointing out Figma doesn't reason about fit at all — `getAutoLayoutWrappedDropTarget` now
   detects which real row/column the cursor is over (`getAutoLayoutCursorRowRange`, from the
   **current**, pre-drag layout) and delegates straight to the already-correct single-line
   `getAutoLayoutDropTarget`, scoped to just that row's own real members and its own band as a
   mini-frame (`getAutoLayoutRowFrame`) — regardless of whether the dragged item would actually fit;
   the real wrap engine re-flows the true geometry once the drop commits.

### The dragged ghost was clipped by the frame it was leaving

| #   | Scenario                                                                                                                                             | Unit | E2E |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | :--: | :-: |
| 1   | A node dragged out of a clipping frame toward another frame's auto-layout drop target renders unclipped (only the drop indicator was visible before) |  ✅  |  —  |

Found live by the user (2026-09-06). Dragging a child out of a nested `clipContent` frame toward an
_auto-layout_ frame's drop target: the child stays parented to (and clipped by) its origin frame
until pointer-up (`armAutoLayoutDropIndicator` only shows the indicator; `commitDropIntoFrame` does
the reparent on release), so the part already outside the origin frame was masked away, and what
remained was at the standard 0.5 auto-layout-drag dim — "you only see the indicators". A plain
(non-auto-layout) destination doesn't hit this because `reparentToDropTarget` reparents live during
the drag.

Fixed in the WebGL scene render (`drawSceneNodes`): while an auto-layout drop target is armed, the
roots of the dragged subtrees (`getHoistedDragIds` — the frame itself, not each of its descendants,
so a dragged frame still renders its own clipped contents) are skipped everywhere in the clipped
scene tree (`renderIds`) and painted once, unclipped, on top (`renderHoistedIds`). The 0.5 dim
stays. Unit-only — the fix is a pure function of ref state, not a gesture/timing thing, and a pixel
probe over a half-opacity ghost on a light frame body would be flaky.

Follow-up (same day): the violet frame-outline overlay (`drawFrameOutlines`, the "Frame outlines"
toggle) stayed at the frame's frozen store position during a same-parent reorder, since it drew the
raw node while only the fill ghost got the reorder position override. It now runs the node through
`getAutoLayoutReorderRenderNode` too, so the outline rides the ghost.

## Rotated children

| #   | Scenario                                                                                             | Unit |            E2E             |
| --- | ---------------------------------------------------------------------------------------------------- | :--: | :------------------------: |
| 1   | A child rotated to a non-90deg-multiple angle is packed by its rotated bounding box, not its raw one |  ✅  | ✅ `rotated-child.spec.ts` |

Found from a real screenshot: a frame's rotated child visually overflowed the frame's own edge,
because the real layout applier (`syncAutoLayoutChildren.ts`) measured and positioned every child by
its raw, un-rotated `width`/`height`/`x`/`y` — correct for 0/90/180/270deg (where the rotated
footprint is still a plain axis-aligned rectangle), but wrong for any other angle, where the true
on-screen footprint is the rotated corners' axis-aligned bounding box (bigger, and offset from the
raw box). Fixed via a new `getRotatedNodeBounds` store util, wired into every auto-layout
size/position call site (the real applier, the drag-reorder sibling/ghost/render-preview code, and
`getNodesBoundingBox`). The unit suite exhaustively covers the trig itself; this e2e test proves the
full real pipeline (drag a child in, rotate it via `updateNode`, drag a second child in) actually
clears the rotated footprint instead of overlapping it — rotation here is set directly via
`updateNode` rather than the interactive rotate-handle drag, since that gesture is `rotate.spec.ts`'s
own concern, not this one's.
