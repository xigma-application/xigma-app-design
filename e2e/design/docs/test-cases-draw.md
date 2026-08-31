# Draw (shape/tool creation) — test case catalog

Test cases for the shape/frame/media/text draw tools that live in `e2e/design/draw/`.

## Frame drawing (Etap 3/4)

| #   | Scenario                                                                                                     | Unit |            E2E            |
| --- | ------------------------------------------------------------------------------------------------------------ | :--: | :-----------------------: |
| 1   | Drawing a frame with the Frame tool renders it and reverts the active tool to `default`                      |  —   | ✅ `create-frame.spec.ts` |
| 2   | Releasing without dragging (a plain click) still places a default 100×100 frame, centered on the click point |  —   | ✅ `create-frame.spec.ts` |

## Section drawing

Section is a Frame-like container node: a plain box node (`NodeType.section`) rendered through the
same generic `useDrawShapeTool`/`drawDraftShape`/`drawSceneNodes` paths as Frame, defaulting to
`SECTION_FILL` — the same dark fill its floating name badge uses (`SECTION_NAME_LABEL_FILL`), so the
section body and its own label read as one consistent color, distinct from the plain canvas
background behind them. Its draft (while still being dragged) stays fill-less regardless, same as
Frame's draft (`drawDraftShape.ts`'s default case treats `NodeType.frame` and `NodeType.section`
identically — the committed fill only applies once the shape lands in the store). Section shares
Frame's toolbar button/dropdown panel
(`TOOL_GROUP_ITEMS[frame] = [frame, section]`) instead of getting its own top-level icon — same
"shared button shows whichever tool was last picked" mechanic as the Rectangle group, backed by its
own `lastFrameTool` store field (mirroring `lastShapeTool`/`lastMouseTool`).

| #   | Scenario                                                                                                                      | Unit |             E2E             |
| --- | ----------------------------------------------------------------------------------------------------------------------------- | :--: | :-------------------------: |
| 1   | Picking "Section" from the Frame dropdown draws a section, and the shared button stays showing Section (unchecked) afterwards |  —   | ✅ `create-section.spec.ts` |
| 2   | Pressing "Shift+S" activates the Section tool, then dragging draws a section                                                  |  —   | ✅ `create-section.spec.ts` |
| 3   | While dragging (before release), a section draft stays fill-less, same as Frame's draft                                       |  ✅  | ✅ `drawDraftShape.spec.ts` |
| 4   | Releasing without dragging (a plain click) still places a default 100×100 section, centered on the click point                |  —   | ✅ `create-section.spec.ts` |

## Slice drawing

