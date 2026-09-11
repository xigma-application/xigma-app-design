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

## Grid flow

Grid auto-layout (`.claude/docs/auto-layout.md` §13). The cell math (track sizing, placement order,
gaps, padding, hug, spanning, per-cell alignment, rotation) is pinned exhaustively by the unit suite
under `src/store/design/utils/autoLayout/computeGridLayoutPositions/`, and the panel widget (preview
tile, count inputs, 12×8 pick matrix) by `ColumnAlignmentLayout/GridArea/**`. What only a browser
proves is the wiring — the Flow toggle's "Grid" button and the `GridArea` popover controls
dispatching into the store, the grid branch of `syncAutoLayoutChildren` running, the canvas
repainting — same rationale as the Flow section above.

| #   | Scenario                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Unit |        E2E        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: | :---------------: |
| 1   | The Flow toggle's Grid button lays the frame's children into a two-column grid (default column count 2), filling row 0 then row 1                                                                                                                                                                                                                                                                                                                                                                       |  ✅  | ✅ `grid.spec.ts` |
| 2   | Switching a grid frame to Horizontal collapses it to a single row, and switching back to Grid restores the exact same cell positions                                                                                                                                                                                                                                                                                                                                                                    |  ✅  | ✅ `grid.spec.ts` |
| 3   | The Grid panel widget: typing a column count in the popover, and clicking a cell in the 12×8 pick matrix, both re-grid the children                                                                                                                                                                                                                                                                                                                                                                     |  ✅  | ✅ `grid.spec.ts` |
| 4   | Selecting a grid frame outlines every cell on the canvas; the outlines reflow when the column count changes                                                                                                                                                                                                                                                                                                                                                                                             |  ✅  | ✅ `grid.spec.ts` |
| 5   | Dragging an element over a grid cell highlights that exact cell and dims the element; dropping nests it, pinned to the cell and stretched to fill it. Multi-drops fill the next _free_ cells (skipping ones held by an anchored child) and grow the grid with new rows                                                                                                                                                                                                                                  |  ✅  | ✅ `grid.spec.ts` |
| 6   | The rows field's Auto / fixed-count menu — clearing `gridRowCount` for Auto, pinning it to the effective count for fixed                                                                                                                                                                                                                                                                                                                                                                                |  ✅  |         —         |
| 7   | Auto row count / the slot overlay reflect a child pinned to a far row (`getDerivedGridRowCount` runs `placeGridCells`), not just `ceil(children / columns)`                                                                                                                                                                                                                                                                                                                                             |  ✅  |         —         |
| 8   | Track sizing (fixed / hug / fill fr split), row/column gaps, per-side padding, hug frame growing to the track sum                                                                                                                                                                                                                                                                                                                                                                                       |  ✅  |         —         |
| 9   | Multi-cell spanning and explicit per-cell placement (manual anchors) when set in code                                                                                                                                                                                                                                                                                                                                                                                                                   |  ✅  |         —         |
| 10  | A rotated grid frame orbits its cells about the frame centre, same as the linear engine                                                                                                                                                                                                                                                                                                                                                                                                                 |  ✅  |         —         |
| 11  | Hovering the boxed-in side (wall or another occupied cell) of an occupied cell arms a vertical insertion indicator instead of a cell highlight; dropping inserts there and ripples the trailing children forward, growing a row if needed                                                                                                                                                                                                                                                               |  ✅  | ✅ `grid.spec.ts` |
| 12  | Hovering the free-neighbour side of an occupied cell highlights that neighbour cell instead of arming an indicator                                                                                                                                                                                                                                                                                                                                                                                      |  ✅  |         —         |
| 13  | Dragging two already-placed, scattered grid children together merges them into adjacent cells (same occupancy-scan mechanism as a fresh multi-drop, since it just excludes the moved nodes' own old cells)                                                                                                                                                                                                                                                                                              |  ✅  | ✅ `grid.spec.ts` |
| 14  | Holding the modifier while dragging a grid child disables the whole grid drop mechanism — no highlight, no indicator, no anchor change, no sibling reshuffle on drop                                                                                                                                                                                                                                                                                                                                    |  ✅  | ✅ `grid.spec.ts` |
| 15  | A grid child being dragged visually rides the cursor like a ghost instead of snapping back to its cell (the live x/y dispatch is skipped so the grid engine's own resync has nothing to stomp)                                                                                                                                                                                                                                                                                                          |  —   | ✅ `grid.spec.ts` |
| 16  | Shrinking the grid via the panel is rejected outright when the requested capacity can't hold every current child — no silent "grow to fit", the fields just revert                                                                                                                                                                                                                                                                                                                                      |  ✅  |         —         |
| 17  | An accepted resize on an already-manually-placed grid re-packs every child's current reading order into the new column count instead of letting a naive per-axis anchor clamp collide two of them into the same cell                                                                                                                                                                                                                                                                                    |  ✅  | ✅ `grid.spec.ts` |
| 18  | A rejected (or ignored) Columns/Rows commit leaves the input showing the real current grid value, not the invalid text the user typed — the field remounts to the store value on every commit attempt, accepted or not                                                                                                                                                                                                                                                                                  |  ✅  | ✅ `grid.spec.ts` |
| 19  | The Padding row is shown (and functional) for a grid frame, exactly like a linear auto-layout frame — it was hidden entirely before                                                                                                                                                                                                                                                                                                                                                                     |  —   | ✅ `grid.spec.ts` |
| 20  | A grid child's Width/Height sizing dropdown offers Fill container (the dropdown didn't even render before, since a plain child is never itself huggable and Fill was gated to a linear parent only) — picking it stretches the child to its cell, same as a cell drop                                                                                                                                                                                                                                   |  —   | ✅ `grid.spec.ts` |
| 21  | The shared "Alignment" widget (`PositionSection/ColumnAlignment`) moves a grid child within its own cell (`gridChildHorizontalAlign`/`gridChildVerticalAlign`) instead of setting the `alignment` constraint and moving it by x/y, the way it does for a non-grid child                                                                                                                                                                                                                                 |  ✅  | ✅ `grid.spec.ts` |
| 22  | Switching a grid child to Absolute position (`ignoreAutoLayout`) lets it drag freely on canvas instead of silently reverting on release, and frees its old cell for every other grid drag/drop occupancy calculation                                                                                                                                                                                                                                                                                    |  ✅  | ✅ `grid.spec.ts` |
| 23  | The Column span field stretches a grid child across its cells (a Fill child spanning 2 columns takes the full frame width); a typed value past the grid's current column count is refused and the field snaps back                                                                                                                                                                                                                                                                                      |  ✅  | ✅ `grid.spec.ts` |
| 24  | Changing the grid size (Columns/Rows/pick matrix) resets every spanning child back to 1×1 rather than re-fitting its span into the new track grid                                                                                                                                                                                                                                                                                                                                                       |  ✅  | ✅ `grid.spec.ts` |
| 25  | Dragging a new element into the interior of a child that spans several cells drops it in the next free cell, not at an interior track boundary inside the span                                                                                                                                                                                                                                                                                                                                          |  ✅  | ✅ `grid.spec.ts` |
| 26  | The span cap follows the child's own position — a child at column 2 of a 4-column grid with a neighbour on column 3 can only reach the free run between it and that blocker, not the whole grid width                                                                                                                                                                                                                                                                                                   |  ✅  | ✅ `grid.spec.ts` |
| 27  | Dragging a multi-cell child previews its whole footprint of slots (also for a multi-node selection); cells past the grid edge or already held by another element are left out, and the drop lands where the footprint actually fits                                                                                                                                                                                                                                                                     |  ✅  | ✅ `grid.spec.ts` |
| 28  | Dragging a wide child together with a narrow one (selected in an order that differs from their sibling order) does not drop the narrow one inside the wide one's span                                                                                                                                                                                                                                                                                                                                   |  ✅  | ✅ `grid.spec.ts` |
| 29  | The **Open grid settings** button swaps the frame properties for a dedicated Grid panel; switching a column track to Fixed re-lays the columns, `+` adds a track, and `−` on a selected track deletes it; the ✕ returns to the normal properties                                                                                                                                                                                                                                                        |  ✅  | ✅ `grid.spec.ts` |
| 30  | Dragging a track by its handle reorders the grid columns and carries a manually-anchored child to its new position, but a move that would split a spanning child's cells apart is rejected and the row snaps back                                                                                                                                                                                                                                                                                       |  ✅  | ✅ `grid.spec.ts` |
| 31  | Pressing Cmd/Ctrl+Z with focus still inside a track's value field or mode dropdown actually undoes (those fields opt out of the panel-wide bypass), and the track selection is carried with undo/redo — the column that was selected before an undone add comes back selected, not reset                                                                                                                                                                                                                |  ✅  | ✅ `grid.spec.ts` |
| 32  | Deselecting a grid frame and then reselecting it does not silently reopen the dedicated Grid panel on its own — the normal frame properties show instead, until **Open grid settings** is clicked again                                                                                                                                                                                                                                                                                                 |  ✅  | ✅ `grid.spec.ts` |
| 33  | Shift/ctrl-clicking a track's drag handle multi-selects (or range-selects) like clicking anywhere else on the row, instead of the handle's own pointerdown swallowing the modifier and starting a drag                                                                                                                                                                                                                                                                                                  |  ✅  | ✅ `grid.spec.ts` |
| 34  | Deleting the last remaining column or row is allowed: it exits grid mode (switches the frame to free-form layout), clears the frame's and its children's grid fields, and closes the panel back to the normal element properties                                                                                                                                                                                                                                                                        |  ✅  | ✅ `grid.spec.ts` |
| 35  | Grabbing a track handle that is part of a multi-selection and releasing without moving the pointer (a plain click) collapses the selection down to just that one row, instead of leaving the whole group selected                                                                                                                                                                                                                                                                                       |  ✅  | ✅ `grid.spec.ts` |
| 36  | The drop indicator stays hidden, and the grabbed row(s) stay fully opaque, until the pointer actually moves while held — grabbing a handle alone no longer shows the indicator or dims the row before any drag has actually started                                                                                                                                                                                                                                                                     |  ✅  | ✅ `grid.spec.ts` |
| 37  | Selecting two tracks, reordering them together, then undoing brings **both** original tracks back selected at their restored positions — the revision-keyed WeakMap removed with #42 was replaced by folding `gridTrackSelection`/`panelGridTrackSelection` into the undo/redo design snapshot itself (`getDesignSnapshot`/`handleReplaceDesignSnapshot`), the same mechanism that already carries node `selectedIds` across history, so the pre-reorder selection rides along with no reactive watcher |  ✅  | ✅ `grid.spec.ts` |
| 38  | The Columns/Rows `+` button carries an "Add column" / "Add row" tooltip, and a track's `−` button a position-aware one — "Remove column 1 of 2" for a lone track, switching to a count ("Remove 2 columns") once that track is part of a multi-selection the button would delete together                                                                                                                                                                                                               |  ✅  | ✅ `grid.spec.ts` |
| 39  | The Grid size popover opens with its top-left corner on the preview tile's own top-left corner (overlaying the panel downward), not flipped to one side — pinned by `side/align/sideOffset` plus `avoidCollisions={false}`                                                                                                                                                                                                                                                                              |  —   | ✅ `grid.spec.ts` |
| 40  | Selecting / extending / clearing a track selection in the Grid settings panel lights up (and unlights) that section's cells on the canvas — the panel feeds a standalone `gridSectionHighlight` store channel that `drawGridSectionHighlight` paints (slot-coloured fill + a 2× outline)                                                                                                                                                                                                                |  ✅  | ✅ `grid.spec.ts` |
| 41  | Switching a track to Fixed / Hug in the panel reflows the on-canvas slot overlay to the real per-track sizes — `getGridTrackLayout` now resolves the actual engine track sizes (`getGridResolvedTrackSizes`) instead of a uniform 1fr split, and the drop hit-testing follows the same non-uniform offsets                                                                                                                                                                                              |  ✅  | ✅ `grid.spec.ts` |
| 42  | Grid track selection is two independent store fields — `gridTrackSelection` (canvas) and `panelGridTrackSelection` (panel) — each written directly by whichever side the interaction happened on, instead of one side reactively re-publishing what it read from the other; a canvas Cmd/Ctrl-click multi-select shows correctly in the panel and stays stable (no flicker/loop) rather than the two sides fighting over a single shared value                                                          |  ✅  | ✅ `grid.spec.ts` |
| 43  | Clicking an already-selected track pill's value on the canvas opens an inline editor there, applying the panel's own fr/fixed/hug parsing rules (an `"Nfr"` input stays fill-weighted, a bare number drops it to fixed)                                                                                                                                                                                                                                                                                 |  ✅  | ✅ `grid.spec.ts` |
| 44  | Editing a value pill that's part of a multi-selection applies the committed value to every selected track, not just the one clicked, and — unlike a plain click on the value of an _unselected_ track — does not collapse the group down to just that one track first                                                                                                                                                                                                                                   |  ✅  | ✅ `grid.spec.ts` |
| 45  | Pressing Escape while editing a canvas track value closes the editor without committing anything                                                                                                                                                                                                                                                                                                                                                                                                        |  ✅  | ✅ `grid.spec.ts` |

#6–#10 stay unit-only: there is no UI to drive per-track sizing / manual placement in a
browser yet (deferred to the last phase), and the geometry is asserted exactly by
`computeGridLayoutPositions/**/test/` and `getGridLayoutSyncPositions.spec.ts`. #12 is exercised
exhaustively (both sides, both outcomes) by `resolveGridDropHover/test/resolveOccupiedCellHover.spec.ts`;
#11 adds the one browser-only proof that a real drop wires the ripple into the store. #13/#14 reuse the exact same
drop pipeline as #5/#11 (a same-parent drag just excludes its own old cells from the occupancy
scan) — the e2e proof is the wiring, not new geometry. #15 has no unit equivalent: it is purely a
"does the canvas actually repaint between two live cursor positions" question, the kind a
synthetic ref assertion can't distinguish from "frozen and re-rendering the same frame twice". #16
is exercised exhaustively (every reject/accept branch) by `getGridResizeRepack.spec.ts` and
`useColumnGridArea.spec.tsx`, so the _decision_ (reject vs. repack vs. accept) stays unit-only.
"The fields just revert" turned out to be the one part that unit-only coverage couldn't actually
prove — see #18. #17 gets the one browser-only pass: real drags anchor two children via the actual
drop pipeline first, then a real panel commit has to repack them without a collision — proving the
wiring between the drop pipeline and the resize pipeline, not just the repack algorithm itself
(already exhaustive in `getGridResizeRepack.spec.ts`). #18 is a real bug found after #16/#17
shipped: `GridInputCells`' `<input>` is uncontrolled and only remounts to its `value` prop when
that prop actually changes, so a rejected/no-op commit left the user's invalid typed text on
screen — invisible to the hook-level unit tests, which never render the actual DOM input. Fixed
by remounting on every commit attempt via a bumped `revision` folded into the field's `key`. #19
and #20 are both plain visibility-gate bugs (`isVisible` / `showWidthDropdown` only checking
`horizontal`/`vertical`) — the unit suite already pins every other branch of both hooks
exhaustively, so only the one new `grid` branch needed a test; e2e is the one to actually prove
the RightPanel _renders_ the control at all, which a hook-level assertion can't. #21 pins the
grid branch of the reused `ColumnAlignment` widget end to end (real click → dispatch → grid
engine resync → repaint), on top of the exhaustive unit coverage of `useColumnAlignment`'s own
branching. #22 is two real, previously-undiscovered canvas bugs, each needing an actual drag to
surface: `updateAutoLayoutReorderGhostPosition` only checked the dragged node's _parent_ layout
mode, never whether the node itself opted out via `ignoreAutoLayout`, so its live x/y dispatch
was wrongly skipped and the drop had nothing to commit; and `getGridPlacementInputs` never
excluded `ignoreAutoLayout` children from occupancy scans the way the layout engine's own
children list already did, so a released child's old cell stayed "occupied" for every other
grid drag/drop. Both fixed at their one shared choke point each. #23 and #26 earn e2e because the whole
`min`/`max`-clamped scrubber + revert-on-reject wiring lives in the DOM (`ScrubbableInput` +
uncontrolled `<input>`), the same class of bug as #18 — the hook-level clamp is unit-covered
(`clampGridChildSpan.spec.ts`, `useColumnGridChildSpan.spec.tsx`, `getGridChildSpanBounds/test/`)
but "the field actually snaps back and the scrub actually stops at the edge" needs a browser. #26's
math (the free run stops at a blocker, not the grid edge) is exhaustive in
`getGridChildSpanBounds/test/`; the e2e is the one pass proving a real panel commit against a real
placed neighbour is refused. #27 is a canvas render behaviour — the footprint geometry (union,
dedupe, occupancy/edge clipping, span-aware anchor scan) is exhaustive in
`resolveGridDropHover/test/{withGridSpanPreview,getGridFootprintCells,getGridDropPlacements}` and
`drawGridDropTarget.spec.ts`, but "the WebGL layer actually paints the bigger highlight while a
real drag is in flight" is only a browser check (screenshot inequality against the 1×1 drag, and
against the same for a two-child selection). #28 is the drop-order bug: `getGridDropPlacements`
resolves `cells[i]` for the drag's `movedNodeIds[i]`, while `applyGridDrop` reads `cells[i]` for
`commitDropIntoFrame`'s `nodeIds[i]` — the two lists must be in the same order or a mixed
selection swaps anchors. `getDropNodeOrder.spec.ts` pins the shared ordering helper; the e2e is
the only place the two call sites are exercised end to end (select in one order, drop, read the
committed anchors back). #24's _decision_ (which children
reset) is exhaustive in `getGridResizeRepack.spec.ts` / `useColumnGridArea.spec.tsx`; the e2e is
the one pass proving a real panel commit clears the stored span. #25 is span-aware drop-hover
resolution — exhaustive in `resolveGridDropHover/test/`; the e2e proves a real drag into a real
multi-cell child's interior anchors the new element in the free column, not somewhere inside the
span. #29 and #30 are the dedicated Grid settings panel (`PanelProperties/GridSettings/`): the
track-array math (`buildGridTrackList`, `getGridTrackMultiDeleteResult`, `moveGridTrackBlock`,
`getGridTrackReorderChildUpdates`, and the `makeAxisControls` / `useGridSettingsPanel` bundle) is
exhaustive under `store/design/utils/autoLayout/gridTracks/test/` and the panel's own specs, but
these two need a browser because the panel is a full right-panel _swap_ (does
`PanelProperties` actually mount `<GridSettings>` instead of `<Frame>` off the store flag, does
the ✕ bring the properties back), the mode `Dropdown` and value `TextField` are uncontrolled DOM
that has to round-trip through `syncAutoLayoutChildren` to move the columns, and the reorder is a
real pointer drag on panel rows with a drop indicator computed from live `getBoundingClientRect`s
— the snap-back on a span-breaking move only means anything against a real committed layout. #31
is two real bugs, both unreachable from a unit test: whether a global keyboard shortcut actually
dispatches depends on which real DOM element carries focus when the browser's own `keydown` fires
and whether `target.closest()` finds a bypass attribute on it or an ancestor — a synthetic
`fireEvent.keyDown` in jsdom never exercises that focus-and-bubbling path; and whether the
undo-safety fix (comparing the frame's own object identity, not its derived content) actually
catches a real Redux history pop is a store round-trip through the _real_ `historyMiddleware`, not
a mocked `TGridAxisControls`. #38 is a Radix tooltip on right-panel buttons: whether the content
actually appears on hover after the provider's open-delay, and whether the `−` button's copy flips
between the single-track and multi-selection wording, is a real hover-timing + portal-render check —
the string selection itself is unit-covered (`GridTrackRow.spec.tsx`), but the browser proves it
mounts and reads correctly against a live selection. #39 is unit-unprovable by nature — jsdom does no
layout, so a Radix popover's resolved on-screen box only exists in a real browser; the e2e opens the
popover and compares its `boundingBox()` top-left to the trigger tile's. #40's pieces are each
unit-covered (`getGridSectionCells`, `getGridSectionHighlightRects`, `drawGridSectionHighlight`, the
slice/selector, and the `GridSettings`/`GridTrackList` glue), but only a real WebGL canvas can show
that a panel-side selection change actually repaints the overlay — the e2e drives the panel and
asserts screenshot inequality across one / two / no selected columns. #41's geometry is pinned by
the `gridSlots/**` unit suite (non-uniform `getGridSlotRect`, `getGridTrackOffset` /
`getGridTrackIndexAt`, `getGridResolvedTrackSizes`, and every `resolveGridDropHover` branch on
non-uniform layouts); the one e2e proves the slot overlay actually repaints when a real panel
commit changes a track's mode — a WebGL paint a unit test can't observe.

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
| 15  | A dragged Group (or Mask) member's ghost shows its own visual content following the cursor, not staying glued to its frozen store position — the container itself paints nothing of its own, so its reorder-preview position override has to propagate down to its descendant leaves, however deeply nested                                                                                                                                                                                                                                                                                                                                                                            |  ✅  | ✅ `reorder.spec.ts` |

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
| 6   | The gap value can go negative with no lower clamp — dragging a handle past 0, or typing a negative number in the RightPanel's gap field, both commit straight through and let children overlap                                    |  ✅  | ✅ `gap-handles.spec.ts` |
| 7   | Dragging a handle always rounds the committed value to the nearest integer; holding Shift during the drag snaps it to the nearest multiple of 10 instead                                                                          |  ✅  | ✅ `gap-handles.spec.ts` |

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

**Negative gap, requested as a direct follow-up** ("musimy pozwolić na ujemne wartości... W right
panel oraz na canvas na handlerach. Można schodzić ile się chce"): the drag handle's
`continueAutoLayoutGapDrag.ts` used to clamp with `Math.max(0, ...)`; the RightPanel's
`GapField/constants.ts` used to pass `GAP_MIN = 0` into its `ScrubbableInput` scrub-drag gesture.
Both floors are gone now (`GAP_MIN` is `-Number.MAX_SAFE_INTEGER`, matching `GAP_MAX`'s existing
symmetric ceiling) — nothing else needed to change: the RightPanel's text-input blur path
(`useGapCommit.ts`) never clamped to begin with, `handleUpdateNode` doesn't clamp any field, and
the reflow engine (`getAutoLayoutChildPositions.ts`/`getAutoLayoutWrappedChildPositions.ts`) already
just accumulates `offset += size + gap` with no floor, so a negative value flows straight through
and lets children overlap — no special-casing required. The separate "Auto gap" distribution
algorithm (`getDistributedGap.ts`) keeps its own unrelated `Math.max(0, ...)`, since it computes
_leftover space_ to spread, not a manually-typed number, and Auto mode ignores the stored gap field
entirely while active (see "Auto gap" below) — allowing negative manual gap doesn't touch it. The
Smart Selection gap-drag (`continueSmartSelectionGapDrag.ts`, a separate feature that repositions
arbitrary selected nodes rather than writing a frame's `horizontalGap`/`verticalGap`) still clamps
at 0 — out of scope, not mentioned in the request.

## Auto gap

Each of `horizontalGap`/`verticalGap` can independently carry a `horizontalGapMode`/`verticalGapMode`
of `'auto'` (default, unset, is `'fixed'` — the plain shared-number behaviour above). In `'auto'`
mode the stored gap number is ignored for positioning: `getAutoLayoutChildPositions` /
`getAutoLayoutWrappedChildPositions` instead distribute the axis's leftover space
(`getDistributedGap`: `(availableSpace - childrenSize) / (itemCount - 1)`, clamped to 0) evenly
between the children — first item flush to the content box's start edge, last item flush to its end
edge, primary-axis alignment (start/center/end) moot since the block always saturates the full axis.
Wrap's counter-axis (the gap between wrapped lines) has its own independent auto mode, computed the
same way per the whole block against the counter axis. Because this lives in the same
`getAutoLayoutSyncPositions` → `computeAutoLayoutPositions` pipeline every other auto-layout
mutation already flows through, it applies to _any_ store change that touches the frame's box, not
only a canvas resize drag — matching how the constraints/alignment reflow work
(`syncConstrainedFrameChildren`) already behaves for freeform frames.

On a `hug` sizing axis the math self-degrades to the plain fixed value with no special-casing needed:
hug size is defined as `Σchildren + fixedGap * (n-1)`, so once hugged, `availableSpace - childrenSize`
already equals exactly `fixedGap * (n-1)` — auto and fixed produce the identical position. The same
holds when a `fill` child has already consumed the leftover primary space before the gap distribution
runs.

The RightPanel's `GapField` end-adornment is a permanent chevron (`UITools.ButtonMenu`, mirroring
`ColumnDimensionsField`'s own sizing-mode chevron) opening `ColumnGapModeMenu` — a `PopoverItem` list
showing the live gap value (Fixed), an `Auto` option (hidden when that axis's own frame sizing mode
is `hug`, since toggling it there would be a no-op per the math above), and a placeholder, currently
inert, "Apply variable…" item. The Fixed option's displayed number is never the stale stored one:
`getAutoLayoutEffectiveGaps` reads it straight off the already-synced sibling bounds (reusing the same
`getAutoLayoutWithinLineGaps`/`getAutoLayoutBetweenLineGaps` geometry the gap handles use), so
switching from auto back to fixed commits whatever the live distributed gap actually was. The numeric
input itself is never disabled — while auto it holds the literal string `"Auto"` as its own `value`
(the field's `type` swaps to `text` for this, back to `number` once fixed) rather than a placeholder,
so a click selects it like any other text ready to be typed over. Overwriting it with a real number
(or dragging the scrub icon, which always produces a real number) commits it and clears the mode back
to fixed in the same dispatch, exactly as if the user had opened the menu and picked Fixed; blurring
with anything that isn't a valid number (including leaving it untouched) reverts the display back to
the literal `"Auto"` text and leaves the store alone. The dead
`isGapAutoHorizontal`/`isGapAutoVertical` plumbing already built into `AlignmentArea`/`AlignmentOption`
(collapsing the alignment picker's 3×3 grid into 3 cross-axis-only choices, since the primary-axis
alignment component is moot once gap is auto) is now wired to these real values instead of a
hardcoded `false`. On canvas, the draggable gap handles (`getAutoLayoutGapHandles`) are hidden for
whichever axis is in auto mode — there is no longer a single shared number for a handle to drag.

| #   | Scenario                                                                                                         | Unit |           E2E            |
| --- | ---------------------------------------------------------------------------------------------------------------- | :--: | :----------------------: |
| 1   | A single-line frame's children distribute evenly across the content box, first/last flush to the edges           |  ✅  |            —             |
| 2   | Each wrapped line distributes its own children independently; the counter (between-line) axis has its own toggle |  ✅  |            —             |
| 3   | A `hug`-sized axis degrades to the identical fixed-gap layout, with no visible difference on toggle              |  ✅  |            —             |
| 4   | Setting the mode alone (no resize) immediately re-flows the children, same as any other `updateNode`             |  ✅  |            —             |
| 5   | The canvas gap-drag handles disappear for whichever axis is in auto mode                                         |  ✅  |            —             |
| 6   | Toggling a frame to auto gap on the canvas, then live-resizing it, keeps the children evenly redistributed       |  ✅  | ✅ `gap-handles.spec.ts` |
| 7   | Switching from auto back to fixed via the menu commits the live distributed value, not the stale stored one      |  ✅  |            —             |
| 8   | Typing a value (or scrubbing) while auto commits it and clears the mode back to fixed in one dispatch            |  ✅  |            —             |
| 9   | The Auto menu option is hidden when that axis's own frame sizing mode is `hug`                                   |  ✅  |            —             |
| 10  | The auto-mode input holds the literal `"Auto"` text as its own value (`type="text"`), not a placeholder          |  ✅  |            —             |
| 11  | Blurring with invalid/empty input while auto reverts the display to `"Auto"` and leaves the store untouched      |  ✅  |            —             |

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
| 10  | Under the updated Layout engine, fill children with different inside strokes split space so their **content areas** are equal (each box = its content share + its own inside-stroke width); under legacy they split total width evenly, ignoring child strokes                                 |  ✅  |            —             |

#10 is unit-only, same rationale as #3–#5: `getAutoLayoutChildStrokeInset.spec.ts` and
`getAutoLayoutFillSizes.spec.ts` pin the content-share math exactly per `layoutVersion`, and there is
no way to author a stroked fill child from the e2e `DesignPage` model yet (the stroke-section UI is a
later phase, and `store.getState()` is unreachable from e2e).

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
| 15  | Hovering the RightPanel's W (or H) field paints the whole hint set on the canvas: a coloured line on the frame's own edge, the Min line where set, and the Max bracket where set with slack; hovering Min W / Max W / Min H / Max H alone paints only that one guide                                             |  ✅  | ✅ `min-max-sizing.spec.ts` |
| 16  | The Max bracket only draws while the current size is below the Max (there is slack to show); it is a red line at the Max with a red label, plus two blue arrow-tipped dashed connectors reaching out from the frame's far edge — and for height it extends **downward** from the bottom edge                     |  ✅  |              —              |
| 17  | The hint guides are geometry-transformed into a rotated frame's own local space (`rotatePoint` about the frame centre, same convention as `getRotatedNodeBounds`), so every line, arrowhead and label offset follows the tilted edges rather than staying world-axis-aligned                                     |  ✅  |              —              |
| 18  | The hover state is ephemeral `TDesignState.hoveredDimensionField` (one of six field ids or null); it clears on mouse-leave and on any real selection change, and the canvas repaints without the guides                                                                                                          |  ✅  | ✅ `min-max-sizing.spec.ts` |

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
rows at once (its `RemoveFit` icon had to be added to `@xigma/components`' shared icon set first).
Committing a field to 0 (or below) is the same "remove this constraint" for that one
bound: it clears the node field and un-reveals the row in one step, rather than flooring to the
global dimensions minimum the way the plain Fixed width/height field does. Every Min/Max commit also
re-clamps the frame's own width/height immediately (`clampAutoLayoutSize` against the resulting
bounds), so a Max that is smaller than the current size takes effect at once even on a Fixed-sized
frame that nothing else would recompute. The main Width/Height
field's own leading "W"/"H" label swaps to the existing `WidthRestricted`/`HeightRestricted` icon
(the same icons `x-design`'s analogous field uses for its "attached" state) the moment either bound
is shown — real or still-empty — so the field visibly signals "this axis is constrained" independent
of whether a number has been typed yet.

Hovering any of the six dimension fields (W, H, Min W, Max W, Min H, Max H) publishes its id into a
new ephemeral `TDesignState.hoveredDimensionField`; `useDimensionHintGuides` (mounted in `Canvas`
next to `useHoverHighlight`) turns that plus the single selected frame into a `TDimensionHintGuides`
value on `transform.dimensionHintGuidesRef`, and `drawDimensionHintGuides` paints it every frame —
its own render pass, separate from the Alt-hover distance guides so there is no shared-state
regression risk. `getDimensionHintGuides` is the pure geometry: the W/H hover returns the frame's
own edge line plus whichever of Min / Max apply, a single-field hover returns just that one guide,
the Max bracket is suppressed once the size has caught up to the Max, and everything is finally run
through `rotatePoint` about the frame centre so a rotated frame's guides follow its tilted edges.
Lines carry a `'blue' | 'red'` tone and an optional `arrowAtEnd`. The frame's own edge line is blue;
every Min guide and its label are red; the Max guide's own line and label are red too, and only its
two arrow-tipped dashed connectors — the "reach" out to the Max — stay blue. The arrowhead is two
short strokes back along the segment, so it orients itself correctly after rotation for free. Labels
reuse `drawValueLabel` with a per-tone fill. The hover clears on mouse-leave and on
any real selection change (`handleSetSelection`).

Unit-only for the algorithm itself (the redistribution loop, the bounded-hug-grouping edge cases,
the Fixed-commit and drag-resize clamps, the reveal/clear state machine, the hint-guide geometry
including rotation) — exhaustively covered without a browser. What only a real browser proves: the
RightPanel's toggle-then-edit flow actually reaching the store, Wrap visibly re-flowing children
onto a second line the instant Max makes it eligible, and a panel hover actually repainting the
WebGL canvas with the hint guides and clearing them on leave — that's `min-max-sizing.spec.ts`.

## Padding

The RightPanel's `LayoutSection/ColumnPadding` (shown only for `horizontal`/`vertical` frames)
writes `paddingTop/Right/Bottom/Left`, which `getFramePadding` already feeds into
`syncAutoLayoutChildren`. Merged mode has two inputs (`left`+`right`, `top`+`bottom`): a single
number sets both sides, `"5, 2"` sets them asymmetrically (`parsePaddingPair`), and the scrubber
carries one delta onto both sides. An "Individual padding" button toggles to four side inputs
(local component state, not persisted).

| #   | Scenario                                                                                                      | Unit | E2E                  |
| --- | ------------------------------------------------------------------------------------------------------------- | :--: | :------------------- |
| 1   | Typing a merged horizontal padding pushes the frame's first child right by that amount, live                  |  ✅  | ✅ `padding.spec.ts` |
| 2   | A `"10,50"` merged value sets `paddingLeft`/`paddingRight` asymmetrically and the field shows `"10, 50"` back |  ✅  | ✅ `padding.spec.ts` |
| 3   | The Individual-padding toggle swaps the two merged inputs for four side inputs, each moving only its own side |  ✅  | ✅ `padding.spec.ts` |
| 4   | `getPaddingPairValue` collapses equal sides to one number and splits unequal ones as `"a, b"`                 |  ✅  | —                    |
| 5   | `parsePaddingPair` strips stray characters, mirrors a lone number to both sides, and falls back per side      |  ✅  | —                    |
| 6   | Empty / non-numeric commit writes nothing; negative values clamp to 0                                         |  ✅  | —                    |

Unit-only for the parsing/clamping and the merged↔individual field derivation
(`useColumnPadding`, `pairField`, `sideField`, and the two `utils/`). What the browser adds:
the panel input → `updateNode` → `syncAutoLayoutChildren` → child reflow round-trip — that's
`padding.spec.ts`.

## Padding handles

A second, canvas-native way to set the same `paddingTop/Right/Bottom/Left` fields, styled after the
existing gap handles above (same bar shape, same hit-testing/rotation strategy) but recoloured blue
(`AUTO_LAYOUT_PADDING_HANDLE_FILL`, `#0d99ff`) instead of the gap system's pink, and with different
value math per side.

| #   | Scenario                                                                                                                                                                                                                                    | Unit |                      E2E                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: | :--------------------------------------------: |
| 1   | A padded side (>0) always shows its handle bar while the selected frame is merely hovered anywhere — no need to hover that specific handle — but its 45deg hatch fill only once the pointer is actually inside that side's own padding band |  ✅  |          ✅ `padding-handles.spec.ts`          |
| 2   | A zero-padding side only shows its handle once the pointer is within reach of it, and shows no hatch (nothing to fill)                                                                                                                      |  ✅  | ✅ `padding-handles.spec.ts` (visibility test) |
| 3   | Dragging a zero-padding handle sets that side's padding to the pointer's live distance from the frame edge — absolute, like corner-radius, not delta                                                                                        |  ✅  |          ✅ `padding-handles.spec.ts`          |
| 4   | Dragging an already-padded handle grows/shrinks the value by the drag delta instead — the handle stays under the cursor, like the gap handles                                                                                               |  ✅  |          ✅ `padding-handles.spec.ts`          |
| 5   | Every side clamps at 0 instead of going negative, in either drag mode                                                                                                                                                                       |  ✅  |                       —                        |
| 6   | While dragging, the bar/hatch for that one side is replaced by a single solid blue guide line at the live padding boundary (plus the value label) — untouched sides keep showing normally                                                   |  ✅  |                       —                        |
| 7   | Handle geometry and hit-testing both run in the frame's local (un-rotated) space, so a rotated frame's handles/cursors follow its own rotated axes                                                                                          |  ✅  |                       —                        |
| 8   | A padded side's handle sits centred in the middle of the padding band (half the padding value in from the edge), not flush against the content boundary                                                                                     |  ✅  |          ✅ `padding-handles.spec.ts`          |
| 9   | A zero-padding handle sits just outside the frame's own edge visually, but is still grabbable well short of that 1px marker — its reach extends up to 30px in from the edge                                                                 |  ✅  |          ✅ `padding-handles.spec.ts`          |
| 10  | The zero-padding grab cursor (`gap-base.png`) gets its own distinct angle per side (a 90deg clockwise step around the frame), not one shared per axis like the already-padded `gap` cursor                                                  |  ✅  |                       —                        |
| 11  | Once a zero-padding drag actually starts moving, the cursor switches from `gap-base` to the plain `gap` icon — `gap-base` is only the pre-grab hover affordance, not the drag cursor itself                                                 |  ✅  |                       —                        |
| 12  | Clicking a handle without dragging (pointerdown+pointerup, no move) opens a small HTML popup — icon + a bare input pre-filled with that side's current value — instead of starting a drag                                                   |  ✅  |          ✅ `padding-handles.spec.ts`          |
| 13  | Enter (or blur, e.g. clicking elsewhere on the canvas) commits the typed value and closes the popup; committing never clears the frame's own selection                                                                                      |  ✅  |          ✅ `padding-handles.spec.ts`          |
| 14  | Escape closes the popup without changing the padding value                                                                                                                                                                                  |  ✅  |          ✅ `padding-handles.spec.ts`          |
| 15  | While the popup is open, the WebGL guide line for that side still draws (like an active drag), but the WebGL value-label text is suppressed so it doesn't double up with the popup's own number                                             |  ✅  |                       —                        |
| 16  | Dragging a handle always rounds the committed value to the nearest integer; holding Shift during the drag snaps it to the nearest multiple of 10 instead                                                                                    |  ✅  |          ✅ `padding-handles.spec.ts`          |

Requested directly, immediately after the RightPanel padding controls above: "Screen przedstawi
sytuację kiedy padding jest zero i pojawia się możliwość ustawienia padding... To powinno mniej
więcej działać jak z radius na rect... Jeśli padding jest ustawiony są dostępne handlery i nie
trzeba w nich wjechać myszką... Zachowanie podobne jak ustawienie gap z tego modelu... Weź pod
uwage obrót żeby handlery miały odpowiedni obrót... Handlery pojawiają się kiedy element jest
zaznaczony i najeżdżamy myszką." The two drag math modes are picked once, at grab time, from
whether that side's _current_ value is 0 (`armAutoLayoutPaddingDrag` sets
`mode: originalPaddingValue === 0 ? 'absolute' : 'delta'`) — a zero-padding drag reads like a
corner-radius drag (`getAutoLayoutPaddingDragValue`'s absolute branch: distance from the relevant
frame edge, clamped to 0), while a positive-padding drag reads like a gap drag (original + signed
delta along the drag axis, the sign flipped for the right/bottom sides since dragging _toward_ the
frame's centre grows those). Once a drag starts it stays in that mode for the whole gesture, even
if the value crosses back through 0 — mirroring corner-radius, not re-deciding per frame.

Geometry (`getAutoLayoutPaddingHandles`, `src/utils/canvas/autoLayoutPadding/`) mirrors
`getAutoLayoutGapHandles`'s local↔world rotation strategy, but per-side bands (`getAutoLayoutPaddingBand`,
the inverse of `getAutoLayoutContentBox`'s inset) rather than per-gap rects. A padded handle centres
itself in the middle of that band (`getAutoLayoutPaddingHandleInset` insets by `value / 2`); a
0-padding handle instead sits `AUTO_LAYOUT_PADDING_ZERO_HANDLE_OUTSET_PX` (1 screen px) _outside_
the frame's own edge (the same inset formula, given a negative offset). Since that 1px marker alone
would be nearly unhittable, its hit-test (`isAutoLayoutPaddingHandleHit`) widens into a directional
strip along the drag axis reaching `AUTO_LAYOUT_PADDING_ZERO_HANDLE_REACH_PX` (30 screen px) in from
the edge — measured off the edge itself, not off the tiny marker — while keeping the ordinary
circular tolerance on the perpendicular axis and for any already-padded side. That reach overlaps
the frame's own plain resize-edge handle right at the pixel-exact edge midpoint; `armResizeOnPointerDown`
still wins exactly there (it runs first in `ARM_RESOLVERS`), so the padding handle's own e2e grabs
land a few pixels off that exact point rather than on it. The guide line shown mid-drag
(`drawAutoLayoutPaddingGuideLine`) is a plain solid `drawLine`, unlike the dashed guides most other
handle systems draw. The cursor reuses the existing `'gap'` cursor once a side already carries
padding (same per-axis angle the gap handles use), but adds a new `'padding'` kind backed by the
previously-unused `assets/icons/cursors/gap-base.png` asset for the zero-padding grab affordance —
since that asset is directional rather than a symmetric double-arrow,
`getAutoLayoutPaddingCursorAngle` gives each of the four sides its own angle (a 90deg clockwise step:
top/right/bottom/left) instead of sharing one per axis, confirmed side-by-side live.
Unit-only for the geometry, hit-testing, hover/cursor resolution and every draw layer (bars, hatch, guide line, label) — pure
functions or narrow WebGL call-verification. `padding-handles.spec.ts` covers the one thing only a
real browser proves: the actual pointerdown→pointermove→pointerup gesture correctly reading back
into the store as a persisted `paddingLeft` change, in both math modes, plus the
selected-and-hovered visibility gate.

**Rounding and Shift-snap** (requested as a direct follow-up, alongside the same ask for the gap
handles above): `continueAutoLayoutPaddingDrag.ts`/`continueAutoLayoutGapDrag.ts` both pass their
raw computed value through the shared `getAutoLayoutHandleSnappedValue(value, event.shiftKey)` —
plain `Math.round(...)` normally, or snapped to the nearest 10
(`AUTO_LAYOUT_HANDLE_SHIFT_SNAP_STEP_PX`) while Shift is held — before dispatching. Applies to both
handle families identically; the RightPanel's own numeric fields are untouched (they already
round/parse their own way).

### Click (not drag) opens a value popup instead of doing nothing

A plain click on a handle used to be a silent no-op (no `pointermove` ever fired, so
`continueAutoLayoutPaddingDrag` never dispatched anything). It now opens
`AutoLayoutPaddingEditOverlay`, a real DOM overlay (not WebGL) mounted in `Canvas.tsx` next to the
other name/width edit overlays — distinguished from an actual drag via a `hasMoved` flag on
`TAutoLayoutPaddingDragState`, set by `continueAutoLayoutPaddingDrag` on the first move and checked
by `disarmAutoLayoutPaddingDrag` on release. Because the trigger lives inside that imperative
resolver chain rather than a React hook, opening the popup is a plain Redux dispatch
(`startAutoLayoutPaddingEdit`) into a new `state.design.editingAutoLayoutPadding` field, read back
by the overlay via `useSelector` — the same shape `TextEditOverlay`/`startTextEdit` already uses,
picked over the `useDoubleClickActivation` + local `useState` pattern the Frame/Section/vector-width
overlays use, since none of those hook-only patterns apply to a plain click already handled deep in
`armResolvers`. The popup's own `onPointerDown` stops propagation so clicking into it never reaches
the canvas's pointerdown handling — this is what keeps the underlying frame selected through a
commit-on-blur, not any special-cased deselect-suppression logic.

### Guide lines driven from the RightPanel, not just the canvas

Hovering a `ColumnPadding` field in the RightPanel (`padding.spec.ts`'s "rightpanel-guide" tests)
also draws the padding guide line(s) on the canvas, without needing any mouse activity on the
canvas itself — hovering the merged horizontal/vertical field shows both of that axis's sides;
hovering one individual side (with "Individual padding" toggled on) shows only that one. This
reuses the exact same `drawAutoLayoutPaddingGuideLine` the canvas drag path draws, but line-only —
no bar, no hatch, no cursor change — via a new, separate ref
(`refs.hover.rightPanelPaddingGuideRef: { frameId, sides } | null`) so it can't be conflated with
the canvas-pointer-driven hover/drag state that already exists. `PaddingInput`'s `onMouseEnter`/
`onMouseLeave` (wired through `sideField`/`pairField` via a shared `buildPaddingHoverHandlers`)
write/clear that ref through `useCanvasRefsContext()` — the same context+ref round-trip
`RightPanel.tsx` already uses for `layout.rightPanelWidthRef`, just newly extended to a hover
affordance. Because `drawScene`'s `requestAnimationFrame` loop re-reads every ref fresh each frame
regardless of which side of the app wrote it, no render-loop plumbing changed — the canvas just
picks the new ref up automatically. Updates live while scrubbing a field too, since the line's
position is recomputed from the frame's _current_ padding value every frame, not snapshotted at
hover-start.

## Auto layout settings popover

The "Properties" (gear) button on the Alignment row opens `PopoverAutoLayoutSettings`, a popover with
one row per engine-level setting: Inside stroke (legacy only), Canvas stacking, Align text baseline,
Auto spacing, Layout version. Every row is the same shape — a control → its own `commitXChange`
util → `updateNode` → the `getAutoLayoutSyncPositions` pipeline reruns → the canvas repaints. The unit
suite pins each `commitXChange`, each hook (persist + no-frame fallback) and the per-setting engine
maths exhaustively; the only thing a browser adds is proof the real popover control dispatches and the
engine reacts through the full round-trip. So `settings.spec.ts` covers that once per distinct
_effect kind_ rather than once per row, reading the resulting child geometry back out of the store
(same technique as `gap-handles.spec.ts`), except Canvas stacking whose effect is purely paint order
and is read via a pixel sample.

| #   | Scenario                                                                                                                                                                                             | Unit |          E2E          |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: | :-------------------: |
| 1   | Switching Layout version legacy↔updated in the popover reruns the engine end to end: a lone "between" child recentres under legacy, snaps to the start under updated, and the round-trip restores it |  ✅  | ✅ `settings.spec.ts` |
| 2   | The Auto spacing control repositions a row of children differently for between / around / evenly, and round-trips back to the original between layout                                                |  ✅  | ✅ `settings.spec.ts` |
| 3   | The Canvas stacking control flips which of two overlapping children (negative auto gap, legacy) paints on top, and round-trips                                                                       |  ✅  | ✅ `settings.spec.ts` |
| 4   | Inside stroke (legacy only) — the frame stroke's contribution to child layout padding                                                                                                                |  ✅  |           —           |
| 5   | Align text baseline — text children aligning by baseline vs by box                                                                                                                                   |  ✅  |           —           |

#4 and #5 stay unit-only: #4's visible delta is a few px of child inset that needs a stroked frame and
per-side measurement (`getFrameLayoutPadding.spec.ts` asserts it exactly per `layoutVersion`), and #5
needs text children of differing font sizes for a small, font-metric-dependent shift
(`getAutoLayoutBaselineExtent` / baseline-offset specs cover it) — neither is a browser-timing or
paint-order concern a screenshot catches that the unit suite can't. #1–#3 earn e2e because they prove
the popover→dispatch→engine→canvas wiring that no unit exercises; the three cover the two distinct
observable effects (child _position_ via store readback, paint _order_ via pixel sample).
