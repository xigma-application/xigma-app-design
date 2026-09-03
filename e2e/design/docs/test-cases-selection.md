# Selection & manipulation — test case catalog

Test cases for selection, marquee, hover, resize/rotate/scale, snapping, grouping, and z-order that live in `e2e/design/selection/`.

## Line selection & dragging

Per the product spec (a line behaves like Figma's Line tool): selecting a line shows **no**
bounding-box outline (unlike every other node type) — just a thin highlight along the segment
itself plus two small endpoint handles (`drawPerNodeSelectionOutlines.ts`'s `NodeType.line`
branch). Dragging the line's **body** (away from either handle) moves both endpoints together,
exactly like moving any other node. Dragging an **endpoint handle** instead moves only that one
point, leaving the other fixed — genuinely new interaction code, since no resize/handle-drag
existed anywhere in the app before this (`getLineEndpointAtPoint.ts` + `armLineEndpointDrag.ts`,
checked in `handlePointerDown.ts` _before_ the generic whole-node hit-test, since a selected
line's handles must take priority over a body-drag once the pointer is close enough to one).

| #   | Scenario                                                                                                        | Unit |          E2E           |
| --- | --------------------------------------------------------------------------------------------------------------- | :--: | :--------------------: |
| 24  | Dragging a selected line's body (away from both endpoints) translates both endpoints by the same delta          |  ✅  | ✅ `line-drag.spec.ts` |
| 25  | Dragging endpoint A moves only A; endpoint B stays exactly where it was                                         |  ✅  | ✅ `line-drag.spec.ts` |
| 26  | Dragging endpoint B moves only B; endpoint A stays exactly where it was                                         |  ✅  | ✅ `line-drag.spec.ts` |
| 27  | Hit-testing a line follows its actual angled path (perpendicular distance to the segment), not its bounding box |  ✅  |           —            |
| 28  | A selected line renders no rectangular bounding-box outline — only a thin highlight along its own path          |  ✅  |           —            |

#27/#28 stay unit-only: `isPointNearLine.spec.ts` and `getNodeAtPoint.spec.ts` already assert the
exact geometry precisely (a point inside the diagonal's bounding box but off the line itself must
miss), and `drawPerNodeSelectionOutlines.spec.ts` counts the exact WebGL draw calls to prove no
`drawRect` bounding-box stroke happens for a line — neither claim involves real-browser timing or
paint behavior a screenshot diff could catch that the unit suite can't; see "Why so few scenarios
get e2e coverage" below.

## Selection (Etap 5)

Setup shorthand: **A**, **B**, **C** are frames drawn left-to-right with a gap between each, all
with `parentId: null` (today, every frame shares the same parent — multi-selection is always a
"group selection", see [[xigma roadmap Etap 5]]).

| #   | Scenario                                                                                                                                                                                                                                | Unit |          E2E           |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: | :--------------------: |
| 1   | Plain click on an unselected node selects just that node                                                                                                                                                                                |  ✅  |           —            |
| 2   | Shift-click on an unselected node adds it to the selection                                                                                                                                                                              |  ✅  | ✅ `selection.spec.ts` |
| 3   | Shift-click on an already-selected node removes it                                                                                                                                                                                      |  ✅  |           —            |
| 4   | Plain click on a node that's part of an existing multi-selection, released **without moving**, collapses the selection to just that node                                                                                                |  ✅  |           —            |
| 5   | Plain click **+ drag** on a node that's part of an existing multi-selection moves the whole selection together; selection stays multi                                                                                                   |  ✅  |           —            |
| 6   | Plain click on a new, never-selected node while 2+ others are selected replaces the selection with just the new node                                                                                                                    |  ✅  |           —            |
| 7   | Plain click on empty canvas clears the selection                                                                                                                                                                                        |  ✅  |           —            |
| 8   | 2+ selected nodes sharing a parent render **one shared outline** spanning their combined bounds, not per-node outlines                                                                                                                  |  ✅  | ✅ `selection.spec.ts` |
| 106 | Pressing Escape clears the selection, the same as clicking empty canvas — works for any node type, not just text                                                                                                                        |  —   | ✅ `selection.spec.ts` |
| 9   | Click in the gap inside a shared multi-selection's bounds (no node there), released without moving, **deselects everything** — same as clicking empty canvas                                                                            |  ✅  |           —            |
| 10  | Click in the gap **+ drag** moves the whole multi-selection together (same as #5, entered via the gap instead of a node)                                                                                                                |  ✅  |           —            |
| 11  | Click on an **unselected node that happens to sit inside** a multi-selection's shared bounds does **not** replace the selection while the button is still held — the shared outline must stay visible for as long as the button is down |  ✅  | ✅ `selection.spec.ts` |
| 12  | Same as #11, released without moving: selection replaces to just that node (not deselected, unlike #9 — the difference is a real node was hit)                                                                                          |  ✅  | ✅ `selection.spec.ts` |
| 13  | Same setup as #11, but **dragged** instead of released in place: the original multi-selection (not the hit node) moves together, mirroring #10                                                                                          |  ✅  |           —            |

Scenarios 11–13 are today's fix — see `useSelectionTool/utils/handlePointerDown/armHitDrag.ts`.
The bug it corrected: the selection used to replace immediately on `pointerdown`, before the user
had released the button, which visibly flickered the outline away from the multi-selection the
instant the button went down on a node inside its bounds — even if the user only meant to drag the
whole group through the gap. `selection.spec.ts`'s coverage for #11/#12 asserts exactly this
timing: a screenshot taken while the button is still held must be pixel-identical to the
pre-press screenshot, and only the post-release screenshot may differ.

#106 is a new, requested-on-the-spot UX gap: Escape had no effect on selection at all before this —
the existing `useToolbarShortcuts.ts` Escape handler only reset `activeTool` back to `default`,
regardless of what (if anything) was selected. Fixed with a new `handleLeave.ts` util
(`useToolbarShortcuts/utils/`) that dispatches both `setActiveTool(default)` and `setSelection([])`
together, so this is deliberately generic — any selected node type deselects on Escape, not just
Text/Text-on-Path (those two just happen to be where the request originated, and where the
two-stage Escape behavior below adds its own extra layer). Since the fix lives in the existing
global `window`-level Escape listener, it has no unit-testable branch logic worth pinning beyond
`handleLeave.spec.ts`'s own direct assertion — the e2e version proves the real rendered selection
outline actually clears on a genuine `keydown`, the same "real browser + rendering" category the
rest of this file reserves e2e for.

## Selection under a moved viewport (Etap 4 × Etap 5)

Hit-testing (`getNodeAtPoint`) runs on `screenToWorld(clickPoint, viewport)`, so a wrong or stale
`viewport` read is exactly the kind of bug the unit suite is weakest at catching:
`useSelectionTool.spec.tsx` never sets a non-default viewport, so every unit test for scenarios
1–13 above runs at the identity viewport (`{x: 0, y: 0, zoom: 1}`) and would still pass even if
selection silently ignored pan/zoom entirely. This is real browser + coordinate-math integration
territory, so it's e2e-only.

| #   | Scenario                                                                                                      | Unit |          E2E           |
| --- | ------------------------------------------------------------------------------------------------------------- | :--: | :--------------------: |
| 14  | After panning the canvas (middle-mouse drag), clicking a frame at its new on-screen position still selects it |  —   | ✅ `selection.spec.ts` |
| 15  | After zooming the canvas (Ctrl/Cmd + wheel), clicking a frame at its new on-screen position still selects it  |  —   | ✅ `selection.spec.ts` |

Both tests sidestep re-deriving the app's exact pan/zoom math inside the test: #14 pans by a known
screen-pixel delta and clicks at `originalPoint + delta` (panning is a pure offset, so this is
exact); #15 zooms with the anchor point set to the frame's own on-screen center — `applyZoom`
guarantees the anchor point maps to the same world point before and after, so clicking that exact
same screen coordinate again is guaranteed to still hit the frame regardless of the resulting zoom
factor, without the test needing to know `ZOOM_STEP_WHEEL`/`ZOOM_MIN`/`ZOOM_MAX` or do any
multiplication itself.

There is no "reset view" action anywhere in the app (checked: no keyboard shortcut, no toolbar
button — `useToolbarShortcuts.ts` only has tool-switching keys) — nothing exists yet to write a
test case for. If that's wanted, it's a product feature to build first, not a test gap.

## Marquee selection (Etap 5, drag-select)

Dragging on empty canvas (no node hit, not inside an existing multi-selection's shared bounds)
arms a marquee instead of immediately clearing the selection — see
`useSelectionTool/utils/handlePointerDown/armMarqueeDrag.ts` and
`Canvas/utils/getCollidedNodes.ts`. Pattern ported from x-design's
`ViewBox/utils/getCollidedElements.ts` + `SelectableArea`.

| #   | Scenario                                                                                                    | Unit |          E2E           |
| --- | ----------------------------------------------------------------------------------------------------------- | :--: | :--------------------: |
| 16  | Dragging a marquee live-updates the selection (and its rendered overlay) on every move, before release      |  ✅  | ✅ `selection.spec.ts` |
| 17  | A frame the marquee only **touches** (partial overlap) gets selected in the default (no-modifier) mode      |  ✅  | ✅ `selection.spec.ts` |
| 18  | The same partially-overlapped frame is **excluded** when Control/Cmd is held — full containment is required |  ✅  | ✅ `selection.spec.ts` |

This is the one marquee scenario where e2e earns its keep the same way scenarios 14/15 do: the
default-vs-Control distinction is a live `event.ctrlKey`/`metaKey` read inside a browser pointer
event (`isControlPressed`, widened this session from `WheelEvent` to `MouseEvent` specifically so
`useSelectionTool` could reuse it for `PointerEvent`), not just branch logic — worth proving against
a real browser event, not only a synthetic `PointerEvent` in jsdom. `selection.spec.ts`'s Control
test sidesteps computing which exact pixels differ: it drags the identical marquee box twice (once
without, once with Control) and asserts the two resulting screenshots simply differ — proof enough
that the partially-overlapped frame's selection state flipped between the two runs.

## Hover highlight (Etap 5)

Moving the pointer over a frame with no button held shows a plain outline (no corner handles) —
see `useHoverHighlight/useHoverHighlight.ts` and
`useCanvasRenderLoop/utils/drawScene/drawHoverOutline.ts`. Hover state lives in a ref
(`hoverRef`, threaded through `drawScene` exactly like `draftRef`/`marqueeRef`), not Redux — it's
a pure rendering concern, updated every `pointermove`, with no other part of the app reacting to
it (no layers panel/inspector exists — verified absent, see [[xigma-playwright-mcp-testing]]).

| #   | Scenario                                                                                                                                                     | Unit |        E2E         |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--: | :----------------: |
| 19  | Moving the pointer onto a frame (no button held) shows its outline; moving off clears it                                                                     |  ✅  | ✅ `hover.spec.ts` |
| 20  | The hover outline never updates while any button is held (`event.buttons !== 0`), so it can't flicker mid-drag onto whatever the cursor happens to pass over |  ✅  |         —          |
| 21  | Hit-testing an ellipse uses its actual curve (`isPointInEllipse`), not its bounding box — resting inside the box but outside the curve does not hover it     |  ✅  | ✅ `hover.spec.ts` |

#20 is unit-only on purpose: proving "the ref was never written" is a one-line
`expect(hoverRef.current).toBeNull()` in `useHoverHighlight.spec.tsx`, but not cleanly provable via
screenshot diff in e2e — during an actual drag something else on screen is usually changing too
(a dragged node moving, a marquee's live selection), so a screenshot difference can't isolate
"did hover specifically fire" from "did the thing actually being dragged change". #19 stays e2e
because it's the same kind of real-paint-timing claim as the pan/zoom scenarios above: the unit
test can assert the ref value in jsdom, but only a real browser proves the WebGL canvas actually
repaints in response.

**Gotcha for other e2e tests**: hover highlight is active by default whenever the pointer rests
over a frame with `activeTool === default`, so `page.mouse.move`/`pointerDown` calls elsewhere can
now change what a screenshot looks like _just by resting on a different frame_, independent of
whatever that test is actually checking. `selection.spec.ts`'s gap-click test hit this: it used to
assert a held-button screenshot was byte-identical to the pre-press one, but `pointerDown`'s own
internal `mouse.move` (which happens before `mouse.down`, so `buttons === 0` at that instant) now
shifts the hover target to the node about to be pressed. Fix: explicitly `pointerMove` onto that
same point _before_ capturing the "before" screenshot too, so hover state matches in both
captures and the comparison isolates the thing actually under test.

## Scale tool

Mirrors Figma's Scale tool: shares its toolbar slot with the default (Move) and Hand tools
(`TOOL_GROUP_ITEMS[default] = [default, hand, scale]`, `lastMouseTool` remembers which of the three
was picked last), with its own keyboard shortcut ("K", `useToolbarShortcuts.ts`). Unlike a plain
resize, dragging any resize handle while Scale is active always scales both dimensions
proportionally — no Shift key needed, and unlike a plain Shift-lock resize (which only aspect-locks
corner handles), Scale locks edge handles too. The pivot always sits on the side/corner opposite the
grabbed handle, same convention as a plain resize's corner anchor: grabbing a corner pivots on the
opposite corner (`getScaleAxisAnchors`'s 'min'/'max' sides, identical to `getResizeAxisAnchors`),
grabbing an edge pivots on the center of the opposite edge (the edge's untouched axis resolves to
its own center instead of `null`) — `getScaleBounds`/`getScaleAxisScale` implement the
center-anchored math a plain resize's `getAspectRatioLockedRect`/`getSignedScale` don't support.
Cursor swaps from `resize.png` to `scale.png` while hovering a handle (`useHoverHighlight.ts`).

| #   | Scenario                                                                                                                                   | Unit |           E2E           |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------ | :--: | :---------------------: |
| 69  | Pressing "K" activates the Scale tool, shown checked on the shared default/hand/scale button                                               |  —   | ✅ `scale-tool.spec.ts` |
| 70  | Hovering a resize handle with Scale active applies a different cursor than the plain resize cursor                                         |  —   | ✅ `scale-tool.spec.ts` |
| 71  | Grabbing an edge handle scales both dimensions proportionally, unlike a plain resize on the same edge                                      |  ✅  | ✅ `scale-tool.spec.ts` |
| 72  | Grabbing the top edge pivots at the bottom-center point; grabbing a corner pivots at the opposite corner (same as a plain resize's anchor) |  ✅  |            —            |
| 73  | With the Scale tool inactive, the same edge drag leaves the untouched axis alone (no forced lock)                                          |  ✅  |            —            |

Scenarios #72/#73 are precise anchor-math claims already expressed exactly by
`continueResizeDrag.spec.ts`'s "Scale tool" describe block and `getScaleBounds`/`getScaleFactors`
unit tests — an e2e screenshot diff can only prove "something changed," not the exact pivot
coordinate, so those stay unit-only per the "why so few scenarios get e2e coverage" rationale below.

## Resize (Etap 10)

Corner handles have been rendered since Etap 5 (`drawCornerHandles`), but dragging them did nothing.
This adds real 8-direction resize (4 corners + 4 edges, edges hit-tested against the outline itself,
no new visual handles) for a single selected non-line node **or** a group selection (2+ nodes
sharing a parent) — both scale relative to an origin bbox via one shared formula, so a single node is
just the degenerate case of a "group" of one (`continueResizeDrag.ts`). Line nodes keep their
existing endpoint-drag (`armEndpointDrag.ts`); a line inside a resized **group** still scales its
`x1/y1/x2/y2` proportionally. Shift on a corner locks the aspect ratio, reusing
`getAspectRatioLockedRect` (already used for Media's aspect-locked placement) anchored at the
opposite corner (`getResizeAnchorPoint.ts`); edges intentionally don't lock (only corners do, per
the roadmap wording). The resize cursor rotates per handle direction on an offscreen `<canvas>`
(`getRotatedResizeCursorUrl.ts`, mirroring `x-design`'s `useChangeCursor/utils.ts` and xigma's own
`createArmedCursor.ts`) instead of static pre-rotated PNGs, specifically so it keeps working once
node `rotation` becomes editable later (`getResizeCursorAngle.ts` already adds `node.rotation` into
the angle for the single-node case).

| #   | Scenario                                                                                                              | Unit |         E2E         |
| --- | --------------------------------------------------------------------------------------------------------------------- | :--: | :-----------------: |
| 43  | Hovering each of the 8 resize handles applies a distinctly rotated cursor                                             |  —   | ✅ `resize.spec.ts` |
| 44  | Dragging a corner handle resizes the node while the opposite corner stays anchored in place                           |  ✅  | ✅ `resize.spec.ts` |
| 45  | Holding Shift while dragging a corner locks the aspect ratio, unlike a free drag of the same delta                    |  ✅  | ✅ `resize.spec.ts` |
| 46  | Resizing a group selection scales every member (including a line's endpoints) proportionally                          |  ✅  |          —          |
| 47  | Edge handles resize only their own axis; Shift has no aspect-lock effect on them                                      |  ✅  |          —          |
| 65  | Resizing anisotropically (scaleX≠scaleY) projects the scale onto a rotated member's own local axes                    |  ✅  |          —          |
| 66  | Resizing a single rotated node via a handle scales along the node's own local axis, not the raw world axis            |  ✅  | ✅ `resize.spec.ts` |
| 67  | A rotated GROUP MEMBER's flipX/flipY toggles off its own local axis when the drag crosses, not the group's world axis |  ✅  |          —          |
| 68  | Dragging a single rotated node's handle past its anchor mirrors it, instead of snapping back to the original box      |  ✅  | ✅ `resize.spec.ts` |

#43 is e2e-only: the actual claim is a real `Image` decode plus the browser accepting a rotated
data-URL as a live CSS `cursor` value — nothing a jsdom unit test can assert (`getResizeCursorAngle`
and `getRotatedResizeCursorUrl` are both unit-tested for their own pure logic, with `Image`/canvas
stubbed out entirely). It was also the one genuinely surprising integration bug found while writing
this suite: the very first hover in a cold page can take close to a second for the lazily-created
cursor image to finish decoding, and nothing re-applies the cursor without a further `pointermove` —
so the test has to nudge the pointer repeatedly until it lands (`waitForResizeCursor` in
`resize.spec.ts`), the same way a real user's mouse jitter would, instead of a single fixed wait.

#46/#47 stay unit-only: `continueResizeDrag.spec.ts` already asserts the exact scaled
`x/y/width/height` (and line `x1/y1/x2/y2`) via `store.getState()`, precisely the kind of two-line
Redux assertion the "why so few scenarios get e2e coverage" section below argues a screenshot diff
can't improve on.

#65 is unit-only for a different reason than #46/#47: `continueResizeDrag.spec.ts` asserts the exact
`√((scaleX·cosθ)²+(scaleY·sinθ)²)`-projected width/height to 2 decimal places (a level of precision
a screenshot comparison can't express at all), and the only way to prove the _rendered_ pixels match
would be either exact pixel-position decoding (this suite has no PNG-pixel-inspection dependency —
every existing e2e assertion is whole-screenshot `.equals()`/`.not.equals()`, not per-pixel reads) or
reproducing the exact rotated reference shape via a second, imprecise rotate-drag (unlike the
axis-aligned Media/Text mirror references in #49/#50 below, which need no rotation step and so land
on exact pixels by construction). Verified manually in the browser instead (Playwright MCP): a
two-rectangle group with one member rotated, stretched horizontally only, now keeps the rotated
member fully inside the shared bbox instead of spilling past its right/bottom edges.

#66 gets e2e coverage (unlike #65) because, unlike a proportional scale, the underlying bug here is
exactly the kind of "wrong screen pixel" defect the existing handle-hit-test assertion style
(`waitForResizeCursor`, already used by #44/#53) can pin down precisely: the fix rotates a 100x100
square by a clean +90deg, drags its (now vertically-positioned) local "e" edge handle further along
that axis, and asserts a handle is found exactly at the drag destination while the opposite ("w")
anchor edge hasn't moved. Confirmed this actually discriminates the bug by reverting the fix locally
and re-running the test: it fails with "resize cursor never applied", because the pre-fix code
compared the raw screen point directly against the node's unrotated local bounds and put the new
edge ~100px away from the drag destination, right back at the node's original center.

#67/#68 fix a real, user-reported gap the #66 fix didn't cover: neither prior local-axis fix touched
the **mirror/flip crossing** path specifically. #67 is the group-resize half: `flipX`/`flipY` was
computed straight off the group's raw world-space `scaleX`/`scaleY` sign, ignoring the member's own
rotation entirely — the same class of bug `getRotatedAxisScales` already fixed for width/height (#65),
just never applied to the flip flag. Fixed by projecting the world scale onto the member's own local
axes (`scaleX·cos²θ + scaleY·sin²θ` for local X, the complementary term for local Y) before reading
its sign — unit-only for the same reason as #65 (exact signed-projection math, no pixel story).

#68 is the more fundamental single-node bug: `getRotatedAnchorSolver` (added for #66) assumed the
anchor corner always sits on the same local side of the box, an assumption that breaks the moment a
drag crosses the anchor — the anchor corner then sits on the box's _opposite_ local side. Left
unfixed, a full symmetric crossing (same size, mirrored position) resolved to the exact original box,
i.e. **nothing visibly happened** — precisely the "obrócony element nie robi mirror" behavior
reported live. Fixed by flipping the anchor-side sign per axis whenever that axis's own scale went
negative (crossed). Verified against the full real DOM pointerdown→pointermove→pointerup chain (not
just a direct `continueResizeDrag` call, which would have missed a bug living in the surrounding
event wiring) via a before/after screenshot diff plus an independently-constructed reference box —
both before reverting the fix to confirm the test fails without it, and after to confirm the fix
holds through the real interaction path.

## Mirror/flip on resize crossing (Etap 10)

Dragging a handle "through" the opposite anchor used to stick at `MIN_SHAPE_SIZE`
(`computeResizedRect.ts`); it now mirrors instead — the anchor stays put, the box grows on the other
side, and Media/Text also get real content-level `flipX`/`flipY` (UV swap in `drawImage.ts`, a
geometric mirror of the whole glyph mesh in `flipGlyphVertices.ts`), not just a repositioned bbox.
This is squarely "real browser + rendering" territory per the section below — a mocked `gl` context
in a unit test can assert the UV/vertex math is correct, but can't prove the actual WebGL rasterizer
paints a genuinely mirrored image or a genuinely mirrored glyph on screen.

| #   | Scenario                                                                                         | Unit |         E2E         |
| --- | ------------------------------------------------------------------------------------------------ | :--: | :-----------------: |
| 48  | Dragging a corner past the opposite anchor mirrors the box instead of sticking at MIN_SHAPE_SIZE |  ✅  | ✅ `resize.spec.ts` |
| 49  | Resizing a Media node past its anchor mirrors the rendered image, not just its bounding box      |  —   | ✅ `resize.spec.ts` |
| 50  | Resizing a Text node past its anchor renders the text mirrored, not just repositioned            |  —   | ✅ `resize.spec.ts` |

#49/#50 have no unit equivalent at all: `drawImage.spec.ts` and `flipGlyphVertices.spec.ts` assert
the vertex/UV math against a mocked `gl` context, which proves the math but not that the real
rasterizer produces a visually mirrored result. Both e2e tests sidestep computing expected pixels
by construction instead: resize a node across its anchor by exactly its own size, so the resulting
box lands at the _exact same on-screen rect_ an unflipped placement at that rect would use — then
compare against a second page where the same content is placed there directly, never crossing an
anchor. Any pixel difference between the two can only come from the content itself being mirrored,
not from position or size differing (`resize.spec.ts` picks a visibly asymmetric fixture — the
existing `hand.png` cursor asset — since the `create-media.spec.ts` fixtures are near-symmetric and
wouldn't show a flip in a screenshot diff).

## Rotation (Etap 10)

`rotation` has sat unused on `TBaseNode` since Etap 2; nothing ever set it or rendered it. This adds
real rotation for a single selected non-line node **or** a group selection, sharing the same
single-node-is-a-degenerate-group formula as resize (`continueRotateDrag.ts`: a lone node's own
center equals the pivot, so `rotatePoint` naturally leaves its position untouched and only spins its
`rotation`). Every `draw*.ts` function now takes a trailing `rotation` and rotates its already-computed
(unrotated) points as a final CPU-side step, the same pattern established for Media/Text mirroring
(`flipGlyphVertices.ts`) — deliberately not shader-based, since rotation is static-per-node rather than
per-frame. Hit-testing follows the same "rotate the query point, not the test" trick used for flip:
`getNodeAtPoint.ts`, `getResizeHandleAtPoint.ts`, and the new `getRotateHandleAtPoint.ts` all inverse-
rotate the incoming point once, then hand it to unchanged axis-aligned tests. Marquee/group-bbox
collision (`getCollidedNodes.ts`, `getSelectionBounds.ts`) moved from the raw, unrotated
`getNodeBounds.ts` to a new `getRotatedNodeBounds.ts`, so a rotated node's true on-screen extent is
what's actually tested, not its stale axis-aligned box. The rotate handle itself is a ring just
outside each resize corner's own radius (`ROTATE_HANDLE_OUTER_RADIUS_PX`), explicitly excluding any
point still inside the shape's own bounds so an ordinary interior drag/select near a corner isn't
hijacked into a rotate. The cursor reuses the `resize.png` rotation mechanism via a new shared
`createCursorRotator` factory, instantiated a second time for `rotate.png`
(`getRotatedRotateCursorUrl.ts`), with its own angle calculation (`getRotateCursorAngle.ts`) based on
which quadrant of the node's local (unrotated) space the cursor falls in — calibrated so the "ne"
corner of an unrotated node reads as 0deg, each other corner +90deg clockwise from there. That angle
also isn't just set once at arm time: `continueRotateDrag.ts` recomputes it every move
(`cursorAngle + deltaDegrees`, both stashed on `TRotateDragState` at arm time) and re-applies
`canvas.style.cursor` on every step, so the icon keeps spinning in sync with the node itself for the
whole drag, not just its start and end.

| #   | Scenario                                                                                                                                                                                      | Unit |         E2E         |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: | :-----------------: |
| 51  | Hovering the ring just outside a resize handle applies a distinct rotate cursor                                                                                                               |  —   | ✅ `rotate.spec.ts` |
| 52  | Dragging the rotate ring visibly spins the node                                                                                                                                               |  —   | ✅ `rotate.spec.ts` |
| 53  | A rotated node is hit-tested (and its resize handles found) at its actual rotated position                                                                                                    |  ✅  | ✅ `rotate.spec.ts` |
| 54  | Rotating a group selection spins every member around their shared center                                                                                                                      |  ✅  | ✅ `rotate.spec.ts` |
| 55  | An interior click near a corner (within resize+rotate ring distance) is never hijacked into a rotate                                                                                          |  ✅  |          —          |
| 56  | Marquee selection tests a rotated node's true rotated bounds, not its stale axis-aligned box                                                                                                  |  ✅  |          —          |
| 57  | The rotate cursor updates live as the drag angle changes, not just once at the start                                                                                                          |  —   | ✅ `rotate.spec.ts` |
| 58  | A section resists rotation entirely — its own rotate ring never applies a rotate cursor or spins it (`getRotateHandleAtPoint` excludes `NodeType.section`, same as it already excluded lines) |  ✅  | ✅ `rotate.spec.ts` |

#51/#52/#57 are e2e-only for the same reason as resize's #43: a live `Image`/canvas-rotate cursor and
an actual WebGL repaint aren't things a jsdom unit test can observe — #57 specifically needs a real
mid-drag `pointermove` to prove the cursor is re-applied continuously, not frozen at its arm-time
value. #53/#54 get both: the unit suite (`getResizeHandleAtPoint.spec.ts`, `getRotateHandleAtPoint.
spec.ts`, `continueRotateDrag.spec.ts`) already pins the exact rotated-corner and rotated-position
math precisely, but the e2e versions prove the same math holds up through a real pointer-drag
sequence and a real subsequent hover, not just a direct function call with hand-constructed state.
#55/#56 stay unit-only — both are precise boundary assertions (`getRotateHandleAtPoint.spec.ts`'s
interior-point test, `getCollidedNodes.spec.ts`'s rotated-bounds test) that a screenshot diff
couldn't meaningfully improve on.

## Vector node selection (Move tool)

A vector node's plain-click/hover hit-test (`getNodeAtPoint.ts` → `isPointInVectorRegions.ts` +
`isPointNearVectorPath.ts`) used to collide across its **entire derived face area**, filled or not
— so clicking dead center of a bare, unpainted outline selected it, even though nothing was
rendered there. Fixed by scoping the interior hit-test to only the faces actually listed in
`filledFaceKeys` (reusing `getVectorFillLoopKeyAtPoint.ts`, the same lookup the Paint tool itself
uses) — an unfilled region now only collides on its own contour (`isPointNearVectorPath.ts`,
unchanged). This does not apply once a vector is already selected: `armSelectedVectorBoundsOnPointerDown.ts`
(new) still arms a whole-bounding-box drag for a single already-selected vector node, so an
existing selection stays fully draggable from anywhere in its box, contour or not — **but**, unlike
`armSelectedTextBoundsOnPointerDown.ts`'s text-box equivalent, it deliberately reuses
`armGroupBoundsDrag.ts`'s `pendingClickAction: { kind: 'deselect' }` (§3 of
`selection-and-manipulation.md`, the same mechanism a click in a multi-selection's gap uses) rather
than a plain `armHitDrag.ts` call: a real drag still moves the shape, but a **plain click that
doesn't move**, landing past the shape's own contour, deselects it instead of leaving it selected —
requested on the spot, since a static click there visually looks exactly like missing the shape
entirely.

| #   | Scenario                                                                                                                                                                                                     | Unit |          E2E           |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--: | :--------------------: |
| 282 | Clicking inside an unfilled vector node's bounding box, past its own contour, does not select it                                                                                                             |  ✅  | ✅ `selection.spec.ts` |
| 283 | A selected vector node can be dragged from anywhere in its bounding box, even past its own contour                                                                                                           |  ✅  | ✅ `selection.spec.ts` |
| 284 | A plain click (no drag) on an already-selected vector node, landing past its own contour, deselects it — same as missing the shape entirely, unlike the equivalent click on a selected text node's fixed box |  ✅  | ✅ `selection.spec.ts` |

## Layer order — Bring to front / Send to back

`bringSelectionToFront` / `sendSelectionToBack` move the current selection to the front (end) or
back (start) of its own render-order array — the page's `rootOrder` for a top-level node, or a
parent group's `childIds` for a nested one (`getSelectionOrderScopes`), never across that boundary.
Each selected node's relative order among the other selected nodes is preserved, and other nodes
are left where they were (`moveIdsToEdge`). Wired to the `]` / `[` keyboard shortcuts (global —
canvas and Layers tree) and the Layers-panel context-menu items; joined to undo/redo like every
other document mutation.

| #   | Scenario                                                                                                                    | Unit |         E2E          |
| --- | --------------------------------------------------------------------------------------------------------------------------- | :--: | :------------------: |
| 336 | `]` brings the selected node to the front and `[` sends it back, visibly changing which of two overlapping shapes is on top |  ✅  | ✅ `z-order.spec.ts` |
| 337 | A nested node moves only within its own parent group's `childIds`, never in front of / behind nodes outside that group      |  ✅  |          —           |
| 338 | Multiple selected nodes move together to the edge, keeping their own relative order; unselected nodes stay put              |  ✅  |          —           |
| 339 | Bring-to-front and send-to-back are each their own undo step                                                                |  ✅  |          —           |
| 340 | The Layers-panel context-menu "Bring to front" / "Send to back" items fire the same action as the shortcut                  |  ✅  |          —           |

Only #336 gets e2e coverage — it's the one case where the payoff is genuinely a browser
render round-trip (the shortcut reordering the array, the render loop re-flattening it, and the
overlap region repainting with a different fill). The rest are exact `store.getState()` assertions
with no timing/rendering stakes, unit-only per the section below.

## Frame nesting — click-through depth, Ctrl reach, and marquee

A frame's body stays click-through only when its own direct parent isn't a frame — any frame nested
inside another frame, at any depth, is instead a normal, directly clickable node (it's "just another
parent"), while actual non-frame content sitting inside such a nested frame stays reachable only via
Ctrl. Hover and marquee mirror the same rule as click. A nested frame (parent is a frame) also never
renders its own name label — only the outermost frame, or one nested inside a section, keeps it. A
Ctrl-held gesture that grabs a node falls back to drawing a marquee from the original point on its
first move, instead of moving that node. All of this lives in `e2e/design/selection/frame-nested.spec.ts`.

| #   | Scenario                                                                                                              | Unit |            E2E            |
| --- | --------------------------------------------------------------------------------------------------------------------- | :--: | :-----------------------: |
| 341 | A frame nested any number of levels deep is directly selectable by a plain click on its own body, without Control     |  ✅  | ✅ `frame-nested.spec.ts` |
| 342 | A plain click on real (non-frame) content sitting inside a nested frame selects the frame, not the content            |  ✅  | ✅ `frame-nested.spec.ts` |
| 343 | Ctrl+click on that same content reaches it directly, regardless of nesting depth                                      |  ✅  | ✅ `frame-nested.spec.ts` |
| 344 | Hovering a nested frame's own body and hovering its content without Control resolve to the identical highlighted node |  ✅  | ✅ `frame-nested.spec.ts` |
| 345 | Holding Control while hovering that same content highlights the content itself instead                                |  ✅  | ✅ `frame-nested.spec.ts` |
| 346 | A frame nested directly inside another frame never renders its own name label                                         |  ✅  | ✅ `frame-nested.spec.ts` |
| 347 | A frame nested inside a section (not a frame) keeps its label, fully interactive at its unmoved canvas position       |  ✅  | ✅ `frame-nested.spec.ts` |
| 348 | A marquee that never fully encloses either ancestor frame still reaches and selects a frame nested two levels deep    |  ✅  | ✅ `frame-nested.spec.ts` |
| 349 | A Ctrl-held gesture that grabs a nested frame draws a marquee from the original point on its first move, not a drag   |  ✅  | ✅ `frame-nested.spec.ts` |
| 350 | Converting a Ctrl-drag into a marquee never moves the node that was originally grabbed                                |  ✅  | ✅ `frame-nested.spec.ts` |

Every scenario here earns e2e coverage rather than staying unit-only: each one is precisely the kind
of real-browser pointer-timing behavior a synthetic `PointerEvent` in the unit suite can paper over —
sequential drag gestures, Ctrl/mouse-move interplay, and Layers-panel drag-and-drop reparenting all
have to actually work together in a live render loop, not just in isolated function calls.

## Section nesting — always opaque, Ctrl reach, drop restrictions

A Section is a real container (`childIds`), but unlike a Frame it is **never** click-through: a plain
click or hover anywhere on a section's body — including directly over its own content — always
resolves to the section itself, exactly like a Group or an already-nested Frame; only Ctrl (or an
already-entered descendant) reaches the actual content. A Frame nested directly inside a Section
keeps its own click-through status (its parent isn't a frame), so a plain click reaches content
inside that frame directly. A Section can never be nested into any container — frame, group, or
another section. Dragging a shape onto a section on the canvas reparents it, exactly like dropping
onto a frame. All of this lives in `e2e/design/selection/section-nested.spec.ts`.

| #   | Scenario                                                                                                          | Unit |             E2E             |
| --- | ----------------------------------------------------------------------------------------------------------------- | :--: | :-------------------------: |
| 351 | A plain click on a section's own empty body selects the section                                                   |  ✅  | ✅ `section-nested.spec.ts` |
| 352 | A plain click directly on non-frame content inside a section selects the section, not the content (always opaque) |  ✅  | ✅ `section-nested.spec.ts` |
| 353 | Ctrl+click on that same content reaches it directly                                                               |  ✅  | ✅ `section-nested.spec.ts` |
| 354 | Hovering a section's body and hovering its content without Control resolve to the identical highlighted node      |  ✅  | ✅ `section-nested.spec.ts` |
| 355 | Holding Control while hovering that content highlights the content itself instead                                 |  ✅  | ✅ `section-nested.spec.ts` |
| 356 | A plain click on content inside a frame that is itself nested in a section reaches that content directly          |  ✅  | ✅ `section-nested.spec.ts` |
| 357 | A section cannot be dropped into a frame via the Layers panel — nothing changes                                   |  ✅  | ✅ `section-nested.spec.ts` |
| 358 | A section cannot be dropped into another section via the Layers panel — nothing changes                           |  ✅  | ✅ `section-nested.spec.ts` |
| 359 | Dragging a shape onto a section on the canvas reparents it into the section, same as a frame                      |  ✅  | ✅ `section-nested.spec.ts` |

Every scenario here earns e2e coverage for the same reason the frame-nesting block above does: the
section-opacity rule, the Ctrl-reach bypass, the Layers-panel drag rejection, and the canvas
drag-drop reparenting all have real pointer/timing/live-render stakes that a synthetic unit-level
`PointerEvent` cannot faithfully reproduce.