Slice marks an area intended for future export, but there's no side panel/export pipeline yet, so
it's intentionally never persisted: it lives entirely in a `useSliceTool`-owned ref (`TSliceDraft`),
never dispatched into the `design` store the way Frame/Section/Rectangle are. It shares Frame's
dropdown, right after Section (`TOOL_GROUP_ITEMS[frame] = [frame, section, slice]`), with its own
plain `"S"` shortcut (distinct from Section's `"Shift+S"`). Unlike every other draw tool, finishing
the initial drag does **not** revert the active tool to `default` — the box stays live and the Slice
tool stays selected so it can be resized/rotated/moved, all handled by a self-contained gesture state
machine under `useSliceTool/utils/` (arm/continue/disarm trios mirroring `useSelectionTool`'s style,
but scoped to a single box with no store dispatch). Clicking anywhere outside the box's bounds
discards it and reverts to `default`, matching Frame/Section's usual "one shape then back to Move"
feel despite the different underlying mechanism.

| #   | Scenario                                                                                                                                                                              | Unit |            E2E            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: | :-----------------------: |
| 1   | Picking "Slice" from the Frame dropdown draws a slice box, and the tool stays selected afterwards                                                                                     |  —   | ✅ `create-slice.spec.ts` |
| 2   | Pressing the plain "S" shortcut (not "Shift+S") activates the Slice tool, then dragging draws a slice                                                                                 |  —   | ✅ `create-slice.spec.ts` |
| 3   | Dragging a corner handle after the initial draw resizes the box in place                                                                                                              |  —   | ✅ `create-slice.spec.ts` |
| 4   | Clicking outside the drawn box discards it and reverts the active tool to `default`, with the canvas returning to its exact pre-draw pixels (nothing was ever persisted to the store) |  —   | ✅ `create-slice.spec.ts` |
| 5   | Rotating and moving the box, resize math for a rotated box, and per-handle hover cursors                                                                                              |  ✅  |             —             |
| 6   | Releasing without dragging (a plain click) still places a default 100×100 slice centered on the click point, staying on the Slice tool                                                |  —   | ✅ `create-slice.spec.ts` |

## Rectangle drawing (Etap 6)

| #   | Scenario                                                                                                         | Unit |              E2E              |
| --- | ---------------------------------------------------------------------------------------------------------------- | :--: | :---------------------------: |
| 1   | Drawing a rectangle with the Rectangle tool renders it and reverts the active tool to `default`                  |  —   | ✅ `create-rectangle.spec.ts` |
| 2   | Pressing "R" activates the Rectangle tool, then dragging draws a rectangle                                       |  —   | ✅ `create-rectangle.spec.ts` |
| 3   | While dragging (before release), the rectangle's own fill is already visible, unlike Frame's fill-less draft     |  ✅  | ✅ `create-rectangle.spec.ts` |
| 4   | Releasing without dragging (a plain click) still places a default 100×100 rectangle, centered on the click point |  —   | ✅ `create-rectangle.spec.ts` |

## Ellipse drawing (Etap 6)

Ellipse shares its toolbar button with Rectangle (`TOOL_GROUP_ITEMS`, `MouseModes.tsx`) — the
button shows whichever of the two was picked last (`lastShapeTool` in `store/design`), and reverts
to unchecked (but keeps showing that icon) once a shape finishes drawing, same as Frame/Rectangle.

| #   | Scenario                                                                                                                           | Unit |             E2E             |
| --- | ---------------------------------------------------------------------------------------------------------------------------------- | :--: | :-------------------------: |
| 1   | Picking "Ellipse" from the Rectangle dropdown draws an ellipse, and the shared button stays showing Ellipse (unchecked) afterwards |  —   | ✅ `create-ellipse.spec.ts` |
| 2   | Pressing "O" activates the Ellipse tool, then dragging draws an ellipse                                                            |  —   | ✅ `create-ellipse.spec.ts` |
| 3   | While dragging (before release), the ellipse's own fill is already visible, unlike Frame's fill-less draft                         |  ✅  | ✅ `create-ellipse.spec.ts` |
| 4   | Releasing without dragging (a plain click) still places a default 100×100 ellipse, centered on the click point                     |  —   | ✅ `create-ellipse.spec.ts` |

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
| 33  | Releasing without dragging (a plain click) still places a default 100×100 polygon, centered on the click point                    |  —   | ✅ `create-polygon.spec.ts` |

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

## Arrow drawing

Arrow is not a separate node type — it's the same `TLineNode` as Line, just drawn via a second
`useDrawLineTool` registration (`ARROW_TOOL_SETTINGS`) whose config defaults `endPoint: 'arrow'`
(`startPoint` stays `'default'`). It shares Line's toolbar slot inside the Rectangle dropdown
(`TOOL_GROUP_ITEMS[rectangle] = [rectangle, line, arrow, ellipse, polygon, star, media]`, right after
Line), and its own "Shift+L" shortcut, distinct from Line's plain "L" (same
modifier-vs-plain-key distinction as Section/Slice's "Shift+S"/"S"). `TLineNode.startPoint`/
`endPoint` are optional `'default' | 'arrow'` fields — every other existing line-drawing/rendering
code path treats a missing value the same as `'default'` (no arrowhead), so old/plain lines are
unaffected. Rendering an arrowhead is pure presentation (`drawLineEndpointArrowheads.ts`, called from
both the committed-node path and the live-draft path) — hit-testing/bounds (`isPointNearLine.ts`,
`getNodeBounds.ts`) deliberately stay keyed to the raw segment only, with no allowance for the
arrowhead's visual overflow.

| #   | Scenario                                                                                            | Unit |            E2E            |
| --- | --------------------------------------------------------------------------------------------------- | :--: | :-----------------------: |
| 111 | Picking "Arrow" from the Rectangle dropdown draws a line with an arrowhead and reverts to `default` |  —   | ✅ `create-arrow.spec.ts` |
| 112 | The drawn arrow renders visibly differently from an identical plain line (the arrowhead itself)     |  —   | ✅ `create-arrow.spec.ts` |
| 113 | Pressing "Shift+L" activates the Arrow tool, then dragging draws an arrow                           |  —   | ✅ `create-arrow.spec.ts` |
| 114 | Pressing a plain "L" (no Shift) still activates Line, not Arrow                                     |  —   | ✅ `create-arrow.spec.ts` |

## Select newly created shape nodes on creation

Frame/Section/Rectangle/Ellipse/Polygon/Star/Line previously committed to the store on `pointerup`
with nothing selected — the user had to click the shape a second time to select it, unlike Text on
Path's own draft-path node (selected mid-draw purely so its dashed "editing" outline can resolve,
see #90 above; its own _final_ committed state still ends up unselected, matching Media/Text's
existing "never auto-selected after creation" convention). Requested explicitly as a UX change: a
freshly drawn shape should read as selected immediately, for both the drag-to-size and the
click-to-place-default-size paths (`toDraftRectWithDefault` already unifies both into the same
`handlePointerUp` code path per tool, so one fix covers both). Four of the seven tools
(Frame/Section/Rectangle/Ellipse) share one hook (`useDrawShapeTool.ts`); Polygon/Star/Line each
have their own near-identical hook. All four now call a shared `selectLastCreatedNode.ts` util
(`Canvas/utils/`) right after `dispatch(addNode(...))`, reading the just-pushed id off
`appStore.getState().design.rootOrder`'s last entry (the `addNode` reducer's `prepare` callback
generates the id via `nanoid()`, so the caller can't know it ahead of time — same pattern
`useDrawTextOnPathTool.ts` already established for its own mid-draw path selection).

