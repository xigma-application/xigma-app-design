# Design page — test case catalog

Reference list of interaction scenarios for the Design page, kept alongside `DesignPage.ts` so
new e2e specs (or a reviewer checking coverage) can see what's expected without re-deriving it
from the implementation. "Unit" coverage refers to
`src/components/Design/Canvas/hooks/useSelectionTool/useSelectionTool.spec.tsx` (asserts
`store.getState()` directly, can express every branch precisely). "E2E" coverage can only assert
what's observable in the browser — DOM state (`aria-checked`) or canvas pixels (screenshot
diff/equality) — so it targets the highest-value real-integration paths, not every unit-level
branch.

## Frame drawing (Etap 3/4)

| #   | Scenario                                                                                | Unit |            E2E            |
| --- | --------------------------------------------------------------------------------------- | :--: | :-----------------------: |
| 1   | Drawing a frame with the Frame tool renders it and reverts the active tool to `default` |  —   | ✅ `create-frame.spec.ts` |

## Section drawing

Section is a Frame-like container node: a plain box node (`NodeType.section`) rendered through the
same generic `useDrawShapeTool`/`drawDraftShape`/`drawSceneNodes` paths as Frame, defaulting to a
fill equal to the canvas background color (`#444444`) so it's invisible until drawn, same
fill-less-draft behavior as Frame (`drawDraftShape.ts`'s default case treats `NodeType.frame` and
`NodeType.section` identically). Section shares Frame's toolbar button/dropdown panel
(`TOOL_GROUP_ITEMS[frame] = [frame, section]`) instead of getting its own top-level icon — same
"shared button shows whichever tool was last picked" mechanic as the Rectangle group, backed by its
own `lastFrameTool` store field (mirroring `lastShapeTool`/`lastMouseTool`).

| #   | Scenario                                                                                                                      | Unit |             E2E             |
| --- | ----------------------------------------------------------------------------------------------------------------------------- | :--: | :-------------------------: |
| 1   | Picking "Section" from the Frame dropdown draws a section, and the shared button stays showing Section (unchecked) afterwards |  —   | ✅ `create-section.spec.ts` |
| 2   | Pressing "Shift+S" activates the Section tool, then dragging draws a section                                                  |  —   | ✅ `create-section.spec.ts` |
| 3   | While dragging (before release), a section draft stays fill-less, same as Frame's draft                                       |  ✅  | ✅ `drawDraftShape.spec.ts` |

## Rectangle drawing (Etap 6)

| #   | Scenario                                                                                                     | Unit |              E2E              |
| --- | ------------------------------------------------------------------------------------------------------------ | :--: | :---------------------------: |
| 1   | Drawing a rectangle with the Rectangle tool renders it and reverts the active tool to `default`              |  —   | ✅ `create-rectangle.spec.ts` |
| 2   | Pressing "R" activates the Rectangle tool, then dragging draws a rectangle                                   |  —   | ✅ `create-rectangle.spec.ts` |
| 3   | While dragging (before release), the rectangle's own fill is already visible, unlike Frame's fill-less draft |  ✅  | ✅ `create-rectangle.spec.ts` |

## Ellipse drawing (Etap 6)

Ellipse shares its toolbar button with Rectangle (`TOOL_GROUP_ITEMS`, `MouseModes.tsx`) — the
button shows whichever of the two was picked last (`lastShapeTool` in `store/design`), and reverts
to unchecked (but keeps showing that icon) once a shape finishes drawing, same as Frame/Rectangle.

| #   | Scenario                                                                                                                           | Unit |             E2E             |
| --- | ---------------------------------------------------------------------------------------------------------------------------------- | :--: | :-------------------------: |
| 1   | Picking "Ellipse" from the Rectangle dropdown draws an ellipse, and the shared button stays showing Ellipse (unchecked) afterwards |  —   | ✅ `create-ellipse.spec.ts` |
| 2   | Pressing "O" activates the Ellipse tool, then dragging draws an ellipse                                                            |  —   | ✅ `create-ellipse.spec.ts` |
| 3   | While dragging (before release), the ellipse's own fill is already visible, unlike Frame's fill-less draft                         |  ✅  | ✅ `create-ellipse.spec.ts` |

