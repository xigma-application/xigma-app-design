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

| #   | Scenario                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Unit |         E2E          |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: | :------------------: |
| 1   | Dragging a child to a new position among its own siblings reorders it, without ejecting it                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |  —   | ✅ `reorder.spec.ts` |
| 2   | Dragging a child swaps past a sibling the instant it touches that sibling's own near edge (not its midpoint), and reverts at that same edge                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |  —   | ✅ `reorder.spec.ts` |
| 3   | Dragging a multi-node selection reorders the whole block together, preserving the block's own current relative order (not selection/click order)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |  ✅  | ✅ `reorder.spec.ts` |
| 4   | Wrap: nudging a child that sits alone on its own row doesn't perturb the siblings on a different row                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |  ✅  | ✅ `reorder.spec.ts` |
| 5   | Wrap: a dragged multi-row block previews as its own individual members, not one merged bounding box                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |  ✅  | ✅ `reorder.spec.ts` |
| 6   | Wrap: moving a child into another row keeps the reorder's whole-cell (edge-based) insert zone instead of a half-cell midpoint one                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |  ✅  | ✅ `reorder.spec.ts` |
| 7   | Wrap: a child dragged toward another row can be dropped straight back onto its own vacated slot                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |  ✅  | ✅ `reorder.spec.ts` |
| 8   | Wrap: a dragged multi-node block lands by reading-order slot minus the grabbed member's offset within the block                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |  ✅  | ✅ `reorder.spec.ts` |
| 9   | A dragged multi-node block's ghost shows its members merged into their final layout (contiguous, right gap/order) and rides the cursor as one unit — for plain horizontal / vertical, not only wrap                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |  ✅  | ✅ `reorder.spec.ts` |
| 10  | The internal arrangement of the block's ghost re-tweens (200 ms) when it changes mid-drag — e.g. a companion flips from the right of the cursor to its left near the last slot — while the grabbed member keeps tracking the cursor exactly                                                                                                                                                                                                                                                                                                                                                                                                                                            |  ✅  |          —           |
| 11  | Non-adjacent block (e.g. {1,4}): siblings make room for the block's individual members, not one merged bounding box spanning the members it straddles                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |  ✅  | ✅ `reorder.spec.ts` |
| 12  | Dragging the block's grabbed member past the last item into the "chasm" of a partial last row switches the ghost to a contiguous edge-to-edge run (companion right next to the grabbed member) clamped inside the frame, instead of a companion flying off toward its distant wrap-footprint slot                                                                                                                                                                                                                                                                                                                                                                                      |  ✅  |          —           |
| 13  | While the pointer is inside the auto-layout parent, the drag stays a reorder — a sibling that is itself a frame is treated as a plain sibling, never a container to nest into; only leaving the parent's own bounds exits reorder mode into the basic drop-indicator flow                                                                                                                                                                                                                                                                                                                                                                                                              |  ✅  |          —           |
| 14  | Holding Ctrl / Cmd over the parent switches the reorder ghost to a basic "absolute" mode — the block leaves the flow and rides the cursor 1:1, the siblings close the vacated slot (no gap opens at the line), and the blue indicator marks where it re-inserts on release — on the keypress alone, no pointer move needed; releasing it while still home returns to the ghost. But once the modifier was held while over another frame or outside the parent, that mode is abandoned for the rest of the drag — coming back and releasing it stays basic. The `strict-mode` cursor shows only while the modifier is actively held over the parent, not during the plain ghost reorder |  ✅  | ✅ `reorder.spec.ts` |

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

Found live by the user (2026-09-06). Several related gaps once the wrap block-reorder felt right:

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

3. **The grabbed member could be dragged into "the chasm".** With a partial last row
   (`[1,2,3] / [4,5,6] / [7]`), grabbing `7` of `{6,7}` and dragging into the empty area where slots
   8/9 would be: the footprint of the committed layout puts `6` in row 2 (col 3) and `7` in row 3
   (col 1) — diagonally far apart — so `companion = grabbedGhost + (slot6 − slot7)` flew clean off
   the frame. Model (from the user): _no real slot → the companion just sits next to the grabbed
   member, even for a block of 10_. When the reading-order slot runs past the end
   (`readingOrderSlot − grabbedIndexInBlock > siblingCount`), the ghost switches to **contiguous
   mode** (`draggedContiguous` on the preview): member slots become a straight edge-to-edge run
   (`getContiguousMemberSlots`), the swap/nearest-slot logic is skipped
   (`buildContiguousMemberOffsets`), and the whole tight block rides the cursor — additionally
   clamped to the frame's content box (`draggedClampBox` → `clampGhostToBox`) so it can't leave the
   frame. The commit index is (again) unchanged. Only wrap has a chasm; the non-wrap path always
   passes `contiguous: false`.