| #   | Scenario                                                                                                         | Unit |              E2E              |
| --- | ---------------------------------------------------------------------------------------------------------------- | :--: | :---------------------------: |
| 97  | A freshly drawn Frame is selected immediately on release, with no extra click needed                             |  ✅  |   ✅ `create-frame.spec.ts`   |
| 98  | A freshly drawn Section is selected immediately on release, with no extra click needed                           |  ✅  |  ✅ `create-section.spec.ts`  |
| 99  | A freshly drawn Rectangle is selected immediately on release                                                     |  ✅  | ✅ `create-rectangle.spec.ts` |
| 100 | A freshly drawn Ellipse is selected immediately on release                                                       |  ✅  |  ✅ `create-ellipse.spec.ts`  |
| 101 | A freshly drawn Polygon is selected immediately on release                                                       |  ✅  |  ✅ `create-polygon.spec.ts`  |
| 102 | A freshly drawn Star is selected immediately on release                                                          |  ✅  |   ✅ `create-star.spec.ts`    |
| 103 | A freshly drawn Line is selected immediately on release (its own no-bounding-box selection style, see #28 above) |  ✅  |   ✅ `create-line.spec.ts`    |

Each hook's own unit spec (`useDrawShapeTool.spec.tsx`, `useDrawPolygonTool.spec.tsx`,
`useDrawStarTool.spec.tsx`, `useDrawLineTool.spec.tsx`) already asserts `store.getState().design.
selectedIds` directly and exactly for both the drag and click-to-place-default paths — but every
scenario still gets an e2e test too, since the actual claim is that the real per-node selection
_outline_ paints on screen right after a real `pointerdown`→`pointermove`→`pointerup` sequence, the
same "real browser + rendering" category the rest of this file reserves e2e for, not just that the
reducer flipped `selectedIds`. Each test draws the shape, screenshots it immediately (no extra
interaction), then clicks a point on empty canvas to deselect and screenshots again — any pixel
difference can only come from the selection outline (or, for Line, its thin highlight + endpoint
handles) that was already there before the deselect click.