## Polygon drawing

Polygon shares its toolbar button with Rectangle/Ellipse/Line (`TOOL_GROUP_ITEMS[rectangle] =
[rectangle, line, ellipse, polygon]`), same sharing pattern as Ellipse/Line, but unlike every other
shape tool it has **no keyboard shortcut** (`KEYBOARD_SHORTCUTS[polygon] = []`) — it's reachable
only from the dropdown. Its geometry is an N-gon inscribed in the bounding box (`getPolygonPoints`,
apex pointing up), with `sides` defaulting to 3 (triangle) until a properties panel exists to change
it (planned: min 3, max 60). Hit-testing/hover/rendering follow the same non-bbox pattern as Ellipse
(`isPointInPolygon`, `drawThickPolygonOutline`, `drawPolygon`).

| #   | Scenario                                                                                                                          | Unit |             E2E             |
| --- | --------------------------------------------------------------------------------------------------------------------------------- | :--: | :-------------------------: |
| 29  | Picking "Polygon" from the Rectangle dropdown draws a polygon, and the shared button stays showing Polygon (unchecked) afterwards |  —   | ✅ `create-polygon.spec.ts` |
| 30  | Polygon has no keyboard shortcut — pressing an unbound key leaves the default tool active and no polygon button rendered          |  —   | ✅ `create-polygon.spec.ts` |
| 31  | While dragging (before release), the polygon's own fill is already visible, unlike Frame's fill-less draft                        |  ✅  | ✅ `create-polygon.spec.ts` |
| 32  | Hit-testing/hovering a polygon follows its actual N-gon shape, not its bounding box                                               |  ✅  | ✅ `create-polygon.spec.ts` |

## Line drawing

A line is not box-shaped like Frame/Rectangle/Ellipse — it's defined by two endpoints
(`TLineNode.x1,y1,x2,y2`), created via a dedicated `useDrawLineTool` hook (not the shared
`useDrawShapeTool`, since `toDraftRect` would normalize the two drawn points into a min-corner box
and lose the drawn direction). It shares its toolbar button with Rectangle/Ellipse
(`TOOL_GROUP_ITEMS[rectangle] = [rectangle, line, ellipse]`), same sharing pattern as Ellipse.

| #   | Scenario                                                                                         | Unit |           E2E            |
| --- | ------------------------------------------------------------------------------------------------ | :--: | :----------------------: |
| 22  | Picking "Line" from the Rectangle dropdown draws a line and reverts the active tool to `default` |  —   | ✅ `create-line.spec.ts` |
| 23  | Pressing "L" activates the Line tool, then dragging draws a line                                 |  —   | ✅ `create-line.spec.ts` |