4. **The diagonal swap could nest a member into a sibling frame.** During the footprint swap the
   ghost members cross rows; if the pointer passed over a sibling that is itself a frame/container,
   the drop-target resolver picked that sibling as a nesting target and the released block dropped
   _inside_ it. Model (from the user): reorder mode has no "enter a frame" — a sibling frame is just
   a sibling to move around; the only way out of reorder mode is to leave the auto-layout parent's
   own bounds (then the basic drop-indicator flow takes over, and an outer frame instead of the
   canvas is fine). `resolveDragReparentTarget` now short-circuits `desiredParentId` to the current
   parent whenever the pointer is still inside an auto-layout `currentParent` (`isPointInsideFrame`),
   so `getDragDropTargetFrame` never even gets to name a nested frame. Unit-only — pure function of
   the pointer vs. the parent's bounds and type.

5. **Ctrl / Cmd toggles reorder ↔ basic "absolute" mode (Figma-style), with a sticky exception.**
   Holding the modifier (`event.ctrlKey || event.metaKey` — the Mac Cmd key counts too) over the
   parent suppresses the reorder ghost (`getAutoLayoutDropTargetContext` takes
   `suppressSameParentReorder`, forcing `isSameParentReorder: false`) and switches to a **basic
   floating preview** (`armAutoLayoutFloatingReorderPreview`): the dragged block leaves the layout
   flow and rides the cursor 1:1 as a render-only ghost (`buildCursorTrackedPositions`, no
   `draggedMemberSlots`, the real store positions untouched — an auto-layout child can't just be
   moved, the layout engine re-flows it every dispatch); the siblings **close the vacated slot** and
   no gap opens at the insertion point (`getAutoLayoutSingleLineSiblingPositions` /
   `getAutoLayoutWrappedSiblingPositions` with an empty `draggedSizes`), so the block floats
   "absolute" over them; the blue drop-indicator line just shows where it would re-insert on release
   (`commitDropIntoFrame`'s same-parent-indicator branch commits the reorder at that index).
   Releasing the modifier while the pointer never left the parent restores the reorder ghost. But
   the moment it is held while the pointer is over another frame (nested or overlapping) or outside
   the parent's bounds, `dragState.reorderModeAbandoned` latches on — from then on the drag stays in
   this basic floating mode for good, even back home with the modifier released. The switch happens
   on the keydown/keyup alone, with no pointer movement: `handleModifierKeyChange` replays a
   synthetic `pointermove` at the last position, exactly as `handleShiftKeyChange` does for the
   axis-lock. The `strict-mode` cursor (arrow + a down-chevron badge) shows only while the modifier
   is actively held over the parent, not during the plain ghost reorder or after the latch. E2E
   covers the keypress-alone switch (screenshots before / after a bare `keyboard.down('Control')`
   and a bare `keyboard.up('Control')`, no mouse movement between); the abandon-latch state machine
   is unit-only.

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

| #   | Scenario                                                                                                                                                                                                | Unit |            E2E             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: | :------------------------: |
| 1   | A child rotated to a non-90deg-multiple angle is packed by its rotated bounding box, not its raw one                                                                                                    |  ✅  | ✅ `rotated-child.spec.ts` |
| 2   | Rotating the frame itself keeps its children anchored to (orbiting) the frame's own centre, instead of resetting them to the flat, un-rotated flow position                                             |  ✅  | ✅ `rotated-frame.spec.ts` |
| 3   | When every child rigidly inherits the frame's own rotation (the rotate-handle/panel behavior above), siblings stay evenly spaced instead of drifting apart                                              |  ✅  | ✅ `rotated-frame.spec.ts` |
| 4   | Dragging/reordering a child, or dropping one in, inside an already-rotated auto-layout frame resolves the correct insertion index, ghost positions and drop indicator — not the flat, axis-aligned ones |  ✅  | ✅ `rotated-frame.spec.ts` |

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

### Rotating the frame reset its own children back to the flat flow position

Found live by the user (2026-09-06), from a screenshot of a rotated auto-layout frame whose children
had visibly drifted out of their original arrangement, worsening at exact 90deg multiples into what
looked like a full reset to the frame's un-rotated top-left corner. Root cause:
`syncAutoLayoutChildren` always packs children along the **world** x/y axes, using `frame.x`,
`frame.y`, `frame.width`, `frame.height` directly — it never looks at `frame.rotation`. And
`handleUpdateNode` re-runs that same sync on **every** `updateNode`, including one that only changes
`rotation`. So the interactive rotate-handle's own rigid-rotation logic (`getRigidTransformNodes` +
`continueRotateDrag`, which already correctly rotates the frame _and_ every descendant leaf around
one shared pivot — this part was already right) would place a child at its correct, rotated position,
only for the very next `syncAutoLayoutChildren` call — triggered as a side effect of that same
dispatch, or any sibling's — to immediately overwrite it back to the flat, un-rotated flow slot.