Fixing this surfaced one incidental regression, caught by the existing suite rather than a new
test: `selection.spec.ts`'s marquee-live-selection test drew a baseline Frame and screenshotted it
immediately, previously guaranteed unselected — now that baseline showed the frame pre-selected by
this very fix, making the later "marquee-selected state differs from baseline" assertion trivially
false (both states were now identical). Fixed by explicitly deselecting before capturing that
baseline (`designPage.click(900, 600)`) — worth noting because the first fix attempt used `(900,
800)`, which sits below the default 720px Playwright viewport height and silently never reached the
canvas at all, so the click was a no-op and the test still failed the same way.

## Select newly placed Media files on creation

Media needed a variant of the fix above, not a copy of it: a multi-file pick places several nodes
one after another (one gesture per file, `armNextFile` re-arming the tool between each), and the
requested behavior is that **all** of them end up selected together once the whole queue is placed,
not just the most recent one — the same "shared group outline" state a manual multi-select
(shift-click/marquee) would produce. Two changes were needed together: (1) `handlePointerUp.ts` now
calls a new `appendLastCreatedNodeToSelection.ts` (`Canvas/utils/`, a sibling of
`selectLastCreatedNode.ts` above) after each `addNode`, which reads the _current_ `selectedIds` and
appends the just-placed node instead of replacing the array; (2) the stale-selection clear that used
to run on every placement's `handlePointerDown` (`dispatch(setSelection([]))`, copied from the
single-shot shape tools) had to move to `handleFileChange` in `useDrawMediaTool.ts` instead, firing
once when files are first picked — otherwise it would have wiped out file 1's selection the moment
file 2's own `pointerdown` fired, undoing the accumulation before it could ever show up.

| #   | Scenario                                                                                                                                 | Unit |            E2E            |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------- | :--: | :-----------------------: |
| 104 | Placing several files from one multi-file pick, one after another, ends with all of them selected together, not just the last one placed |  ✅  | ✅ `create-media.spec.ts` |