Line has no fill, so there's no fill-vs-frame-draft comparison analogous to Rectangle/Ellipse's
scenario #3 — a line's live draft is just the segment itself plus its two endpoint handles
(`drawFrame.ts`'s `NodeType.line` branch), nothing to distinguish from a "fill-less" state.

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

## Hand tool (pan-only tool)

Mirrors Figma's Hand tool: shares its toolbar slot with the default (Move) tool
(`TOOL_GROUP_ITEMS[default] = [default, hand]`, `lastMouseTool` remembers which of the two was
picked last, same mechanism as `lastShapeTool` for the Rectangle group), and has its own keyboard
shortcut ("H", `useToolbarShortcuts.ts`). While active, holding the primary (left) mouse button and
dragging pans the viewport exactly like the existing middle-mouse-button drag-pan
(`useCanvasDragPan`) — reusing the same `applyDragPan` math — but every other tool's own
`activeTool === <its own ToolName>` guard means no other tool's pointer listeners are attached while
hand is active, so nothing on the canvas can be selected or moved. Cursor is `hand.png` while idle
and swaps to the existing `pressing.png` class while actively dragging (`useHandTool.ts`).

| #   | Scenario                                                                                                                                                                                              | Unit |          E2E           |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: | :--------------------: |
| 33  | Pressing "H" activates the Hand tool, then dragging with the primary button pans the viewport (a frame remains selectable at its new on-screen position afterwards, same proof shape as scenario #14) |  ✅  | ✅ `hand-tool.spec.ts` |
| 34  | Dragging directly over an existing frame with the Hand tool pans the canvas without selecting or moving that frame                                                                                    |  ✅  | ✅ `hand-tool.spec.ts` |

Both are real browser + pointer-event-ordering claims (`event.button` read inside a live
`PointerEvent`, `setPointerCapture` during the drag), the same category of "worth proving against a
real browser" as scenarios #14/#15 and the marquee Control test above — `useHandTool.spec.tsx`
already asserts the `setViewport` dispatch and cursor-class toggling precisely in jsdom, but only a
real browser proves a `pointerdown` on top of an actual rendered frame doesn't leak into the
selection tool.

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

## Text tool (Etap 6 + the create/edit slice of Etap 7)

Unlike every other draw tool, Text never commits to Redux on `pointerup` — dragging out a box
dispatches `startTextEdit` instead of `addNode` (`useDrawTextTool.ts`), which mounts a
`contentEditable` overlay (`TextEditOverlay.tsx`) positioned over the dragged box. The node is only
actually created on blur, and only if the typed content is non-empty (`useCommitTextEdit.ts`) — an
empty text box is discarded entirely, never added and never needing deletion.

| #   | Scenario                                                                                                  | Unit |           E2E            |
| --- | --------------------------------------------------------------------------------------------------------- | :--: | :----------------------: |
| 35  | Drawing a text box, typing content, then clicking away commits a rendered text node                       |  —   | ✅ `create-text.spec.ts` |
| 36  | Drawing a text box and clicking away with no content typed discards it — nothing is created               |  —   | ✅ `create-text.spec.ts` |
| 37  | A single whitespace character (e.g. a space) counts as valid content and is kept, not discarded           |  ✅  |            —             |
| 38  | Typing a tool-shortcut letter (e.g. "r", "t") while editing text does not switch the active tool          |  ✅  | ✅ `create-text.spec.ts` |
| 39  | Hovering a committed text node only highlights its rendered content, not the empty space in its fixed box |  —   |    ✅ `hover.spec.ts`    |
| 40  | Clicking a text node inside its fixed box but past its rendered content does not select it                |  ✅  |  ✅ `selection.spec.ts`  |
| 41  | A selected text node can be dragged from anywhere in its fixed box, even past its rendered content        |  ✅  |  ✅ `selection.spec.ts`  |
| 42  | A run of text with no spaces wraps mid-word once it overflows the box, instead of overflowing on one line |  ✅  | ✅ `create-text.spec.ts` |

#37 stays unit-only: `useCommitTextEdit.spec.tsx` asserts `store.getState()` directly (the node was
added, `content: ' '`), which is exact. A screenshot diff can't reliably stand in for this claim —
`fillText(' ', ...)` renders no visible glyph, so the "kept" and "discarded" outcomes can look
pixel-identical on canvas, making this exactly the kind of branch the e2e layer is the wrong tool
for (see "Why so few scenarios get e2e coverage" below).

#38-#41 all came from real user reports during manual testing, not from the original spec — the
text box became a fixed size independent of its rendered content (`useCommitTextEdit.ts` uses
`box.height`, not the DOM's measured height), and both hit-testing (`isPointInText.ts`, replacing
`isPointInRect` for text) and the hover underline (`drawTextHoverUnderline.ts`) had to follow that
same "content, not box" distinction, while dragging an _already-selected_ text node still needs the
full box to stay grabbable (`isPointInSelectedTextBounds.ts`). Each of these has a precise
`store.getState()`/mocked-`gl` unit assertion already, but the actual claim — a real `pointerdown`
at real screen coordinates against the real rendered MSDF glyphs does/doesn't hit — is exactly the
"real browser + rendering + timing" category this file exists for, so each also gets an e2e
scenario. #38 is the exception with real jsdom coverage too
(`TextEditOverlay.spec.tsx`'s stopPropagation test): `fireEvent` bubbling is standards-accurate in
jsdom, so the _mechanism_ is unit-provable, but the e2e version proves the actual toolbar's
`aria-checked` state end-to-end through the real `useToolbarShortcuts` wiring, which is worth
keeping too since a regression could sneak in between the two layers (e.g. a capture-phase listener
added elsewhere).

#42 is the same category again: the html overlay wraps via real CSS (`overflow-wrap: break-word`
in `TextEditOverlay.module.scss`), which breaks a run with no spaces mid-word once it doesn't fit —
`wrapText.ts` used to only ever break at a space, so a single long unbroken run stayed on one
(overflowing) canvas line while the html overlay wrapped it, a real divergence caught by manual
testing, not the unit suite (which already covers the new char-level breaking precisely in
`wrapText.spec.ts`). The e2e version proves the same narrow box actually produces a visibly
different (wrapped) render than a wide one for the identical input — the width comparison that
matters is against the live rendered MSDF glyphs, not a mocked `measureWidth`.

## Double-click to edit an existing text node (Etap 10)

Editing was previously only reachable while a text box was being freshly drawn — there was no path
from an already-placed `TTextNode` back into `contentEditable` edit mode at all (`editingTextBox`
carried no node identity, so `useCommitTextEdit.ts` always called `addNode`, never `updateNode`).
Figma's own behavior: double-clicking a text node — selected or not — enters edit mode with its
entire existing content selected, so typing immediately replaces it. `editingTextBox`/
`editingTextContent` gained a sibling `editingNodeId` (`store/design/types.ts`), set by a new
`useTextEditOnDoubleClick.ts` hook (a plain `dblclick` listener, gated on the default tool) that
hit-tests via the same "precise glyph hit, or full box if already the sole selection" layering
`handlePointerDown.ts` already uses (`getDoubleClickedTextNode.ts`, reusing `getNodeAtPoint.ts` and
`isPointInSelectedTextBounds.ts` unchanged). `TextEditOverlay.tsx` seeds the `contentEditable` div's
initial DOM content from the node's existing `content` (`setEditableTextContent.ts`, the inverse of
the existing `getEditableTextContent.ts`) and selects all of it via `window.getSelection()`/`Range`
(`selectEditableTextContent.ts`) — both only run once per edit session, gated on `box`/
`editingNodeId` identity via a ref snapshot, not on every keystroke's `editingTextContent` update
(`useSeedEditableTextOnEntry.ts`). `useCommitTextEdit.ts` now branches on `editingNodeId`:
`updateNode({ changes: { content } })` for an existing node instead of `addNode`, and — since there's
no delete-node action in this codebase yet — clearing all content and blurring simply discards the
edit (leaves the node's original content untouched) rather than creating an empty/orphaned node.
While a node is being edited, `drawScene.ts` filters it out of the normal fill/selection/hover
render passes by id, so the live `contentEditable` overlay and its own `drawEditingText.ts` outline
are the only representation on screen — otherwise the stale static glyphs would render underneath
the live-typed ones.

| #   | Scenario                                                                                                                                       | Unit |          E2E           |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------- | :--: | :--------------------: |
| 58  | Double-clicking an unselected text node enters edit mode with all its content selected, so typing replaces it instead of appending             |  ✅  | ✅ `edit-text.spec.ts` |
| 59  | Double-clicking a selected text node past its rendered content (but inside its fixed box) still enters edit mode                               |  ✅  | ✅ `edit-text.spec.ts` |
| 60  | Blurring an existing-node edit updates that node's content in place, never adds a duplicate node                                               |  ✅  |           —            |
| 61  | Clearing all content on an existing node and blurring discards the edit, leaving the original content untouched (no delete-node action exists) |  ✅  |           —            |
| 62  | The node currently being edited is excluded from normal fill, selection-outline, and hover-outline rendering                                   |  ✅  |           —            |
| 63  | A rotated, mirrored node being edited keeps rendering its glyphs (`drawEditingText.ts`) at its own rotation/flip                               |  ✅  | ✅ `edit-text.spec.ts` |
| 64  | The canvas-drawn selection highlight/caret (`drawEditingCaretAndSelection.ts`) reacts to the live selection, even on a rotated node            |  ✅  | ✅ `edit-text.spec.ts` |

#58/#59 are the two distinct hit-test branches (`getDoubleClickedTextNode.ts` already pins both
precisely via `store.getState()`), but the actual claim worth an e2e proof is a real native
`dblclick`, a real `window.getSelection()`/`Range` call against a real `contentEditable` div, and a
real subsequent `page.keyboard.type` — proving the browser's own selection/typing behavior
(replace-selected-text) actually fires, not just that the app _asked_ it to. Both assert by
comparing against a from-scratch reference render of the final text at the same position/box:
pixel equality can only hold if the edit both replaced (not appended) and updated in place (not
duplicated), so this single screenshot comparison covers #58-#60 together without a separate
mechanism for #60. #60-#62 stay unit-only — each is a precise `store.getState()`/mocked-`gl` call-count
assertion (`useCommitTextEdit.spec.tsx`, `drawScene.spec.ts`) that a screenshot diff wouldn't
meaningfully improve on, per the "why so few scenarios get e2e coverage" rationale below.