Fixed with a single, narrow change: `syncAutoLayoutChildren` now computes each child's flow slot
exactly as before (this is a stable "as if the frame had no rotation" reference position, unaffected
by `frame.rotation`), then orbits that slot's own centre around the frame's centre by
`frame.rotation` (`getAutoLayoutRotatedSlotPosition`, using the same `rotatePoint` the rotate-handle
itself uses) before translating the child's subtree into place. `rotatePoint` already short-circuits
`degrees === 0`, so every existing (un-rotated) scenario is a byte-for-byte no-op — confirmed by the
full pre-existing `syncAutoLayoutChildren` suite passing unchanged. The fix only touches _position_;
each child's own `rotation` field is left alone, since the rotate-handle's existing rigid-rotate logic
already sets that correctly (preserving a child's own independent tilt plus the frame's added delta).

Follow-up, same day: the RightPanel's numeric rotation field (`useColumnRotation`) and its 90°/flip
buttons (`buildRotationButtons`) dispatched a single plain `updateNode` on the frame alone, with no
rigid-transform of descendants — a child would correctly re-anchor its _position_ (this sync fix),
but wouldn't visually tilt itself to match, since only the interactive rotate-handle's own
`getRigidTransformNodes` + per-descendant `updateNode` loop ever set `child.rotation`. Fixed by
extracting that loop into a standalone, reusable `rotateNodesRigidly` (plus its two small
dependencies, `getRotateNodeOrigins` and `pinRotatedGroupBounds`, pulled out of the drag code they
used to live inside) and calling it from both the panel's scrub/blur commit and its 90° button — same
rigid rotation, same pivot math, whichever way the rotation is set. The interactive drag path
(`continueRotateDrag`) itself is untouched, just now importing the same extracted helpers instead of
defining them locally. Unit-only — a real-store dispatch-orchestration function with no gesture/timing
of its own; the interactive rotate-handle gesture already has its own e2e coverage in `rotate.spec.ts`.

Follow-up, spotted live right after: with three children in a row, rotating the frame 45deg via the
handle visibly pushed them apart — "coś je odpycha" ("something's pushing them away"), worse the
further along the row. Root cause: `continueRotateDrag`'s rigid rotation gives every child its own
`rotation` equal to the frame's (each spins in place to match, same as the frame), so by the time
`syncAutoLayoutChildren` computes packing sizes via `getRotatedNodeBounds(child)`, it was reading each
child's now-tilted **absolute** bounding box (bigger than its raw footprint) — inflating the flow
spacing between siblings, and the error compounded further with each additional child. Fixed with
`getAutoLayoutChildLocalBounds`: pack by the child's rotation **relative to the frame**
(`child.rotation - frame.rotation`) instead of its absolute one — a child that rigidly inherited the
frame's own tilt reads as untilted (0 relative) again, exactly like before the frame ever rotated; a
genuinely independently-tilted child (scenario 1 above, frame at rotation 0) is unaffected, since
subtracting 0 changes nothing. A same-day regression test in `syncAutoLayoutChildren.spec.ts` also
caught, in passing, that the earlier position-anchoring fix itself had a latent edge case: an
un-tilted child inside a 90deg-rotated **square** frame used to orbit to a position that overflowed
the frame's own edge by 5px, because it kept packing by the child's raw (un-rotated) box instead of
the same relative-rotation-aware one — the corrected math lands it flush in the adjacent corner instead.

### Dragging inside a rotated frame — the whole drop-indicator/reorder-ghost engine assumed no rotation

