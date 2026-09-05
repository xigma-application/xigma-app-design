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

| #   | Scenario                                                                                                                                    | Unit |         E2E          |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------- | :--: | :------------------: |
| 1   | Dragging a child to a new position among its own siblings reorders it, without ejecting it                                                  |  —   | ✅ `reorder.spec.ts` |
| 2   | Dragging a child swaps past a sibling the instant it touches that sibling's own near edge (not its midpoint), and reverts at that same edge |  —   | ✅ `reorder.spec.ts` |

This is the one path here that a unit test genuinely can't stand in for: the real position math
(`getAutoLayoutDropTarget`'s `siblingPositions`, the live tween in `animateAutoLayoutReorder`) is
already covered exhaustively at the unit level, but whether an actual pointer drag ends up
committing the right index — real `mousedown`/`mousemove`/`mouseup` timing, not a synthetic
`moveNodes` dispatch — is only provable in a real browser. Asserted via the Layers panel's exact
row order (precise and unambiguous) rather than a canvas screenshot diff, since the three children
are identical green squares and a pixel diff would tell you _something_ changed without saying
what.

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