#63/#64 are exactly the bug a `jsdom` unit test can paper over: `TextEditOverlay.spec.tsx` can only
assert the DOM overlay's own inline style (e.g. that no `transform` is set), never that the
_visible_ glyphs/highlight the browser actually paints on the WebGL canvas stay aligned with a
rotated node — the DOM overlay is deliberately invisible (`color`/`caretColor`/`::selection` all
transparent) precisely because its own native text layout doesn't kern-match the MSDF glyph layout,
so the real proof has to look at rendered canvas pixels. #63's e2e version rotates a real node via a
real rotate-ring drag (the same interaction as `rotate.spec.ts`), enters edit mode, and asserts the
resulting canvas screenshot differs from editing an otherwise-identical unrotated node — pre-fix,
`drawEditingText.ts` hardcoded `rotation: 0`, so the two would have rendered indistinguishably. #64
goes a step further on the same rotated node: it asserts the canvas-drawn selection highlight
(`getSelectionRects.ts`) actually disappears once `ArrowRight` collapses the selection to a caret —
proving the highlight is driven by live selection state, not just a static rotated decoration, and
that this now works correctly even when rotated (pre-fix, the equivalent native DOM highlight would
render axis-aligned and visibly detached from the rotated glyphs, per the original bug report).

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

| #   | Scenario                                                                                             | Unit |         E2E         |
| --- | ---------------------------------------------------------------------------------------------------- | :--: | :-----------------: |
| 51  | Hovering the ring just outside a resize handle applies a distinct rotate cursor                      |  —   | ✅ `rotate.spec.ts` |
| 52  | Dragging the rotate ring visibly spins the node                                                      |  —   | ✅ `rotate.spec.ts` |
| 53  | A rotated node is hit-tested (and its resize handles found) at its actual rotated position           |  ✅  | ✅ `rotate.spec.ts` |
| 54  | Rotating a group selection spins every member around their shared center                             |  ✅  | ✅ `rotate.spec.ts` |
| 55  | An interior click near a corner (within resize+rotate ring distance) is never hijacked into a rotate |  ✅  |          —          |
| 56  | Marquee selection tests a rotated node's true rotated bounds, not its stale axis-aligned box         |  ✅  |          —          |
| 57  | The rotate cursor updates live as the drag angle changes, not just once at the start                 |  —   | ✅ `rotate.spec.ts` |

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