Found live right after, asked directly: "teraz trzeba wskaźniki dostosować oraz ten tryb ghost pod
te kąty, bo też świrują" ("now the indicators and the ghost mode need adjusting for these angles too,
they're also going haywire"). The entire drag/reorder engine built earlier this session
(`armAutoLayoutDropTarget` and everything under it — insertion-index math, sibling reflow, the
multi-node block ghost, wrap, the Ctrl "absolute" mode) compares the cursor and every sibling's
bounds directly against the frame's own `x`/`y`/`width`/`height` — correct only when `frame.rotation`
is 0, since all of that math implicitly assumes the frame's local axes and the world's axes are the
same axes.

Fixed by running the entire computation in the frame's own **local** (as-if-unrotated) space and
converting only at the two boundaries:

- **In:** the cursor point is un-rotated into local space (`getUnrotatedQueryPoint`, the same utility
  hit-testing already used); every sibling's — and the dragged block's own — bounds are converted to
  local bounds via `getAutoLayoutNodeLocalBounds` (relative-rotation size, from the earlier fix,
  **plus** the position itself un-rotated back around the frame's centre, the inverse of
  `getAutoLayoutRotatedSlotPosition`). Fed with these, every existing index/reflow/wrap/block
  function runs completely unchanged, since from its own point of view nothing is rotated.