The unit suite (`useDrawMediaTool.spec.tsx`, `handlePointerDown.spec.ts`, `handlePointerUp.spec.ts`,
`appendLastCreatedNodeToSelection.spec.ts`) already asserts `store.getState().design.selectedIds`
exactly across a simulated multi-file queue, but the e2e version proves the real per-node/group
selection _outline_ actually paints correctly for this specific case, the same "real browser +
rendering" rationale as the shape-tools section above. It sidesteps needing to know either fixture
image's actual pixel dimensions (`pointer.png` turned out to be 256×256, not the small icon it looks
like at a glance — discovered via this test failing against a wrongly-guessed drag geometry before
switching to two natural-size clicks instead) by comparing the real placement result against a
manually-reconstructed reference: deselect everything, then shift-click both images through the
ordinary selection tool. Since 2+ selected nodes sharing a parent always render one shared group
outline regardless of _how_ they got selected (see #8 below), pixel-identical results between the
two prove the placement flow already left both genuinely selected together. Also needed a longer
`page.waitForTimeout` between the two placements than `pickMediaFile`'s own 200ms — the second
queued file still has to round-trip through its own async `Image()` decode before `armNextFile`
arms it, and four Playwright workers all decoding images at once under a full parallel run slows
that down further than it appeared when this test ran alone.

## Media click-to-place centers on the cursor

A plain click (no drag) placing Media at its natural size used to top-left anchor that corner at
the click point — the same "click without dragging" gesture every other draw tool instead centers
a default-size box on (shape tools center a fixed `DEFAULT_SHAPE_SIZE` square; Text on Path centers
its own default 100×100 path). Media never got the equivalent treatment because it has no fixed
default size to center — each file's actual natural width/height varies per image, so centering
needs the armed file's own dimensions rather than a shared constant. Fixed with a new
`getCenteredMediaRect.ts` (`useDrawMediaTool/utils/handlePointerUp/utils/`, alongside a sibling
`getMediaPlacementRect.ts` that now owns the whole `isClick ? centered : aspect-ratio-locked`
branch `handlePointerUp.ts` used to inline directly): `x`/`y` are the click point minus half the
armed file's `naturalWidth`/`naturalHeight`, rounded the same way every other rect in this codebase
already rounds (`roundRect.ts`, applied after the subtraction, not before — an odd natural dimension
like this repo's own 19px-tall cursor-icon fixture rounds its half-offset up, since `Math.round`
rounds `.5` towards `+Infinity`).

| #   | Scenario                                                                                                     | Unit | E2E |
| --- | ------------------------------------------------------------------------------------------------------------ | :--: | :-: |
| 110 | A plain click (no drag) places Media at its natural size, centered on the click point, not top-left anchored |  ✅  |  —  |

`getCenteredMediaRect.spec.ts`/`getMediaPlacementRect.spec.ts` already assert the exact centered
(and, for a drag, aspect-locked) rect precisely via direct function calls. An e2e version once
existed alongside these (dragging a second, independently-placed image to the exact equivalent
centered rect and asserting pixel equality against the click result), but it flaked persistently
with no code-side cause found and was removed rather than kept as permanent noise — the unit
coverage above is exact and sufficient on its own.

## Text tool (Etap 6 + the create/edit slice of Etap 7)

_(also touches `selection.spec.ts` / `hover.spec.ts` — see `docs/test-cases-selection.md`)_

Unlike every other draw tool, Text never commits to Redux on `pointerup` — dragging out a box
dispatches `startTextEdit` instead of `addNode` (`useDrawTextTool.ts`), which mounts a
`contentEditable` overlay (`TextEditOverlay.tsx`) positioned over the dragged box. The node is only
actually created on blur, and only if the typed content is non-empty (`useCommitTextEdit.ts`) — an
empty text box is discarded entirely, never added and never needing deletion.

| #   | Scenario                                                                                                                                 | Unit |           E2E            |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------- | :--: | :----------------------: |
| 35  | Drawing a text box, typing content, then clicking away commits a rendered text node                                                      |  —   | ✅ `create-text.spec.ts` |
| 36  | Drawing a text box and clicking away with no content typed discards it — nothing is created                                              |  —   | ✅ `create-text.spec.ts` |
| 37  | A single whitespace character (e.g. a space) counts as valid content and is kept, not discarded                                          |  ✅  |            —             |
| 38  | Typing a tool-shortcut letter (e.g. "r", "t") while editing text does not switch the active tool                                         |  ✅  | ✅ `create-text.spec.ts` |
| 39  | Hovering a committed text node only highlights its rendered content, not the empty space in its fixed box                                |  —   |    ✅ `hover.spec.ts`    |
| 40  | Clicking a text node inside its fixed box but past its rendered content does not select it                                               |  ✅  |  ✅ `selection.spec.ts`  |
| 41  | A selected text node can be dragged from anywhere in its fixed box, even past its rendered content                                       |  ✅  |  ✅ `selection.spec.ts`  |
| 42  | A run of text with no spaces wraps mid-word once it overflows the box, instead of overflowing on one line                                |  ✅  | ✅ `create-text.spec.ts` |
| 43  | Releasing without dragging (a plain click) still starts editing, seeded with a default 100×100 box, top-left anchored at the click point |  —   | ✅ `create-text.spec.ts` |

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