## Text on Path (ellipse-only v1)

A self-contained sibling feature to the plain Text tool — not "Text drawn on top of an Ellipse
node that just looks connected." The Text on Path tool (`useDrawTextOnPathTool.ts`) draws its own
`NodeType.path` node (an ellipse-shaped curve for v1, `PathType.ellipse` — a new node type kept
deliberately separate from `NodeType.ellipse`/the Ellipse tool, never created or touched by it) the
same way `useDrawShapeTool` drags out a box, then immediately dispatches `startTextEdit` on it,
same "drop into edit mode right after drawing" convention as the plain Text tool. On commit, the
`TTextNode` gets `pathId = PathNode.id` — a real, separate node, genuinely bound, not merely
positioned to look connected. `handleUpdateNode.ts` runs a bidirectional sync cascade
(`syncPathTextNodes.ts`/`syncPathNodeFromText.ts`): resizing/rotating/moving either the path or its
bound text propagates to the other on every update (live during a drag, not just on release), so
the text always follows the path's actual current shape. The path node itself renders as a
stroke-only ellipse outline with no fill (`drawSceneNodes.ts`/`drawDraftShape.ts`'s `NodeType.path`
branches, reusing the generic `drawEllipse` primitive — not Ellipse-tool code). Glyph curving,
auto-shrink-to-fit, and the draggable start-offset handle were built in an earlier pass and are
unaffected by this node-model rework, since they always read the text node's own denormalized
box, never a separate node lookup.