- **Out:** the resulting sibling positions and dragged-block member slots are rotated back to world
  (`getAutoLayoutRotatedPositions`, orbiting each slot's own centre around the frame's centre — the
  same per-slot centre-based math as the sync fix, not a bare point rotation, which would silently
  reintroduce the width/height-swap bug) before being written to the drop-target/reorder-preview
  refs, since that's the space the ghost-render and delta-to-real-position code already expects.
  The drop indicator's own rect is left in local coordinates and instead drawn with the frame's
  rotation and centre as an explicit pivot (`drawRect`'s existing `rotationCenter` param) — simpler
  than rotating its corners by hand. The live per-tick ghost-follow code (cursor tracking, block
  member offsets) needed **no changes at all**: since every slot it reads is already rotated around
  the same frame-centre pivot, the _differences_ between them behave as correctly-rotated vectors on
  their own (rotating two points around a shared pivot and subtracting cancels the pivot out) — the
  one exception was the chasm clamp box, which does an absolute min/max clamp, so `clampGhostToBox`
  now un-rotates the ghost point into the box's own local space, clamps, and rotates the result back.

Known, disclosed simplification: that clamp step still measures the _grabbed member's own_ width/
height from its absolute (world) rotated bounding box, not relative to the frame — for a member that
rigidly shares the frame's own tilt this is the same class of over/under-clamp as the pre-fix sizing
bug, just scoped to the rare moment a multi-node block is dragged past the last slot (the "chasm")
inside an already-rotated frame. Left as-is rather than threading a third rotation-relative value
through the live per-tick path for a compound edge case this narrow.

## Gap handles

| #   | Scenario                                                                                                                                                                                                                          | Unit |           E2E            |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: | :----------------------: |
| 1   | Hovering a selected auto-layout frame's interior shows a small drag handle at every real gap between siblings, on both axes                                                                                                       |  ✅  |            —             |
| 2   | Hovering one specific handle shows a floating px label and a pink 45deg hatch fill (the same technique vectors use for a paint fill preview) across every gap on that handle's axis, not just the one under the cursor            |  ✅  |            —             |
| 3   | Dragging a handle swaps the hatch for a plain pink outline on those same gaps, and live-updates the frame's shared gap value (`horizontalGap`/`verticalGap`) for the whole frame at once                                          |  ✅  | ✅ `gap-handles.spec.ts` |
| 4   | Wrap: a lone child on its own row/column shows no handle for the (nonexistent) gap to its missing neighbour, but the row/column-gap handle to the previous line still shows                                                       |  ✅  |            —             |
| 5   | The cursor while hovering/dragging a handle is a dedicated rotated icon (`gap.png`), pointing along the handle's own drag axis and tilted by the frame's own rotation, the same mechanism the rotate handle's cursor already uses |  ✅  |            —             |

Requested directly: "trzeba wskaźniki dostosować oraz ten tryb ghost pod te kąty" was the _previous_
ask (the drop-indicator/reorder-ghost engine above); this one is a separate, new feature — draggable
handles that let the user change an auto-layout frame's own `horizontalGap`/`verticalGap` straight on
the canvas, styled after the existing ad-hoc "Smart Selection" gap-drag (an unrelated feature that
lets any arbitrary multi-node selection's inferred spacing be dragged) but wired to the frame's real,
persisted gap fields instead. The spec was locked turn-by-turn before writing any code, since an
earlier misreading of one confirmation ("independent gap per pair" instead of "one shared value,
matching the RightPanel's existing single gap field") would have meant a real data-model change; once
corrected, the model stayed exactly what the frame already stores — a handle on any gap of a given
axis always reads and writes the same one shared number for the whole frame.

Geometry (`getAutoLayoutGapHandles`) reuses the same local↔world rotation strategy as the rotated-frame
work above: every child's already-synced position is read via the existing `getAutoLayoutNodeLocalBounds`
(no new packing math), grouped into flow "lines" by watching the primary-axis coordinate reset instead
of re-deriving wrap breaks from padding/content-box, then adjacent siblings within a line become a
main-axis handle and adjacent lines become a cross-axis (row/column-gap) handle. A lone item on its own
line naturally produces zero within-line handles (nothing to pair it with) while still producing its
line-to-line handle — no special-casing needed for the wrap edge case from scenario 4. Hit-testing and
the interactive drag both convert the cursor into the frame's local space first (`getUnrotatedQueryPoint`,
already used by the drop-target engine), so the whole feature works unmodified at any frame rotation.

The hatch-fill visual reuses the vector paint tool's own `drawVectorHatchFill` (stencil-clipped diagonal
lines) directly, rotating each gap's rect corners into world space first — the same technique the user
pointed at explicitly ("Wektory mają to rozwiązanie jak to rysować gdy robimy paint"). The handle bars
reuse the Smart Selection gap handle's exact visual constants (`SMART_SELECTION_GAP_HANDLE_*`) for a
consistent look between the two systems, even though they are otherwise unrelated code paths. Unit-only
for most of the above: the geometry, hit-testing, hover/cursor resolution and every draw layer (bars,
hatch, outline, label) are pure functions or narrow WebGL call-verification, exhaustively covered without
a browser. The one thing only a real browser proves is the actual pointerdown→pointermove→pointerup
gesture correctly reading back into the store as a persisted `horizontalGap` change — that's
`gap-handles.spec.ts`.

## Fill sizing

| #   | Scenario                                                                                                                                                                                                                                                                                       | Unit |           E2E            |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: | :----------------------: |
| 1   | A child of an auto-layout frame can be set to "Fill container" on either axis, per axis, via a third option in the RightPanel's existing Fixed/Hug sizing dropdown                                                                                                                             |  ✅  | ✅ `fill-sizing.spec.ts` |
| 2   | On the primary axis, a filling child grows to consume exactly the frame's leftover space after every fixed sibling and gap                                                                                                                                                                     |  ✅  | ✅ `fill-sizing.spec.ts` |
| 3   | Several filling children on the same axis split the leftover space evenly                                                                                                                                                                                                                      |  ✅  |            —             |
| 4   | On the counter axis, a filling child stretches to the frame's full content-box cross size, independent of the primary-axis leftover calculation                                                                                                                                                |  ✅  |            —             |
| 5   | In `layoutWrap` mode, a filling child only shares the leftover space of its own wrapped line/row, not the whole frame                                                                                                                                                                          |  ✅  |            —             |
| 6   | Resizing the parent frame live-regrows every filling child to keep consuming the (now different) leftover space                                                                                                                                                                                |  ✅  | ✅ `fill-sizing.spec.ts` |
| 7   | Fill is not offered for an axis where the parent frame itself is hugging that axis (no budget to hand out); manually resizing a filling child resets it to Fixed, mirroring the existing Hug behavior                                                                                          |  ✅  |            —             |
| 8   | Switching a frame's own axis to Hug resets any direct child that was filling that same axis back to Fixed, since a hugging parent has no leftover space to give                                                                                                                                |  ✅  |            —             |
| 9   | Switching a frame's flow to freeForm or grid resets every direct child's Fill on both axes back to Fixed, since neither mode is managed by the fill-aware auto-layout engine; flipping between Horizontal and Vertical leaves Fill untouched, since both physical axes stay managed either way |  ✅  |            —             |

`primaryAxisSizingMode`/`counterAxisSizingMode` (self-hug only, frame-only) were renamed and relocated
to `widthSizingMode`/`heightSizingMode` on `TBaseNode`, so every node type carries the same pair of
physical-axis-keyed fields whether the value in question is "hug myself" (only legal when the node is
itself an auto-layout frame) or "fill my parent" (only legal when the parent is one) — Fixed/Hug/Fill
all live in one three-value enum per axis instead of two separate mechanisms. The packer itself had no
prior concept of "extra space" at all (`getAutoLayoutChildPositions`/`getAutoLayoutWrappedChildPositions`
only ever read each child's existing stored size and packed it tightly); `getAutoLayoutFillSizes` and
`getAutoLayoutFilledLines` are new, added between content-box resolution and packing, purely additive
to the existing hug/fixed pipeline. `syncAutoLayoutChildren`'s per-child apply step
(`applyAutoLayoutSyncChildPosition`) now also writes a resolved child's `width`/`height` (previously
only ever wrote `x`/`y`), guarded to skip a child independently rotated relative to its parent (no
well-defined "grown" local box in that case), and recurses into any auto-layout frame child whose own
size just changed by fill, so a nested auto-layout frame reflows its own children after being grown.
Unit-only for the algorithm itself (leftover-space math, per-line wrap independence, the Hug/Fill
mutual-exclusion guard, and the flow-switch-resets-Fill cascade in `useColumnFlow`) — exhaustively
covered without a browser. What only a real browser proves:
the RightPanel's sizing-mode dropdown actually dispatching `updateNode` for the selected child, and a
live canvas resize-drag actually re-triggering the fill recompute end to end — that's
`fill-sizing.spec.ts`.

## Min/Max sizing

| #   | Scenario                                                                                                                                                                                                                                                                                                         | Unit |             E2E             |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: | :-------------------------: |
| 1   | A frame with an active (non-freeForm) layout can reveal an empty Min/Max width/height row via a toggle in the RightPanel's existing sizing dropdown, previously an inert placeholder — revealing writes nothing to the node until a real value is typed                                                          |  ✅  | ✅ `min-max-sizing.spec.ts` |
| 2   | Min/Max is gated behind the same condition as Hug (the node itself must be an active-layout frame) — not offered for a freeForm frame or a non-frame Fill child                                                                                                                                                  |  ✅  |              —              |
| 3   | A Hug-computed size is clamped to its own Min/Max, even though it would otherwise be smaller/larger from content alone                                                                                                                                                                                           |  ✅  | ✅ `min-max-sizing.spec.ts` |
| 4   | A committed Fixed value, and a live canvas resize-drag, are both clamped to the node's own Min/Max the same way                                                                                                                                                                                                  |  ✅  |              —              |
| 5   | On the primary axis, a Fill child's Max/Min is honored even when it diverges from the equal-split share; the leftover a Max-capped child gives back is redistributed among its still-unbounded Fill siblings, not wasted (mirrors CSS flexbox's "resolve flexible lengths" algorithm)                            |  ✅  |              —              |
| 6   | On the counter axis, a Fill child's Min/Max clamps its stretch size independently — there's no shared pool on that axis to redistribute from                                                                                                                                                                     |  ✅  |              —              |
| 7   | Once a Max is set on the primary axis, Wrap becomes available for a Hug frame (previously Hug and Wrap were mutually exclusive); lines are grouped against the Max as their budget, and the frame then re-hugs to the widest resulting line, not the raw Max                                                     |  ✅  | ✅ `min-max-sizing.spec.ts` |
| 8   | A single shared "Remove" item (its own separator block, after the Min/Max rows) clears **both** bounds for that axis at once and un-reveals both rows; unlike Fixed/Hug/Fill, a real (committed) Min/Max otherwise survives a sizing-mode change or a manual resize — it's an independent, persistent constraint |  ✅  |              —              |
| 9   | Committing a Min above the current Max (or a Max below the current Min) in the RightPanel pushes the other bound to match, keeping min ≤ max                                                                                                                                                                     |  ✅  |              —              |
| 10  | Committing a Min/Max field to 0 (or a negative value) clears that bound entirely instead of flooring it to 1 — 0 isn't a meaningful lower/upper bound, so it's treated as "remove the constraint"                                                                                                                |  ✅  |              —              |
| 11  | The Min/Max input rows are driven purely by ephemeral `revealedMinMax` state, never by whether the node carries a value — every genuine selection change hides them again, even for a frame whose bound is still stored; you re-open the row from the dropdown (see #12)                                         |  ✅  | ✅ `min-max-sizing.spec.ts` |
| 12  | Once a bound has a value the dropdown entry shows it live (`Min width: 123`) instead of `Add min width…`; clicking that entry re-reveals the row populated with the stored value (an empty, valueless entry toggles its row on/off instead)                                                                      |  ✅  | ✅ `min-max-sizing.spec.ts` |
| 13  | Revealing a Min/Max row moves keyboard focus straight into its input                                                                                                                                                                                                                                             |  ✅  | ✅ `min-max-sizing.spec.ts` |
| 14  | Committing a Min/Max re-clamps the frame's own width/height on the spot — a Max of 150 on a 700-wide Fixed frame snaps it to 150 immediately, without waiting for any other recompute to touch it                                                                                                                |  ✅  | ✅ `min-max-sizing.spec.ts` |

Min/Max live as four new optional `TBaseNode` fields (`minWidth`/`maxWidth`/`minHeight`/`maxHeight`),
the same physical-axis-keyed convention as `widthSizingMode`/`heightSizingMode` — undefined means "no
constraint". A single new `clampAutoLayoutSize` helper is the one clamp primitive reused everywhere a
resolved size gets finalized: `applyAutoLayoutHugSize`, the new `applyAutoLayoutWrapPrimaryHugSize`
(the bounded-Hug-plus-Wrap case), `getAutoLayoutFillSizes`'s counter-axis clamp, the RightPanel's
Fixed-value commit, and the canvas drag-resize path. The primary-axis Fill case needed a real
algorithm, not just a clamp — `resolveAutoLayoutFillPrimarySizes` runs a freeze-and-redistribute loop
(same shape as CSS flexbox's own flexible-length resolution) so a Max-capped child's unused leftover
flows to its still-growing siblings instead of being wasted, and a Min-forced child can pull leftover
down to 0 for the rest rather than going negative. Enabling Wrap on a bounded Hug required teaching
`computeAutoLayoutWrappedPositions` to group lines against the Max (not the current, not-yet-computed
content box) and then hug the frame's own primary size to the widest resulting line via a new
`getAutoLayoutWrapPrimaryHugSize`/`applyAutoLayoutWrapPrimaryHugSize` pair, mirroring the existing
counter-axis hug pair exactly. The RightPanel toggle deliberately does **not** write a value on reveal
— it flips one of four booleans in a new ephemeral `TDesignState.revealedMinMax` slice (reset to
all-false by `handleSetSelection` whenever the selection actually changes), and those four booleans
are the **only** thing that shows or hides the input rows — a stored `minWidth` on the node does not,
on its own, bring its row back. So every Min/Max row behaves like a real Figma one: visible while
you're looking at it, gone the moment the selection changes, and re-opened from the sizing dropdown,
whose entry now reads `Min width: 123` (live value) rather than `Add min width…` once the bound
exists. Revealing a row also drops keyboard focus straight into its input. A single shared **Remove**
item — sitting in its own separator block below the Min/Max entries, `Close` icon, the same treatment
`x-design`'s `ColumnMinMaxSize` remove uses — clears both bounds for that axis and un-reveals both
rows at once. Committing a field to 0 (or below) is the same "remove this constraint" for that one
bound: it clears the node field and un-reveals the row in one step, rather than flooring to the
global dimensions minimum the way the plain Fixed width/height field does. Every Min/Max commit also
re-clamps the frame's own width/height immediately (`clampAutoLayoutSize` against the resulting
bounds), so a Max that is smaller than the current size takes effect at once even on a Fixed-sized
frame that nothing else would recompute. The main Width/Height
field's own leading "W"/"H" label swaps to the existing `WidthRestricted`/`HeightRestricted` icon
(the same icons `x-design`'s analogous field uses for its "attached" state) the moment either bound
is shown — real or still-empty — so the field visibly signals "this axis is constrained" independent
of whether a number has been typed yet. Unit-only for the algorithm itself (the redistribution loop,
the bounded-hug-grouping edge cases, the Fixed-commit and drag-resize clamps, the reveal/clear state
machine) — exhaustively covered without a browser. What only a real browser proves: the RightPanel's
toggle-then-edit flow actually reaching the store, and Wrap visibly re-flowing children onto a second
line the instant Max makes it eligible — that's `min-max-sizing.spec.ts`.
