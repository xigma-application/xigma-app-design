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

| #   | Scenario                                                                                                     | Unit |            E2E            |
| --- | ------------------------------------------------------------------------------------------------------------ | :--: | :-----------------------: |
| 1   | Drawing a frame with the Frame tool renders it and reverts the active tool to `default`                      |  —   | ✅ `create-frame.spec.ts` |
| 2   | Releasing without dragging (a plain click) still places a default 100×100 frame, centered on the click point |  —   | ✅ `create-frame.spec.ts` |

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

| #   | Scenario                                                                                                               | Unit |              E2E              |
| --- | ---------------------------------------------------------------------------------------------------------------------- | :--: | :---------------------------: |
| 97  | A freshly drawn Frame is selected immediately on release, with no extra click needed                                   |  ✅  |   ✅ `create-frame.spec.ts`   |
| 98  | A freshly drawn Section is selected immediately on release (proven via its outline alone, since its fill is invisible) |  ✅  |  ✅ `create-section.spec.ts`  |
| 99  | A freshly drawn Rectangle is selected immediately on release                                                           |  ✅  | ✅ `create-rectangle.spec.ts` |
| 100 | A freshly drawn Ellipse is selected immediately on release                                                             |  ✅  |  ✅ `create-ellipse.spec.ts`  |
| 101 | A freshly drawn Polygon is selected immediately on release                                                             |  ✅  |  ✅ `create-polygon.spec.ts`  |
| 102 | A freshly drawn Star is selected immediately on release                                                                |  ✅  |   ✅ `create-star.spec.ts`    |
| 103 | A freshly drawn Line is selected immediately on release (its own no-bounding-box selection style, see #28 above)       |  ✅  |   ✅ `create-line.spec.ts`    |

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

## Comment

Clicking the canvas with the Comment tool opens a `CommentDraftInput` — a plain DOM overlay (not
canvas-drawn) positioned via `worldToScreen`, so its `x`/`y` are already final screen pixels; neither
it nor a placed `CommentPin` apply any zoom-compensating `scale()` of their own, since nothing
upstream scales them down in the first place (fixed 2026-08-19 — see `getLastDateLabel`/`CommentPin`
history). Submitting (Ctrl/Cmd+Enter, or the footer button) dispatches `addComment`, persisting a
`CommentPin` at the draft's position and clearing `commentDraftPosition`. Clicking outside the open
draft is a two-step dismissal (`useCommentDraftOutsideDismissal`): the first outside click while the
draft has content just "wiggles" (`--animation` class) as a warning, a second outside click actually
cancels it; an empty draft cancels on the very first outside click. That outside-click listener only
counts the primary (left) mouse button, so panning with the middle button never closes an open draft
(regression fixed 2026-08-19 — it originally reacted to every button). The listener is registered once
at mount (after a same-tick guard so the click that opened the draft doesn't immediately close it) and
reads current value/warned state through refs rather than re-subscribing on every keystroke — an
earlier version re-subscribed via a `setTimeout(0)` on every `value`/`warned` change, which raced two
fast real outside-clicks in a live browser (a jsdom-with-fake-timers unit test can't reproduce that
race, since it advances the timer deterministically between clicks).

| #   | Scenario                                                                                                                           | Unit |         E2E          |
| --- | ---------------------------------------------------------------------------------------------------------------------------------- | :--: | :------------------: |
| 1   | Clicking the canvas with the Comment tool opens a draft input at the click position, auto-focused once its entrance animation ends |  ✅  | ✅ `comment.spec.ts` |
| 2   | Typing content and submitting with Ctrl/Cmd+Enter creates a persisted comment pin at that position and closes the draft            |  ✅  | ✅ `comment.spec.ts` |
| 3   | Clicking away from an empty draft cancels it immediately, without creating a pin                                                   |  ✅  | ✅ `comment.spec.ts` |
| 4   | Clicking away from a non-empty draft only wiggles it once as a warning; a second outside click then actually dismisses it          |  ✅  | ✅ `comment.spec.ts` |
| 5   | Panning with the middle mouse button never counts as an outside click, so it never dismisses an open draft                         |  ✅  | ✅ `comment.spec.ts` |
| 6   | The draft input and a placed pin keep a constant on-screen pixel size regardless of canvas zoom, in both directions                |  ✅  |          —           |

Scenario 6 is a pure CSS/inline-style sizing claim (`style.transform` stays `''` at any zoom) with no
browser-timing stakes beyond what `CommentPin.spec.tsx`/`CommentDraftInput.spec.tsx` already assert
precisely — no e2e needed per the standing rationale below.

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
`updateNode({ changes: { content } })` for an existing node instead of `addNode`. Clearing all
content on an existing node and blurring used to just discard the edit, leaving the node's original
content untouched (this codebase had no delete-node action at all) — since requested explicitly as a
UX fix: an existing node emptied out should disappear entirely, the same way a freshly-drawn box
with nothing typed already never gets created (#36 above). A new `deleteNode` reducer
(`store/design/slice.ts` + `handleDeleteNode.ts`) removes the id from `nodes`/`rootOrder`/
`selectedIds`; `useCommitTextEdit.ts` dispatches it instead of doing nothing whenever
`content.length === 0 && editingNodeId`. Text-on-path needed one more step: a path-bound `TTextNode`
is never independently useful without its text (the path node has no click/hover surface of its own
— `getNodeAtPoint.ts`'s `NodeType.path → false` branch — and is always created 1:1 alongside its
text, see the Text on Path section above), so `handleDeleteNode` recurses onto `node.pathId` when
deleting a text node that has one, cascading the path node's own deletion rather than leaving an
orphaned, permanently-unreachable entry behind in `nodes`/`rootOrder`.
While a node is being edited, `drawScene.ts` filters it out of the normal fill/selection/hover
render passes by id, so the live `contentEditable` overlay and its own `drawEditingText.ts` outline
are the only representation on screen — otherwise the stale static glyphs would render underneath
the live-typed ones.

| #   | Scenario                                                                                                                                      | Unit |            E2E            |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------- | :--: | :-----------------------: |
| 58  | Double-clicking an unselected text node enters edit mode with all its content selected, so typing replaces it instead of appending            |  ✅  |  ✅ `edit-text.spec.ts`   |
| 157 | Re-entering edit mode on a multi-line text node selects all of its content, not just the line/word under the double-click point               |  ✅  |  ✅ `edit-text.spec.ts`   |
| 59  | Double-clicking a selected text node past its rendered content (but inside its fixed box) still enters edit mode                              |  ✅  |  ✅ `edit-text.spec.ts`   |
| 60  | Blurring an existing-node edit updates that node's content in place, never adds a duplicate node                                              |  ✅  |             —             |
| 61  | Clearing all content on an existing node and blurring deletes that node, matching a freshly-drawn empty box never being created               |  ✅  |  ✅ `edit-text.spec.ts`   |
| 105 | Clearing all content on an existing text-on-path node and blurring deletes both the text node and its bound path node, not just the text      |  ✅  | ✅ `text-on-path.spec.ts` |
| 62  | The node currently being edited is excluded from normal fill, selection-outline, and hover-outline rendering                                  |  ✅  |             —             |
| 63  | A rotated, mirrored node being edited keeps rendering its glyphs (`drawEditingText.ts`) at its own rotation/flip                              |  ✅  |  ✅ `edit-text.spec.ts`   |
| 64  | The canvas-drawn selection highlight/caret (`drawEditingCaretAndSelection.ts`) reacts to the live selection, even on a rotated node           |  ✅  |  ✅ `edit-text.spec.ts`   |
| 86  | Clicking a point on a rotated or flipped straight-text box places the caret there, not wherever native (unrotated) DOM hit-testing would land |  ✅  |  ✅ `edit-text.spec.ts`   |
| 91  | Clicking a point on a plain (unrotated, unflipped) straight-text box places the caret there too, instead of exiting edit mode entirely        |  ✅  |  ✅ `edit-text.spec.ts`   |
| 92  | Double-clicking a word while actively composing straight text selects that word, so typing replaces it instead of colliding with the caret    |  ✅  |  ✅ `edit-text.spec.ts`   |
| 93  | Double-clicking a word inside a live, unsaved re-edit does not fall back to `useTextEditOnDoubleClick.ts`'s stale hit-test and discard it     |  ✅  |  ✅ `edit-text.spec.ts`   |

#61/#105's unit coverage (`useCommitTextEdit.spec.tsx`, `handleDeleteNode.spec.ts`) already asserts
`store.getState().design.nodes`/`rootOrder` exactly, including the path-node cascade specifically —
but each also gets an e2e proof that the node's real, rendered presence on the canvas actually
disappears after a genuine double-click → native `Backspace` → blur sequence, the same "real browser

- rendering" category the rest of this file is for. Both compare the cleared result against the
  already-established "drawn, then discarded with no content typed" reference (#36's plain-text case,
  its own text-on-path equivalent here) rather than a totally untouched page — the shared text/
  text-on-path toolbar button remembers whichever tool was used last (`lastTextTool`, same mechanic as
  `lastShapeTool`), so a page that touched Text on Path always renders that button differently from one
  that never did, regardless of whether the node itself survived; comparing against a fresh page would
  have flagged that unrelated toolbar-memory difference as if it were the bug under test. #105's own
  e2e version can only prove the _overall_ disappearance, not specifically that the path node (as
  opposed to just its text) was the thing deleted — a path node has no independent click/hover surface
  of its own, so an orphaned-but-undeleted path would render identically invisible to a genuinely
  cascaded one; only `handleDeleteNode.spec.ts`'s direct `state.nodes` assertion can actually
  distinguish the two, which is why the cascade specifically stays unit-proven even though the
  top-level scenario also has an e2e test.

#58/#59 are the two distinct hit-test branches (`getDoubleClickedTextNode.ts` already pins both
precisely via `store.getState()`), but the actual claim worth an e2e proof is a real native
`dblclick`, a real `window.getSelection()`/`Range` call against a real `contentEditable` div, and a
real subsequent `page.keyboard.type` — proving the browser's own selection/typing behavior
(replace-selected-text) actually fires, not just that the app _asked_ it to. Both assert by
comparing against a from-scratch reference render of the final text at the same position/box:
pixel equality can only hold if the edit both replaced (not appended) and updated in place (not
duplicated), so this single screenshot comparison covers #58-#60 together without a separate
mechanism for #60. #60/#62 stay unit-only — each is a precise `store.getState()`/mocked-`gl` call-count
assertion (`useCommitTextEdit.spec.tsx`, `drawScene.spec.ts`) that a screenshot diff wouldn't
meaningfully improve on, per the "why so few scenarios get e2e coverage" rationale below. #61 gets
its own e2e test now too, per the note above.

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

#86 was a known, previously-deferred gap (`docs/ROADMAP.md`): a click _inside_ an already-open edit
session used to always fall through to the browser's own native `contentEditable` hit-testing, which
places the Range against the overlay div's unrotated, unflipped native text layout — correct only
when the box's own `rotation`/`flipX`/`flipY` are all identity. For a rotated or flipped box, the
same screen point maps to a different character than the one visually under the cursor (worst case,
a 180-degree box reads back-to-front, so a click near what looks like the end of the text lands the
caret near the start instead). `useStraightCaretEditing.ts` (originally `useRotatedCaretEditing.ts` —
renamed for #91 below, see that entry for why "rotated" stopped being the right scope) fixes this the
same way `useCurvedCaretEditing.ts` already fixed the equivalent bug for path text: a real
`document`-level `pointerdown`/`pointermove`/`pointerup` listener computes the clicked character via
`getStraightCaretIndexAtPoint.ts` — unrotate then unflip the query point (`rotatePoint`/
`flipTextPoint`, the same inverse-transform trick `getUnrotatedQueryPoint` already uses for
hit-testing elsewhere), then walk `wrapTextWithOffsets`/`measureGlyphTextWidth` to find the nearest
character boundary — and programmatically sets the real DOM `Range`/`Selection` via
`setEditableSelectionRange.ts`, overriding whatever the native click would have done.
`useSelectionTool.ts`'s own pointer handling is gated off by `shouldUseCanvasCaretEditing.ts` while
either canvas-driven caret-editing hook is active, so a click that lands on the bare canvas (rather
than the overlay) during such a session can't also select/drag some other node underneath. The unit
suite (`getStraightCaretIndexAtPoint.spec.ts`, `shouldUseCanvasCaretEditing
.spec.ts`, `useStraightCaretEditing.spec.tsx`) asserts the exact index/distance/selection precisely
in jsdom, but the e2e version proves a real rotate-ring drag to an exact 180 degrees (dragging to the
reflection of the arm point through the box's own center, guaranteeing the delta regardless of the
arm point's exact position) followed by a real click at two different points on the now-upside-down
text produces two visibly different results for the same typed character — the same "compare two
independently-drawn pages" pattern `text-on-path.spec.ts`'s curved-caret tests already use.

#91 is a real, reported regression, found right after #86 shipped: `TextEditOverlay.module.scss`
sets `pointer-events: none` on the editing overlay (added earlier, to stop resize/rotate/path-offset
hover cursors from bleeding through while text is being edited), which means the overlay itself can
**never** receive a click at all, rotated or not — every click always falls straight through to the
`<canvas>` underneath. #86's own fix already accounted for this correctly for rotated/flipped/path
boxes (routing them through a canvas-level listener instead of relying on native hit-testing), but
`isBoxRotatedOrFlipped`'s gate deliberately left plain (rotation 0, no flip) boxes out, on the
stale assumption from before the `pointer-events: none` change that "native still handles the plain
case" — it never did, once that change landed. So for a plain box specifically, a click meant to
reposition the caret instead fell through to `useSelectionTool.ts`'s still-active canvas listener,
which never calls `preventDefault()` — letting the browser's own default mousedown action fire
unopposed, blurring the overlay and committing/exiting the edit session entirely, exactly the "select
a cursor position and it immediately kicks you out of the tool" behavior reported live. Renamed
`useRotatedCaretEditing.ts` → `useStraightCaretEditing.ts` and widened its gate (and
`shouldUseCanvasCaretEditing.ts`'s) to cover every straight (non-path) box being edited, not just
rotated/flipped ones — `getStraightCaretIndexAtPoint.ts`'s inverse-transform math already degrades
correctly to identity at `rotation: 0`/no flip, so no new math was needed, only the activation
condition. Fixing this exposed a second, previously-hidden bug in the same area: `useSelectionTool.ts`
being active throughout a plain-text edit was also silently responsible for **deselecting** the node
once its own empty-canvas-click handler ran on the same click that caused the native blur — with
`useSelectionTool.ts` now correctly disabled for the whole edit session (any rotation), that dedicated
deselect-on-commit behavior had to move into `useCommitTextEdit.ts` itself (`dispatch(setSelection([]))`
unconditionally alongside `stopTextEdit()`), rather than continuing to rely on an unrelated hook's
side effect — caught by two existing screenshot tests (#58/#59 above) that started failing once
`useSelectionTool.ts` stopped incidentally doing this. #91's own e2e version mirrors #86's exact
pattern for a never-rotated box: click a point between two rendered characters vs. just past them,
type the same character, and assert the two independently-drawn results differ — proving both that
the click landed inside the edit session (not exiting it) and that it landed at the right character.

#92 is a real, reported regression found right after #91 shipped: the same `handlePointerDown`
routine that #86/#91 route through to place a collapsed caret always collapsed to a single index,
with no notion of "this is actually a double-click" — so double-clicking a word to select it (the
browser's own native gesture) got silently overridden into a plain caret placement, for every
editing session (straight or curved, any rotation), since `pointer-events: none` means the browser
never sees the click on the overlay either way and can't run its own native word-select. Fixed with
a new shared `getWordRangeAtIndex.ts` (pure string-index math — walks outward from the clicked
boundary while the adjacent characters stay on the same side of a `\S` word/non-word split) plus a
dedicated `dblclick` listener in both `useStraightCaretEditing.ts` and `useCurvedCaretEditing.ts`
(`handleDoubleClick.ts` in each hook's own `utils/`, alongside the existing `handlePointerDown`/
`handlePointerMove`/`handlePointerUp` split — `useStraightCaretEditing.ts` itself got the same
promotion `useCurvedCaretEditing.ts` already had, since it grew past the "trivial single hook file"
threshold once double-click joined single-click/drag/release as a fourth listener) — the two
preceding `pointerdown`s that make up a double-click still each collapse the selection once, but the
browser's own native `dblclick` recognition fires last and this handler's word-range selection wins.
`getWordRangeAtIndex.spec.ts` pins the exact boundary math (mid-word, at a word/whitespace edge, past
the content length, degenerate empty content) precisely; the e2e version proves the same "compare two
independently-drawn pages" claim as #86/#91 — double-click a word mid-composition, retype it, and
assert the result matches a reference typed directly, meaning the double-click genuinely replaced
just that word rather than colliding with (or being silently eaten by) the caret-placement path.

#93 is a second, deeper regression uncovered while verifying #92: `useTextEditOnDoubleClick.ts` (the
hook that starts an edit session on double-click, #58/#59 above) has always been gated purely on
`activeTool === default`, never on whether an edit session is already live — so a double-click meant
to select a word _inside_ an active, unsaved re-edit also reached this hook's own canvas-level
`dblclick` listener, which hit-tests against the node's stale, already-committed content in the store
(the live, in-progress content only exists in `editingTextContent`/the DOM overlay, not yet written
back via `updateNode`) and unconditionally dispatches a fresh `startTextEdit`, silently discarding
whatever had been typed since re-entering. Unreported until now because double-clicking mid-edit
previously did nothing useful (before #92) — this behavior existed, it just weren't yet something a
user had reason to trigger. Fixed by also gating `useTextEditOnDoubleClick.ts` on `!editingTextBox`.
The unit suite (`useTextEditOnDoubleClick.spec.tsx`) asserts the exact store state (`editingNodeId`/
`editingTextContent` unchanged) directly; the e2e version types content, re-selects a word inside it,
retypes, and checks the final result against a from-scratch reference — a stale reset would have
reverted to the original committed text partway through, producing a completely different final
render than what re-typing the same final content directly would produce.

## Escape while editing Text / Text on Path

Escape previously did nothing while editing at all: `useBlockShortcutPropagation.ts`'s blanket
`event.stopPropagation()` on every keydown meant the global Escape listener (`useToolbarShortcuts.ts`)
never even received the event, and nothing inside the overlay handled `Escape` itself. Requested
explicitly as a two-stage UX flow mirroring most design tools: the _first_ Escape while actively
editing commits the edit (same add/update/delete branching `useCommitTextEdit.ts` already had for a
normal blur — see the Double-click section above and the delete-on-empty section further up) and
leaves the resulting node **selected**, unlike an ordinary blur/click-away commit which always
deselects; a _second_ Escape (now just selected, not editing) deselects it via #106 above — two
presses total to go from "actively editing" to "fully deselected." A brand-new (never-before-existing)
box with content typed behaves like any other commit-and-select; a brand-new box with **no** content
discards on Escape exactly like it would on blur (nothing is created — matches #36's established
"empty box never created" behavior). Implemented via a `selectOnCommitRef` (`useRef(false)`, created
in `TextEditOverlay.tsx`, threaded into both `useBlockShortcutPropagation.ts` and
`useCommitTextEdit.ts`): pressing Escape sets the ref and calls `event.currentTarget.blur()`, letting
the _existing_ `onBlur` → `useCommitTextEdit` handler run unchanged, except it now reads the ref to
decide whether to select the committed node (`selectCommittedNode.ts`, a new util: dispatches
`setSelection([editingNodeId])` for an existing node, or reuses `selectLastCreatedNode.ts` — the same
util the shape tools use — to resolve a brand-new node's freshly-`nanoid()`-generated id) instead of
clearing the selection as a normal blur does. This reuses all the existing commit/delete branching
logic instead of duplicating it, and avoids any double-commit race: the ref is reset to `false`
inside the same handler invocation it's read from, so a later _native_ blur (unrelated to Escape)
never misreads a stale `true`.

| #   | Scenario                                                                                                                                | Unit |          E2E           |
| --- | --------------------------------------------------------------------------------------------------------------------------------------- | :--: | :--------------------: |
| 107 | Escape while typing fresh text (or path-text) with content commits it and leaves it selected, unlike a plain blur which deselects       |  ✅  | ✅ `edit-text.spec.ts` |
| 108 | Escape while drawing a fresh text (or path-text) box with no content discards it, same as blurring it away empty                        |  ✅  | ✅ `edit-text.spec.ts` |
| 109 | Escape while re-editing an existing text (or path-text) node exits editing and selects it; a second Escape then deselects it (via #106) |  ✅  | ✅ `edit-text.spec.ts` |

All three get both layers of coverage for the same reason as the rest of this file: the unit suite
(`useCommitTextEdit.spec.tsx`, `useBlockShortcutPropagation.spec.tsx`, `selectCommittedNode.spec.ts`,
`TextEditOverlay.spec.tsx`) already asserts `store.getState().design.selectedIds`/`nodes`/`rootOrder`
exactly for every branch, but each also gets an e2e proof that the real rendered selection outline
actually appears/disappears after a genuine `keydown` — the same "real browser + rendering" category
the rest of this file is for. #107/#109's e2e versions compare against a manually-reconstructed
reference (commit via blur, then select via a real plain click) rather than asserting exact pixels
directly, the same "compare two independently-produced pages" pattern used throughout this file.
`text-on-path.spec.ts`'s own versions of #107/#108 had to compare against a "drawn, then
discarded/committed via blur" reference rather than a totally untouched page, for the same
`lastTextTool` toolbar-memory reason noted in the delete-on-empty section above — a page that
selected Text on Path always renders that shared toolbar button differently from one that never
touched the tool at all, regardless of the node's own final state. All of #107–#109's captures also
explicitly rest the pointer at a shared neutral point before every screenshot: Escape is a pure
keyboard event and never moves the mouse, so without this the hover outline (a rendering concern
fully independent of selection) would depend on wherever the previous gesture happened to leave the
pointer — the exact "Gotcha for other e2e tests" already documented under Hover highlight above,
re-encountered here for the same underlying reason.

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
truncate-on-overflow, and the draggable start-offset handle were built in an earlier pass and are
unaffected by this node-model rework, since they always read the text node's own denormalized
box, never a separate node lookup.

| #   | Scenario                                                                                                                                                                                                                                               | Unit |            E2E            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--: | :-----------------------: |
| 74  | Drawing a path with the Text on Path tool, typing content, then clicking away commits a rendered curved text node bound to a real, separate path node                                                                                                  |  —   | ✅ `text-on-path.spec.ts` |
| 75  | Typing a tool-shortcut letter while editing text on a path does not switch the active tool (the focus-timing bug this feature originally shipped with — `useSeedEditableTextOnEntry.ts` grabs focus via `useLayoutEffect`, not a deferred `useEffect`) |  —   | ✅ `text-on-path.spec.ts` |
| 76  | Resizing the source path node updates the attached text's curve live, proving the two are a real bidirectional relation, not independently-positioned nodes                                                                                            |  ✅  | ✅ `text-on-path.spec.ts` |
| 77  | Dropping the overflowing tail of the content (instead of shrinking the font) so text never overlaps itself when longer than the path's circumference                                                                                                   |  ✅  |             —             |
| 78  | Dragging the blue start-offset handle moves where the text begins along the path                                                                                                                                                                       |  ✅  |             —             |
| 84  | Clicking a point along curved text (re-entered via double-click) places the caret at the nearest character index on the curve, so a typed character inserts there instead of always landing at the end                                                 |  ✅  | ✅ `text-on-path.spec.ts` |
| 85  | Dragging along the curve from one character to another selects that range; typing replaces the selection instead of inserting alongside it                                                                                                             |  ✅  | ✅ `text-on-path.spec.ts` |
| 87  | Clicking a point on a rotated (or flipped) path-text circle places the caret at its actual rotated/flipped screen position, not the position it would occupy at rotation 0                                                                             |  ✅  | ✅ `text-on-path.spec.ts` |
| 90  | Committing a freshly typed path-text node without ever having explicitly selected it does not leave a stale resize-handle hit zone active at the underlying path node's own corner                                                                     |  ✅  | ✅ `text-on-path.spec.ts` |
| 94  | Double-clicking a word while actively composing path-text selects that word (via `useCurvedCaretEditing.ts`'s own `handleDoubleClick.ts`, sharing `getWordRangeAtIndex.ts` with the straight-text case — see #92 above)                                |  ✅  | ✅ `text-on-path.spec.ts` |
| 95  | Typing path-text with no active selection shows a fill-less ribbon outline around the whole typed content (`drawCurvedEditingOutline.ts`), not just around an actively-dragged selection                                                               |  —   | ✅ `text-on-path.spec.ts` |
| 96  | Releasing without dragging (a plain click) still creates a default 100×100 path, top-left anchored at the click point, and starts editing on it                                                                                                        |  —   | ✅ `text-on-path.spec.ts` |

#77/#78 stay unit-only: `getVisibleCurvedContent.spec.ts` and `continuePathOffsetDrag.spec.ts` already
assert the exact resulting visible content / offset value via direct function calls and
`store.getState()`, which a screenshot diff can't improve on precisely — see "why so few scenarios
get e2e coverage" below. #76 gets e2e coverage despite having exact unit coverage too
(`handleUpdateNode.spec.ts`'s cascade tests) because the interesting failure mode is specifically a
real `pointerdown`→`pointermove`→`pointerup` resize-handle drag on a _live-rendered_ curved-text
node actually repainting in sync — the same "real browser + rendering + timing" category as the
Resize section's #66 above, not just the reducer math in isolation.

#90 is a real, reported regression: `useDrawTextOnPathTool.ts` selects the draft path node
(`setSelection([pathNodeId])`) purely so the dashed "editing" outline (#88 below) can resolve before
the real text node exists yet — but `useCommitTextEdit.ts` never reconciled `selectedIds` once the
actual text node was created, so the stale path id stayed selected after commit even though
`drawPerNodeSelectionOutlines.ts`'s `NodeType.path` branch never draws anything for it (nothing
visible reads as "selected"). Hit-testing doesn't share that same path-type exclusion though:
`useHoverHighlight.ts` trusts `selectedIds` directly when computing which resize-handle hit zones
are active, so the invisible-but-still-selected path kept responding to a resize-cursor hover as if
genuinely selected. Selecting then deselecting the node "fixed" it only as a side effect, by
overwriting/clearing that stale id — reported live as "select it once and the problem goes away."
Fixed in `useCommitTextEdit.ts`: `selectedIds` is now cleared once a new (non-editing) path-bound
box commits, regardless of whether text was typed or not, matching the plain Text tool's own
existing "never auto-selected after creation" convention (confirmed against #79 below, which already
encodes that a freshly committed path-text node reads as fully unselected). The unit suite
(`commitTextNode.spec.ts`, `useCommitTextEdit.spec.tsx`) asserts `store.getState().design.selectedIds`
directly and precisely; the e2e version proves the actual observable symptom instead — hovering the
path's own corner right after committing, without ever having clicked the node, must show no resize
cursor at all, whereas hovering that exact same point once the node is genuinely selected does. The
commit step deliberately blurs via a toolbar button click, not a canvas click: clicking empty canvas
would itself dispatch `setSelection([])` through the ordinary selection tool regardless of this fix,
which would mask whether the commit itself left anything stale behind. The test also "warms up" the
resize cursor on an unrelated node first, mirroring the Resize section's #43 rationale — the very
first resize-cursor hover in a cold page can take close to a second to decode, and skipping this step
risks the "no cursor" assertion passing for the wrong reason (image not decoded yet) instead of the
real one (nothing is actually selected).

#84/#85 are `useCurvedCaretEditing.ts`: a real `document`-level `pointerdown`/`pointermove`/
`pointerup` listener that hit-tests the click against the curve's own per-character arc-length
boundaries (`getCurvedCaretIndexAtPoint.ts`, reusing the same boundary/offset math `#77`'s
truncate-on-overflow and `isPointInCurvedText.ts` already use), then moves the real DOM selection inside the
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

#87 was a real, reported regression found right after #84/#85 shipped: `getCurvedCaretIndexAtPoint.ts`
and `isPointInCurvedText.ts` already unrotated the query point via `getNearestEllipsePathOffset`'s
own `rotation` handling, so a rotated path's hit-testing happened to already be correct — but neither
util accounted for the box's own `flipX`/`flipY` (mirroring the query point back before running the
curve math, the same `flipTextPoint` step `getStraightCaretIndexAtPoint.ts` already does for straight
text), so a _flipped_ path-text node's clicks were silently wrong. Separately, and worse: the
_rendered_ caret/selection-highlight during an active edit session (`drawCurvedCaret.ts`,
`drawCurvedSelectionHighlight.ts`, via `getCurvedCaretPoint.ts`/`getCurvedSelectionRects.ts`) never
took `rotation` **or** `flipX`/`flipY` into account at all — it always computed the caret's local,
unrotated/unflipped position on the ellipse and drew it there directly, so a rotated or flipped
path-text node's caret/highlight rendered as if `rotation: 0` regardless of the click landing on the
correct character underneath. Fixed with a new shared `transformCurvedPoint.ts` (mirroring the
already-established `flipTextPoint`-then-`rotatePoint` order used everywhere else in this codebase
for rotated/flipped hit-testing and rendering) applied to both the caret point and every selection
rect before they're drawn. The unit suite (`transformCurvedPoint.spec.ts`,
`getCurvedCaretIndexAtPoint.spec.ts`, `isPointInCurvedText.spec.ts`, `drawCurvedCaret.spec.ts`,
`drawCurvedSelectionHighlight.spec.ts`) pins the exact position/angle math and proves each rendered
buffer actually changes for a rotated/flipped box, but #87's e2e version is the same
"real screen coordinates against real rendered glyphs" category as #84/#85: it rotates a real
path-text node exactly 180 degrees (dragging the rotate ring to the reflection of the arm point
through the node's own center, guaranteeing the delta precisely, same trick `edit-text.spec.ts`'s
equivalent straight-text scenario uses), clicks the screen point where "H" now actually renders, and
compares against clicking that identical screen point on an unrotated reference — any pixel
difference can only come from the caret genuinely landing on the rotated content, not the pre-fix
rotation-0 assumption.

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
| 88  | The bare curve renders dashed while actively drawing or editing the path (first creation or re-edit), instead of the solid outline used once just selected/hovered       |  ✅  | ✅ `text-on-path.spec.ts` |
| 89  | Hovering the path-offset handle shows the hand cursor; pressing and dragging it switches to the pressing cursor, reverting to the hand cursor on release                 |  ✅  | ✅ `text-on-path.spec.ts` |

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

#88 gave the "editing" state its own `TPathOutlineStyle` (previously `getPathOutlineStyles.ts`
folded active editing into the same `'selected'` bucket as a plain, non-editing selection, so both
rendered identically via `drawEllipse`'s solid `LINE_LOOP` stroke) so a user can tell "I'm actively
drawing/typing this path" apart from "I've just selected an already-committed one" at a glance —
reported live: a plain-selected path and an actively-edited one looked indistinguishable. Editing
now routes through a new `drawDashedEllipseOutline.ts`, which walks the curve by real arc length
(`buildEllipseArcLengthTable`/`getEllipsePathSample`, the same machinery the path-text caret/offset
math already uses, not a fixed angle-step sample) so the dash/gap pattern tiles evenly regardless of
the ellipse's aspect ratio, and draws each dash as a disconnected `gl.LINES` pair instead of a closed
`gl.LINE_LOOP`, so real gaps show between dashes. It takes priority over hover too — the point of the
dashed state is knowing you're mid-edit, so resting the pointer on your own curve while typing must
not flash it over to the thicker hover style. The dash/gap lengths (`DASH_LENGTH_PX`/`DASH_GAP_PX`,
`constant/canvas.ts`) are defined in screen pixels and divided by `viewport.zoom` before being
converted to a world-space dash count every frame, so the pattern re-tiles denser while zoomed in and
sparser while zoomed out, live, the same "constant on-screen size regardless of zoom" convention
`CARET_WIDTH_PX`/`HOVER_OUTLINE_WIDTH` already use elsewhere — first shipped as a fixed
angle-based sample (a constant dash count regardless of zoom or circle size), corrected after
live feedback that it needed to scale with zoom instead. Used from both `drawDraftShape.ts`'s
`NodeType.path` case (the initial drag-to-create phase, before any text node exists) and
`drawPathOutline.ts`'s `'editing'` branch (re-editing an existing path-text node). The unit suite
(`drawDashedEllipseOutline.spec.ts`, `getPathOutlineStyles.spec.ts`, `drawPathOutline.spec.ts`,
`drawDraftShape.spec.ts`) already asserts the exact zoom-scaled dash count and `gl.LINES`-vs-
`gl.LINE_LOOP` draw calls precisely — including that doubling/halving the zoom doubles/halves the
dash count — which a screenshot diff can't improve on for the zoom-scaling claim specifically (per
the "why so few scenarios get e2e coverage" rationale below), so #88's e2e version sticks to the
same "real browser repaints in response" claim as #79-82: it draws a fresh path, types into it
(still mid-edit, dashed), then commits and re-selects it (solid) and asserts the two screenshots
differ.

## Corner radius (Rectangle)

Four draggable handles, one per corner, that round a Rectangle's corners — canvas-only for now, no
side-panel numeric input yet (a separate, later feature). Handles render only while the node is both
selected _and_ hovered (`drawCornerRadiusHandlesLayer.ts`), unlike the resize corner squares which
show on selection alone — and only once the shape's own on-screen size clears
`MIN_ELEMENT_SCREEN_SIZE_FOR_RADIUS_HANDLES_PX` (`shouldShowCornerRadiusHandles.ts`), matching
Figma's own "too small to bother" cutoff. Dragging works absolute-position-based off the grabbed
corner (`getCornerRadiusFromPoint.ts`, mirroring `continueEndpointDrag.ts`'s "write the raw point,
don't accumulate deltas" convention), with `radius = max(leftward/rightward inset, up/down inset)` —
deliberately not requiring diagonal movement, so either axis alone can drive it to max. Once several
corners' handles coincide (radius near/at `getMaxCornerRadius` = half the shorter side), a single
click can't disambiguate which corner was meant; resolution defers to the drag's own first-movement
direction against each candidate's quadrant position (`resolveCornerFromDirection.ts`), settling
once and reusing that pick for the rest of the gesture. At `cornerRadius === 0` the existing resize
corner-handle still wins any hit-test tie (`handlePointerDown.ts`'s
`resizeHandleHit ? null : getCornerRadiusHandleAtPoint(...)` short-circuit).

At rest (not being dragged), `cornerRadius === 0` renders the handle at a "zero-state" screen-space
offset from the corner purely so it stays grabbable — dragging _toward_ `cornerRadius === 0` used to
visibly snap the handle out to that same offset the instant the dispatched radius hit exactly 0,
even while the pointer was still held down near the corner. `drawCornerRadiusHandlesLayer.ts` now
takes an `isDraggingCornerRadius` flag (threaded from `Canvas.tsx`'s own `cornerRadiusDragRef`/
`polygonCornerRadiusDragRef` — lifted out of `useSelectionTool.ts` and passed to both it and
`useCanvasRenderLoop` the same way `hoverRef`/`marqueeRef`/`sliceRef` already are, then dereferenced
per-frame in `startRenderLoop.ts`'s `tick`) that forces `getCornerRadiusHandlePositions.ts`/
`getPolygonCornerRadiusHandlePosition.ts` to use the literal radius (even 0, sitting right on the
corner/vertex) instead of the zero-state fallback while a drag is actually in progress; the
zero-state offset only re-applies once `disarmCornerRadiusDrag.ts`/`disarmPolygonCornerRadiusDrag.ts`
clear the ref on pointer release.

A small but _nonzero_ radius has its own visibility edge case: at rest, `cornerRadius > 0` renders
the handle at its literal position (`radius` world units from the corner/vertex), inset by a fixed
**world** amount that doesn't change with zoom — but the handle's own rendered screen size does stay
constant regardless of zoom, so as you zoom out, the screen-space gap between the handle and the
corner/vertex it sits next to keeps shrinking until the handle visually overlaps that corner (or the
resize handle sitting on it). `shouldShowCornerRadiusHandles.ts` now takes the live `cornerRadius`
and `isDragging` too, gating on **both** the existing shape-size check and a new
`cornerRadius * viewport.zoom >= MIN_RADIUS_HANDLE_GAP_PX` check (reusing the same floor the
zero-state offset already clamps to) — `cornerRadius === 0` is exempt (the zero-state offset already
guarantees a visible gap by construction) and `isDragging` is exempt (mid-drag always tracks the
literal position per the fix above; hiding it while the user is actively holding it would be worse).
Both hit-testing (`getCornerRadiusHandleAtPoint.ts`/`getPolygonCornerRadiusHandleAtPoint.ts`) and
rendering (`drawCornerRadiusHandlesLayer.ts`) read the same gate, so a hidden handle is also
ungrabbable, not just invisible.

| #   | Scenario                                                                                                                                                       | Unit |            E2E             |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: | :------------------------: |
| 115 | Handles render only once the rectangle is both selected and hovered — selected alone shows nothing extra                                                       |  ✅  | ✅ `corner-radius.spec.ts` |
| 116 | Dragging the ne handle purely left (no diagonal movement) alone drives the radius to max                                                                       |  ✅  | ✅ `corner-radius.spec.ts` |
| 117 | Dragging the ne handle purely down (no diagonal movement) alone also drives the radius to max                                                                  |  ✅  | ✅ `corner-radius.spec.ts` |
| 118 | Clicking exactly on the corner still arms the resize handle, not the radius handle, even once cornerRadius is nonzero                                          |  ✅  |             —              |
| 119 | Once several handles coincide near max radius, the drag's first-movement direction picks which corner applies                                                  |  ✅  |             —              |
| 120 | A rounding stored via drag never overshoots a fractional max (e.g. 50.5 on a 101px side) after rounding to the nearest px                                      |  ✅  |             —              |
| 121 | Handles vanish entirely once the shape's on-screen size drops below the visibility threshold, regardless of radius                                             |  ✅  |             —              |
| 127 | Dragging to radius 0 keeps the handle tracking the pointer at the corner mid-drag, only snapping to the zero-state offset once the pointer is released         |  ✅  | ✅ `corner-radius.spec.ts` |
| 128 | A small nonzero radius hides its handle once zooming out shrinks its screen-space gap below the minimum, instead of letting it overlap the corner              |  ✅  | ✅ `corner-radius.spec.ts` |
| 129 | A radius that clears the minimum screen gap keeps showing its handle even when small, and `cornerRadius === 0` is never hidden by this rule regardless of zoom |  ✅  |             —              |
| 134 | Releasing any drag (corner-radius or otherwise) outside the shape, with no further pointer movement, hides its hover outline/handles immediately               |  ✅  | ✅ `corner-radius.spec.ts` |

#118-#121, #129 stay unit-only: each is a precise, already-exact `store.getState()`/direct-function-call
assertion (`handlePointerDown.spec.ts`, `resolveCornerFromDirection.spec.ts`,
`continueCornerRadiusDrag.spec.ts`, `shouldShowCornerRadiusHandles.spec.ts`/
`getCornerRadiusHandleAtPoint.spec.ts`) that a screenshot diff can't meaningfully improve on — per
the "why so few scenarios get e2e coverage" rationale below, none of these turn on real browser
paint timing the way #115-#117 do (a real `pointermove`/`pointerdown` sequence against the real
rendered handle positions actually reaching the grabbed corner and repainting the rounded fill).

#134 was a real, shipped bug in `useHoverHighlight.ts`, not specific to corner radius: its
`handlePointerMove` early-returns unless `event.buttons === 0`, deliberately ignoring pointer moves
while any button is held (so hover doesn't flicker onto other nodes mid-drag) — but nothing ever
re-evaluated hover once a drag ended without a _further_ `pointermove`, so releasing outside a shape
(e.g. dragging a corner-radius handle past the shape's own edge) left the hover outline/handle stuck
showing the pre-drag hover state indefinitely, as if the cursor were still over the shape. Fixed by
also listening for `pointerup` with the exact same handler — pointer capture (`setPointerCapture` on
arm) guarantees `pointerup` still fires on the canvas even with the cursor physically outside the
shape's bounds, and by the time a primary-button `pointerup` fires `event.buttons` is already back to
0, so the existing gate lets it through unmodified. Caught one existing e2e test relying on the
previously-stale behavior incidentally: releasing a corner-radius drag exactly on the resize handle's
own corner point now correctly nulls hover (matching what a plain, undragged hover at that exact spot
already did) rather than keeping the prior corner-radius-handle hover state — fixed by re-hovering the
comparison position explicitly before that test's final screenshot.

## Corner radius (Polygon)

A single draggable handle, at the polygon's fixed top vertex (`getPolygonPoints` always places
vertex index 0 at the apex regardless of `sides`/aspect ratio), that rounds every vertex identically
by one shared `cornerRadius` — unlike Rectangle's 4 independent-looking corners. Same visibility
gate as Rectangle (`shouldShowCornerRadiusHandles`, selected _and_ hovered), but no
collision/candidate resolution is possible since there's only ever one handle, so the drag wiring is
its own small mechanism (`armPolygonCornerRadiusDrag`/`continuePolygonCornerRadiusDrag`/
`disarmPolygonCornerRadiusDrag`) parallel to Rectangle's rather than sharing it. Dragging projects
the pointer onto the fixed vertex→center axis and clamps to `[0, getMaxPolygonCornerRadius]` — the
apothem-based max where adjacent rounded corners just touch and the polygon degenerates into its own
inscribed circle — so "toward center increases, away decreases" falls out of the projection itself
with no direction-resolution step needed.

| #   | Scenario                                                                                                                   | Unit |            E2E             |
| --- | -------------------------------------------------------------------------------------------------------------------------- | :--: | :------------------------: |
| 122 | The handle renders only once the triangle is both selected and hovered — selected alone shows nothing extra                |  ✅  | ✅ `corner-radius.spec.ts` |
| 123 | Dragging the handle straight down (toward the center) visibly rounds every corner                                          |  ✅  | ✅ `corner-radius.spec.ts` |
| 124 | Dragging past the center and back doesn't misbehave (stays clamped, keeps tracking the pointer)                            |  ✅  | ✅ `corner-radius.spec.ts` |
| 125 | The dispatched radius clamps to `getMaxPolygonCornerRadius`, matching the confirmed Figma apothem values                   |  ✅  |             —              |
| 126 | The handle vanishes entirely once the shape's on-screen size drops below the visibility threshold                          |  ✅  |             —              |
| 132 | After a mirroring resize (flipX/flipY), the handle appears at its physically flipped position, not the local/unflipped one |  ✅  | ✅ `corner-radius.spec.ts` |

#125-#126 stay unit-only for the same reason as Rectangle's #118-#121: each is an exact
`store.getState()`/direct-function-call assertion (`getMaxPolygonCornerRadius.spec.ts`,
`continuePolygonCornerRadiusDrag.spec.ts`, `getPolygonCornerRadiusHandleAtPoint.spec.ts`) that
doesn't turn on real browser paint timing the way #122-#124 do. #132 was a real, shipped bug: the
handle-position math ran entirely in local/unflipped space and never applied `flipPoint` to the
result, so a flipped polygon's handle rendered at the pre-flip location, floating off the actual
shape. Fixed by flipping the computed local position forward (`getPolygonCornerRadiusHandlePosition.ts`)
and, symmetrically, un-flipping the pointer position before projecting it during a drag
(`continuePolygonCornerRadiusDrag.ts`) — the same forward/inverse pairing `isPointInPolygon.ts`
already used for hit-testing the shape itself.

## Corner radius (Star)

Same single-handle mechanism as Polygon (`armStarCornerRadiusDrag`/`continueStarCornerRadiusDrag`/
`disarmStarCornerRadiusDrag`, one shared `cornerRadius` applied to every vertex), but the tangent-arc
rounding math (`getRoundedVertexPoints`, shared with Polygon) rounds a star's concave inner vertices
the same way it rounds the convex outer tips — the arc's bisector direction falls out of the vertex
geometry itself, so no convex/concave branch is needed. The handle sits at the rounding arc's own
center, offset from the vertex by `radius / sin(halfAngle)` (`getCornerRadiusHandleSetbackMultiplier`,
also shared with Polygon and matching how Rectangle's corner handles already behave), not on the
rounded boundary itself.

| #   | Scenario                                                                                                                   | Unit |            E2E             |
| --- | -------------------------------------------------------------------------------------------------------------------------- | :--: | :------------------------: |
| 127 | The handle renders only once the star is both selected and hovered — selected alone shows nothing extra                    |  ✅  | ✅ `corner-radius.spec.ts` |
| 128 | Dragging the handle toward the center visibly rounds both the outer tips and the inner points                              |  ✅  | ✅ `corner-radius.spec.ts` |
| 129 | Dragging past the center and back doesn't misbehave (stays clamped, keeps tracking the pointer)                            |  ✅  | ✅ `corner-radius.spec.ts` |
| 130 | The dispatched radius clamps to `getMaxStarCornerRadius`                                                                   |  ✅  |             —              |
| 131 | The handle vanishes entirely once the shape's on-screen size drops below the visibility threshold                          |  ✅  |             —              |
| 133 | After a mirroring resize (flipX/flipY), the handle appears at its physically flipped position, not the local/unflipped one |  ✅  | ✅ `corner-radius.spec.ts` |

#130-#131 stay unit-only for the same reason as Polygon's #125-#126 above. #133 is the same
shipped-and-fixed bug as Polygon's #132 — see that entry for the root cause and fix.

## Vertex count (Polygon)

A single draggable handle, at the polygon's `sides`-dependent vertex index 1 (the vertex adjacent to
the fixed apex used by the corner-radius handle), that changes the polygon's own `sides` count.
Same visibility gate as corner radius (`shouldShowVertexCountHandle`, selected _and_ hovered, no
`cornerRadius`/`isDragging` params since there's nothing to fade in/out). Unlike corner radius's
distance-based projection, the drag itself (`getVertexCountFromLocalPoint.ts`) snaps to the nearest
of `[POLYGON_MIN_SIDES, POLYGON_MAX_SIDES]` by comparing the pointer's angle from the shape's center
against each candidate count's own target angle (`(2π/count) - π/2`) — the same "toward the fixed
apex increases, past the vertical axis resets to the minimum" feel as corner radius, but angle-based
rather than distance-based, matching how Figma's own tool behaves. Same arm/continue/disarm wiring
shape as corner radius (`armPolygonVertexCountDrag`/`continuePolygonVertexCountDrag`/
`disarmPolygonVertexCountDrag`), and the same forward-flip/un-flip pairing for
`getPolygonVertexCountHandlePosition`/`continuePolygonVertexCountDrag` that corner radius already
uses (see #132 above) — since it's the identical class of bug, mirrored here in unit tests but not
re-verified in e2e beyond the flip case below.

| #   | Scenario                                                                                                                   | Unit |            E2E            |
| --- | -------------------------------------------------------------------------------------------------------------------------- | :--: | :-----------------------: |
| 135 | The handle renders only once the triangle is both selected and hovered — selected alone shows nothing extra                |  ✅  | ✅ `vertex-count.spec.ts` |
| 136 | Dragging the handle straight up, toward the apex used by the corner-radius handle, increases `sides`                       |  ✅  | ✅ `vertex-count.spec.ts` |
| 137 | Dragging past the vertical axis through the center resets `sides` to `POLYGON_MIN_SIDES` (3)                               |  ✅  | ✅ `vertex-count.spec.ts` |
| 138 | The dispatched count snaps to the candidate whose own target angle is nearest the pointer's angle from the center          |  ✅  |             —             |
| 139 | The handle vanishes entirely once the shape's on-screen size drops below the visibility threshold                          |  ✅  |             —             |
| 140 | After a mirroring resize (flipX/flipY), the handle appears at its physically flipped position, not the local/unflipped one |  ✅  | ✅ `vertex-count.spec.ts` |

#138-#139 stay unit-only for the same reason as corner radius's analogous rows above — exact
`store.getState()`/direct-function-call assertions, not real-browser-timing paths.

## Vertex count (Star)

Same single-handle mechanism as Polygon, but the target handle is `points`-dependent vertex index 2
(the next spike's outer tip — vertex index 1 is the concave inner vertex between spikes, which would
be the wrong reference point) and the changed field is `points` instead of `sides`. The angle-based
snapping (`getVertexAngle`/`getVertexCountFromLocalPoint`) doesn't depend on the star's `ratio` at
all — only the outer-vertex geometry matters — so `TStarVertexCountDragState` carries no `ratio`
field, unlike `TStarCornerRadiusDragState`.

| #   | Scenario                                                                                                                   | Unit |            E2E            |
| --- | -------------------------------------------------------------------------------------------------------------------------- | :--: | :-----------------------: |
| 141 | The handle renders only once the star is both selected and hovered — selected alone shows nothing extra                    |  ✅  | ✅ `vertex-count.spec.ts` |
| 142 | Dragging the handle straight up, toward the apex used by the corner-radius handle, increases `points`                      |  ✅  | ✅ `vertex-count.spec.ts` |
| 143 | Dragging past the vertical axis through the center resets `points` to `STAR_MIN_POINTS` (3)                                |  ✅  | ✅ `vertex-count.spec.ts` |
| 144 | The dispatched count snaps to the candidate whose own target angle is nearest the pointer's angle from the center          |  ✅  |             —             |
| 145 | The handle vanishes entirely once the shape's on-screen size drops below the visibility threshold                          |  ✅  |             —             |
| 146 | After a mirroring resize (flipX/flipY), the handle appears at its physically flipped position, not the local/unflipped one |  ✅  | ✅ `vertex-count.spec.ts` |

#144-#145 stay unit-only for the same reason as Polygon's #138-#139 above. Also worth noting: a
4-sided polygon's vertex-count handle (target angle 0°) lands exactly on the resize tool's own east
edge-midpoint handle, so both `handlePointerDown.ts` and `useHoverHighlight.ts` give the
vertex-count handles priority over resize at that coincident point (unit-covered in
`handlePointerDown.spec.ts`/`useHoverHighlight.spec.tsx`; not e2e — no visual difference exists to
screenshot between "resize armed" and "vertex-count armed" until a drag actually starts).

## Ellipse arc / ring (Sweep, Start, Ratio handles)

Three handles on a selected+hovered Ellipse. **Sweep** (`arcEndAngle`, on the perimeter) drags a cut
into the shape. **Start** (`arcStartAngle`, on the perimeter, distinguished from Sweep only by a dot
drawn inside it — Figma calls this the same "Start handle") rotates the whole cut, preserving its
sweep width; it existed as arm/continue/disarm files but was never wired into
`handlePointerDown`/`handlePointerMove`/`handlePointerUp`/`useHoverHighlight`, so dragging it did
nothing and no cursor ever showed — fixed in this pass. **Ratio** (`arcRatio`, rests at dead center
when 0) hollows the shape into a ring; when dragged past the shape's own angular boundary into the
cut-away gap, `arcRatioInverted` flips which of the two wedges is treated as filled (matches Figma:
"drag the Ratio handle into the gap to swap which segment is shown") — `getEffectiveArcAngles`
resolves this by feeding the already-resolved major arc's own `(majorStart, majorStart+majorSweep)`
back through `getEllipseArcMajorArc`, which is the one raw pair whose own resolution is exactly the
complementary arc. Once `arcRatio` reaches its max (1), the ring's inner and outer edges coincide and
the fill has zero area, so `drawEllipseArcRatioGuideArc` traces that collapsed boundary as a curve —
the same role `drawEllipseArcGuideLine`'s straight line plays for a fully cut-away (`majorSweep`
`=== 0`) shape, just curved instead of straight since here the radius is real, only the band's
thickness has collapsed. Sweep/Start's own rest position also shifts to the midpoint of the ring
band (not the outer tip) once `arcRatio > 0`, and their live drag is clamped to that same band
(inner rim to outer rim) instead of sliding from dead center.

| #   | Scenario                                                                                                                  | Unit |           E2E            |
| --- | ------------------------------------------------------------------------------------------------------------------------- | :--: | :----------------------: |
| 147 | Dragging the Sweep handle cuts a wedge out of the ellipse                                                                 |  —   | ✅ `ellipse-arc.spec.ts` |
| 148 | The Start handle shows the `radius` cursor once a cut exists, and dragging it rotates the whole cut                       |  —   | ✅ `ellipse-arc.spec.ts` |
| 149 | Dragging the Ratio handle hollows a ring out of the (even uncut) ellipse                                                  |  —   | ✅ `ellipse-arc.spec.ts` |
| 150 | Dragging the Ratio handle into the cut-away gap swaps which side is filled, versus the same drag distance into the fill   |  —   | ✅ `ellipse-arc.spec.ts` |
| 151 | The rotate handle is hidden for both extremes — a full circle (`majorSweep === 360`) and a fully cut-away shape (`=== 0`) |  —   |            —             |
| 152 | Sweep/Start rest at the ring band's midpoint once `arcRatio > 0`, instead of the outer tip                                |  —   |            —             |
| 153 | The Ratio guide arc appears only once `arcRatio` reaches 1 on a genuinely cut (not full-circle) shape                     |  —   |            —             |

Unit coverage for this whole section is a known gap as of this pass (tracked separately, not part of
this change) — all four e2e specs above were written and run against the real implementation, so
they're live regression guards regardless. #151-#153 are precise single-formula/single-branch
checks (`getEllipseArcRotateHandlePosition`'s radius formula, the guide-arc trigger condition) better
suited to a future unit test than a screenshot diff, once that unit coverage lands.

## Ratio (Star)

A third Star handle, alongside corner radius (vertex index 0) and vertex count (vertex index 2):
**Ratio** sits on vertex index 1 — the concave inner vertex between the tip and the next spike,
physically between the other two handles on the outline — and drags `ratio` (the inner/outer radius
fraction) between `STAR_MIN_RATIO` (0.001) and `STAR_MAX_RATIO` (1). Its rest position reuses the
same shared `getVertexCountHandlePositionFromVertices` bisector-plus-corner-radius-setback helper the
vertex-count handle uses (just at handle index 1 instead of 2), so it stays pinned to the true vertex
even once a corner radius rounds it — the same "stick to the point" fix `getStarVertexCountHandlePosition`
needed after a stored `cornerRadius` valid for one `points` count went unclamped for another. Unlike
vertex count's angle-snapping, the drag itself is a continuous scalar: `getRatioFromLocalPoint`
projects the pointer onto the fixed axis from center to vertex index 1's own ratio-1 anchor point (an
axis whose direction depends only on `points`, never on the ratio being dragged), then clamps.

| #   | Scenario                                                                                                | Unit |            E2E            |
| --- | ------------------------------------------------------------------------------------------------------- | :--: | :-----------------------: |
| 154 | Dragging the Ratio handle toward its own fixed anchor rounds out the points, changing the shape         |  ✅  | ✅ `vertex-count.spec.ts` |
| 155 | The dispatched ratio is clamped to `[STAR_MIN_RATIO, STAR_MAX_RATIO]` once the pointer over/undershoots |  ✅  |             —             |
| 156 | The handle vanishes entirely once the shape's on-screen size drops below the visibility threshold       |  ✅  |             —             |

#155-#156 stay unit-only for the same reason as the vertex-count handle's analogous rows above —
exact `store.getState()`/direct-function-call assertions, not real-browser-timing paths.

## Pen tool and vector editing

Pen (`ToolName.pen`, shortcut `p`) and its Pencil variant (`ToolName.pencil`, `shift+p`, lives only
in Pen's dropdown — same shared-button/last-used-variant mechanic as Frame/Section above, backed by
its own `lastPenTool` store field) draw a `NodeType.vector` node: a graph of `vertices` connected by
`segments`, each segment optionally carrying a `tangentStart`/`tangentEnd` handle that curves it. A
plain click places a straight-segment vertex; a click-drag places one with an outgoing tangent handle,
curving the segment just placed. Clicking back onto the path's own start vertex closes the loop
(the closing segment can itself be curved, if the vertex just before it was dragged). `Escape` is
staged, one step per press: (1) stop extending — clears the "active" vertex so the rubber-band
preview line disappears, but stays on Pen and stays in vector edit mode; (2) revert the active tool
to Move, still in edit mode; (3) exit vector edit mode entirely. Switching tools mid-draw without
pressing Escape first (e.g. clicking Move directly) leaves the in-progress vertex "stale" — switching
back to Pen resumes extending from it, while an explicit Escape first starts a disconnected fragment
instead. A finished (or abandoned) fragment and a later one clicked elsewhere both extend the _same_
vector node's `segments`/`vertices` map rather than creating a new node, as long as vector edit mode
was never exited in between.

Double-clicking an already-placed vector node (Move tool, nothing else selected) re-enters vector
edit mode for it, rendering per-vertex dots and per-segment tangent handles
(`drawVectorEditHandlesLayer/`). Dragging a vertex dot moves that vertex; dragging a tangent handle
curves its segment. A vertex's `vertexHandleModes` entry (`corner`/`smooth`/`symmetric`,
`getMirroredVectorSegments.ts`) controls whether dragging one of its two handles also moves the
other: `symmetric` mirrors using the dragged handle's own new length, `smooth` mirrors using the
other handle's existing length, `corner` never mirrors. Clicking on an edge (not a vertex) inserts a
new vertex there, splitting the segment in two. A miss-click (empty space) while editing only clears
the active _vertex_ selection, staying in edit mode — `armVectorEditMissOnPointerDown.ts` deliberately
does not fall through to the marquee resolver's `setSelection([])`, since that would exit edit mode on
every stray miss; exiting by click is reserved for a deliberate **double**-click on empty space
(`useVectorEditOnDoubleClick.ts`), which only clears `vectorEditingNodeId` — the node's own
`selectedIds` entry is untouched, so it stays selected (ordinary resize/rotate handles), just no
longer in edit mode. `handleSetSelection.ts` also clears `vectorEditingNodeId` any time the selection
changes to something other than solely the node being edited (e.g. selecting a different node), so
there is no quirk where a previous node's edit handles linger on screen after that.

Two gotchas the specs below work around, worth knowing before adding more:

- **Undo/redo shortcuts must use `Control+z`/`Control+Shift+z`, never `ControlOrMeta+z`.** This
  project picks its primary modifier key (`⌘` vs `Ctrl`) at runtime from
  `react-device-detect`'s `isMacOs`, which reads `navigator.userAgent` — and Playwright's built-in
  `devices['Desktop Chrome']` preset always reports a Windows-flavored UA regardless of the host OS,
  so the app always resolves to `Ctrl` in this suite even when it's actually running on a Mac.
  Playwright's `'ControlOrMeta'` alias, by contrast, resolves from the real host OS and sends `⌘` on
  a Mac runner — which the app never listens for here, so the shortcut silently does nothing. This
  matches the plain `'Control'` already used in `selection.spec.ts`.
- **A vector node's whole stroke renders in a brighter "actively editing this vertex" tint once any
  vertex/handle has been grabbed, and that tint is driven by a ref (not undoable store state), so it
  outlives an undo that reverts the vertex's actual position.** A full-canvas (or even whole-shape)
  screenshot comparison back to an untouched "before" capture will spuriously differ for this reason
  alone. Isolate the geometric claim instead: clip to a small region containing only the specific
  point/vertex under test, ideally one with no segment passing through it at all (see
  `dragVectorPoint`'s neighboring-vertex and undo tests below for the pattern), or compare two
  post-interaction captures to each other rather than to a pristine baseline.

| #   | Scenario                                                                                                               | Unit |           E2E            |
| --- | ---------------------------------------------------------------------------------------------------------------------- | :--: | :----------------------: |
| 157 | Clicking places vertices and extends an open path with straight segments on every click                                |  ✅  |     ✅ `pen.spec.ts`     |
| 158 | Click-dragging while placing a vertex curves the new segment via a tangent handle                                      |  ✅  |     ✅ `pen.spec.ts`     |
| 159 | A drag shorter than `MIN_DRAG_DISTANCE_PX` is still treated as a plain (straight) click                                |  ✅  |     ✅ `pen.spec.ts`     |
| 160 | The pen preview (rubber-band) line follows the pointer, and a snap indicator appears near the start vertex             |  ✅  |     ✅ `pen.spec.ts`     |
| 161 | Clicking back onto the start vertex closes the loop with a straight closing segment                                    |  ✅  |     ✅ `pen.spec.ts`     |
| 162 | Dragging the vertex just before closing stages a curve that also bends the closing segment                             |  ✅  |     ✅ `pen.spec.ts`     |
| 163 | A closed loop renders a different, connected outline than the same vertices left open                                  |  ✅  |     ✅ `pen.spec.ts`     |
| 164 | Escape steps through: stop extending → revert tool to Move → exit vector edit mode, one stage per press                |  ✅  |     ✅ `pen.spec.ts`     |
| 165 | Switching tools mid-draw without Escape leaves the in-progress node directly editable via the Move tool                |  ✅  |     ✅ `pen.spec.ts`     |
| 166 | Switching back to Pen after leaving mid-draw (no Escape) resumes extending from the stale active vertex                |  ✅  |     ✅ `pen.spec.ts`     |
| 167 | After finishing one fragment, clicking elsewhere still extends the same vector node's segments, not a new node         |  ✅  |     ✅ `pen.spec.ts`     |
| 168 | Pen sits between Rectangle and Text in the toolbar                                                                     |  —   |     ✅ `pen.spec.ts`     |
| 169 | Pencil lives only in the Pen dropdown (no top-level icon), and the shared button remembers it as last-used             |  ✅  |     ✅ `pen.spec.ts`     |
| 170 | Pen and Pencil apply distinct cursor classNames while active                                                           |  —   |     ✅ `pen.spec.ts`     |
| 171 | The Pencil tool does not draw anything on the canvas yet (placeholder variant)                                         |  ✅  |     ✅ `pen.spec.ts`     |
| 172 | The Pen tool stays active after finishing a network, unlike shape tools which revert to the default tool               |  ✅  |     ✅ `pen.spec.ts`     |
| 173 | Undo steps back through vertex placements one click at a time, redo-equivalent independent references land pixel-equal |  ✅  |     ✅ `pen.spec.ts`     |
| 174 | Double-clicking a vector node enters edit mode; double-clicking empty space exits it again, leaving selection intact   |  ✅  | ✅ `vector-edit.spec.ts` |
| 175 | Dragging a vertex dot moves that vertex                                                                                |  ✅  | ✅ `vector-edit.spec.ts` |
| 176 | Dragging an existing tangent handle curves the adjacent segment                                                        |  ✅  | ✅ `vector-edit.spec.ts` |
| 177 | Dragging one handle at a `smooth` vertex also moves its other handle, curving both segments                            |  ✅  | ✅ `vector-edit.spec.ts` |
| 178 | Clicking an edge in edit mode inserts a new vertex there, splitting the segment                                        |  ✅  | ✅ `vector-edit.spec.ts` |
| 179 | Clicking empty space in edit mode deselects the active vertex but keeps edit mode open (single click, not double)      |  ✅  | ✅ `vector-edit.spec.ts` |
| 180 | Selecting a different node while still editing one cleanly exits edit mode for the original — no lingering handles     |  ✅  | ✅ `vector-edit.spec.ts` |
| 181 | A selected (not editing) vector node still resizes via the ordinary 8-direction handles                                |  ✅  | ✅ `vector-edit.spec.ts` |
| 182 | A selected (not editing) vector node still rotates via the ordinary rotate ring                                        |  ✅  | ✅ `vector-edit.spec.ts` |
| 183 | Undo after dragging a vertex restores its previous position                                                            |  ✅  | ✅ `vector-edit.spec.ts` |

## Why so few scenarios get e2e coverage

Most of the branches above are two-line Redux-state assertions in the unit suite — an e2e
equivalent would need a screenshot diff standing in for `expect(selectedIds).toEqual(...)`, which
is slower and less precise (a screenshot proves _something_ changed, not _what_). E2E here is
reserved for the paths where the interesting part is the real browser + canvas + timing
interaction itself (paint timing, `pointerdown`/`pointerup` ordering) rather than the selection
algorithm's branch logic, which the unit suite already pins down exhaustively.