| #   | Scenario                                                                                                                                                                                                                                               | Unit |            E2E            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--: | :-----------------------: |
| 74  | Drawing a path with the Text on Path tool, typing content, then clicking away commits a rendered curved text node bound to a real, separate path node                                                                                                  |  —   | ✅ `text-on-path.spec.ts` |
| 75  | Typing a tool-shortcut letter while editing text on a path does not switch the active tool (the focus-timing bug this feature originally shipped with — `useSeedEditableTextOnEntry.ts` grabs focus via `useLayoutEffect`, not a deferred `useEffect`) |  —   | ✅ `text-on-path.spec.ts` |
| 76  | Resizing the source path node updates the attached text's curve live, proving the two are a real bidirectional relation, not independently-positioned nodes                                                                                            |  ✅  | ✅ `text-on-path.spec.ts` |
| 77  | Auto-shrinking the font so text never overlaps itself when longer than the path's circumference                                                                                                                                                        |  ✅  |             —             |
| 78  | Dragging the blue start-offset handle moves where the text begins along the path                                                                                                                                                                       |  ✅  |             —             |
| 84  | Clicking a point along curved text (re-entered via double-click) places the caret at the nearest character index on the curve, so a typed character inserts there instead of always landing at the end                                                 |  ✅  | ✅ `text-on-path.spec.ts` |
| 85  | Dragging along the curve from one character to another selects that range; typing replaces the selection instead of inserting alongside it                                                                                                             |  ✅  | ✅ `text-on-path.spec.ts` |

#77/#78 stay unit-only: `getFittedPathFontSize.spec.ts` and `continuePathOffsetDrag.spec.ts` already
assert the exact resulting font size / offset value via direct function calls and
`store.getState()`, which a screenshot diff can't improve on precisely — see "why so few scenarios
get e2e coverage" below. #76 gets e2e coverage despite having exact unit coverage too
(`handleUpdateNode.spec.ts`'s cascade tests) because the interesting failure mode is specifically a
real `pointerdown`→`pointermove`→`pointerup` resize-handle drag on a _live-rendered_ curved-text
node actually repainting in sync — the same "real browser + rendering + timing" category as the
Resize section's #66 above, not just the reducer math in isolation.

#84/#85 are `useCurvedCaretEditing.ts`: a real `document`-level `pointerdown`/`pointermove`/
`pointerup` listener that hit-tests the click against the curve's own per-character arc-length
boundaries (`getCurvedCaretIndexAtPoint.ts`, reusing the same boundary/offset math `#77`'s
auto-shrink and `isPointInCurvedText.ts` already use), then moves the real DOM selection inside the
`contentEditable` overlay via `setEditableSelectionRange.ts` — a plain range/offset calculation in
jsdom for the unit suite (`useCurvedCaretEditing.spec.tsx`, `getCurvedCaretIndexAtPoint.spec.ts`,
`setEditableSelectionRange.spec.ts` all assert the exact index/distance/selection precisely), but
the actual claim worth proving in a real browser is that clicking/dragging at real screen
coordinates against the real rendered MSDF glyphs on an ellipse produces the correct caret
position/selection, and that a subsequent real `page.keyboard.type` inserts/replaces at that exact
spot — not just that the app _asked_ the DOM to do so. Both tests sidestep needing an accessibility
tree or `store.getState()` (unavailable/unreachable from e2e, same constraint as every other
screenshot-based scenario here): #84 compares two independently-drawn pages where the only
difference is which point on the curve was clicked before typing the same character, and #85
compares the pre-edit "Hi" render against the post-drag-select-and-retype render, so any pixel
difference can only come from the caret/selection actually landing where the interaction implies.

## Text on Path outline visibility (hidden / hover / selected)

The path's own curve used to render unconditionally, every frame, in a plain white stroke — a
permanent visual artifact of an otherwise-invisible implementation-detail node. It now stays
hidden until there's a reason to show it (`getPathOutlineStyles.ts` + `drawPathOutline.ts`,
consumed from `drawSceneNodes.ts`'s `NodeType.path` branch), with a real click/hover surface that
belongs to the bound text, not the box: `getNodeAtPoint.ts` gained a `NodeType.path → false` branch
(the bare path node is now never itself hit-testable — every interaction routes through the paired
text node) and a new `isPointInCurvedText.ts` replaces the old bounding-box fallback for
path-linked text, testing perpendicular distance to the actual curve _and_ arc-length position
against the rendered content's real span, not just "inside the box." Style priority is
hover-first: hovering the rendered text always shows the thicker `DRAFT_FRAME_STROKE` hover
outline, even while already selected (the "you can grab it right here" affordance); selected-but-
not-hovered falls back to a thin outline at the same stroke width/mechanism as the ordinary
box-with-corner-handles outline (both are plain `gl.LINE_LOOP` draws, no thickness parameter).
While drawing a fresh path or actively typing its text (first creation _or_ re-edit), the box's
usual rectangular selection outline and corner handles are suppressed entirely for the path node
(`drawDraftShape.ts`'s `NodeType.path` case skips the shared corner-handles tail;
`drawPerNodeSelectionOutlines.ts` and `drawEditingTextBoxOutline.ts` both special-case it out) —
only the bare ellipse curve shows, using `editingTextBox.pathId` to resolve the outline style even
before the real text node exists in the store yet (first-time creation has no text node until
commit — only the editing box).

| #   | Scenario                                                                                                                                                                 | Unit |            E2E            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--: | :-----------------------: |
| 79  | The path outline is fully hidden when its text is neither hovered, selected, nor being edited — resting inside the bounding box but off the curve shows nothing          |  ✅  | ✅ `text-on-path.spec.ts` |
| 80  | Hovering exactly on the rendered curved text (not the bare curve, not the bounding box) shows the thick hover outline; the bare path node is never itself hit-testable   |  ✅  | ✅ `text-on-path.spec.ts` |
| 81  | Selecting the text via a real click on its rendered glyphs shows the outline in its thin "selected" style                                                                |  ✅  | ✅ `text-on-path.spec.ts` |
| 82  | Hovering the text while it's already selected switches the outline to the thicker hover style, instead of staying on the thin selected style                             |  ✅  | ✅ `text-on-path.spec.ts` |
| 83  | Neither the drag-to-create draft nor the live-typing phase (first creation or re-edit) shows a rectangular box/corner-handles outline for the path — only the bare curve |  ✅  |             —             |

#79-#82 all live in one e2e test, since they're really one continuous state-machine walk (hidden →
hover → back to hidden → selected → selected+hover) and splitting it into separate tests would just
mean re-drawing the same path four times — the same efficiency reasoning `hover.spec.ts`'s single
frame-hover test already uses for its own hide/show/hide sequence. Each transition is exactly the
"real browser + rendering + timing" category this file is for: a real `pointermove` against
real-rendered curved MSDF glyphs deciding which of three draw calls (`drawEllipse` thin,
`drawThickEllipseOutline` thick, or nothing) actually paints, which `getPathOutlineStyles.spec.ts`
can pin down as pure branch logic but can't prove a real browser repaints in response to. #83 stays
unit-only: `drawDraftShape.spec.ts`, `drawPerNodeSelectionOutlines.spec.ts`, and
`drawEditingTextBoxOutline.spec.ts` already count the exact WebGL draw calls (or their absence) for
every phase precisely — the claim is "this specific draw call never happens," which a screenshot
diff can't express any more precisely than the call-count assertion already does.

## Why so few scenarios get e2e coverage

Most of the branches above are two-line Redux-state assertions in the unit suite — an e2e
equivalent would need a screenshot diff standing in for `expect(selectedIds).toEqual(...)`, which
is slower and less precise (a screenshot proves _something_ changed, not _what_). E2E here is
reserved for the paths where the interesting part is the real browser + canvas + timing
interaction itself (paint timing, `pointerdown`/`pointerup` ordering) rather than the selection
algorithm's branch logic, which the unit suite already pins down exhaustively.
