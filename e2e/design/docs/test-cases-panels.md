# Panels — test case catalog

Test cases for the Layers panel and canvas name-label editing that live in `e2e/design/panels/`.

## Frame name label

Every `NodeType.frame` node renders its `name` as a small always-on WebGL text label just above its
top-left corner (`drawFrameNameLabels`), colored `FRAME_NAME_LABEL_SELECTED_FILL` when selected or
`FRAME_NAME_LABEL_FILL` otherwise. Double-clicking the label (default/move tool) swaps it for a real
`CanvasNameLabelInput` (`FrameNameLabelEditOverlay`); committing dispatches the same `updateNode`
action the Layers panel's own rename input uses, so the two stay in sync in both directions — the
one thing genuinely worth an e2e test here, since it's an integration between the WebGL canvas and
the DOM Layers tree that unit tests only exercise one side of at a time (`useFrameNameLabelEditor`
mocks the hit-test util; `TreeItem`'s rename spec never touches the canvas).

| #   | Scenario                                                                                                                                                           | Unit |                         E2E                         |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--: | :-------------------------------------------------: |
| 1   | Renaming a frame via its canvas label updates the Layers panel row                                                                                                 |  ✅  |            ✅ `frame-name-label.spec.ts`            |
| 2   | Renaming a frame from the Layers panel updates its canvas label                                                                                                    |  —   |            ✅ `frame-name-label.spec.ts`            |
| 3   | Pressing Escape while editing the canvas label leaves the name unchanged                                                                                           |  ✅  |            ✅ `frame-name-label.spec.ts`            |
| 4   | Ctrl+Z after a canvas-label rename reverts the name (shared `updateNode` history)                                                                                  |  —   |            ✅ `frame-name-label.spec.ts`            |
| 5   | New frames are auto-numbered "Frame 1", "Frame 2", ... off existing frames on the page                                                                             |  ✅  | — (covered precisely by `getNextFrameName.spec.ts`) |
| 6   | The would-be name label is already visible above the frame while it is still being dragged out (`drawDraftFrameNameLabel`), not just after the pointer is released |  ✅  |            ✅ `frame-name-label.spec.ts`            |
| 7   | Clicking a frame's canvas label selects it, landing on pixel-identical output to clicking its body (`getNodeAtPoint`/`isPointInNodeNameLabel`)                     |  ✅  |            ✅ `frame-name-label.spec.ts`            |
| 8   | Hovering a frame's canvas label shows the same hover highlight as hovering its body                                                                                |  ✅  |            ✅ `frame-name-label.spec.ts`            |

## Section name label

Sections get the same floating name label as frames — same auto-numbering
(`getNextSectionName`), same double-click-to-rename via `CanvasNameLabelInput`
(`SectionNameLabelEditOverlay`), same click/hover hit-area (`isPointInNodeNameLabel`) — but
rendered as a filled, rounded badge (`drawSectionNameLabel`, `SECTION_NAME_LABEL_FILL`) instead of
plain text, matching the selection size label's visual language rather than the frame label's. The
badge's colors never change with selection (unlike the frame label's grey/blue text swap), since a
section can't be rotated and its edit input therefore never needs the frame label's angle-tracking
logic either.

| #   | Scenario                                                                                                                                               | Unit |                          E2E                          |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | :--: | :---------------------------------------------------: |
| 1   | Renaming a section via its canvas label updates the Layers panel row                                                                                   |  ✅  |            ✅ `section-name-label.spec.ts`            |
| 2   | Renaming a section from the Layers panel updates its canvas label                                                                                      |  —   |            ✅ `section-name-label.spec.ts`            |
| 3   | Pressing Escape while editing the canvas label leaves the name unchanged                                                                               |  ✅  |            ✅ `section-name-label.spec.ts`            |
| 4   | Ctrl+Z after a canvas-label rename reverts the name (shared `updateNode` history)                                                                      |  —   |            ✅ `section-name-label.spec.ts`            |
| 5   | New sections are auto-numbered "Section 1", "Section 2", ... off existing sections on the page                                                         |  ✅  | — (covered precisely by `getNextSectionName.spec.ts`) |
| 6   | The would-be name badge is already visible above the section while it is still being dragged out (`drawDraftSectionNameLabel`), not just after release |  ✅  |            ✅ `section-name-label.spec.ts`            |
| 7   | Clicking a section's canvas label selects it, landing on pixel-identical output to clicking its body                                                   |  ✅  |            ✅ `section-name-label.spec.ts`            |
| 8   | Hovering a section's canvas label shows the same hover highlight as hovering its body                                                                  |  ✅  |            ✅ `section-name-label.spec.ts`            |

## Rectangle properties panel

Selecting a single rectangle routes `PanelProperties.tsx` to `Rectangle/`, which reuses the shared
`Common/PanelHeader`, `Common/PositionSection` and `Common/ColumnDimensions` (the same sections the
Frame panel uses — their hooks gate on `isBoxSceneNode`, not `type === frame`). The header is the
label plus the "Create component" button only, no element-type dropdown; the Layout section holds
the width/height row plus, when the selection sits inside a grid frame, a Column span / Row span
row (`Common/ColumnGridChildSpan`, display-only for now), none of the auto-layout rows.

| #   | Scenario                                                                                              | Unit |                                                    E2E                                                    |
| --- | ----------------------------------------------------------------------------------------------------- | :--: | :-------------------------------------------------------------------------------------------------------: |
| 1   | Selecting a rectangle shows the Rectangle panel with a Dimensions row and no auto-layout rows         |  ✅  |                                       ✅ `rectangle-panel.spec.ts`                                        |
| 2   | Editing the width field in the Rectangle panel resizes the shape on the canvas                        |  —   |                                       ✅ `rectangle-panel.spec.ts`                                        |
| 3   | The Column span / Row span row shows only while the selection is a child of a `LayoutMode.grid` frame |  ✅  | — (pure conditional render, no canvas interaction; `useColumnGridChildSpan.spec.tsx` covers every branch) |

## Layers panel — lock/visibility

The Layers panel (`LeftPanel/File/Layers`) lists the active page's nodes in root order (flat, no
nesting yet) with a per-row lock and eye (visibility) toggle. Both are real document state
(`locked?`/`hidden?` on the node), joined to the undo/redo history the same way `updateNode` is.

| #   | Scenario                                                                                                                                                                            | Unit |            E2E            |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: | :-----------------------: |
| 332 | Locking a node from the panel keeps it rendered but excludes it from canvas click hit-testing and marquee-select                                                                    |  ✅  | ✅ `layers-panel.spec.ts` |
| 333 | Hiding a node from the panel removes it from rendering and from canvas click hit-testing/marquee-select entirely                                                                    |  ✅  | ✅ `layers-panel.spec.ts` |
| 334 | Selecting a node from the panel works regardless of its locked/hidden state (panel selection isn't gated)                                                                           |  ✅  |             —             |
| 335 | Toggling a node's locked or hidden state is its own undo step, independent of any other change                                                                                      |  ✅  |             —             |
| 342 | Right-clicking a row that isn't currently selected replaces the selection with it, so the context menu that opens acts on the right-clicked node instead of a stale prior selection |  ✅  | ✅ `layers-panel.spec.ts` |
| 343 | Right-clicking a row already part of a multi-selection leaves the whole selection intact, so bulk actions (Copy, Bring to front, ...) keep applying to every selected node          |  ✅  | ✅ `layers-panel.spec.ts` |
| 344 | Double-clicking a row's icon selects that node and zooms the canvas to fit it (reuses the View menu's own Zoom to selection)                                                        |  ✅  | ✅ `layers-panel.spec.ts` |

Scenarios 334-335 are plain synchronous dispatch-and-assert-on-`store.getState()` checks with no
real timing/rendering stakes, so they're unit-only per the section below. 332-333 get e2e coverage
because the interesting part is genuinely the browser round-trip: a real DOM click on the panel
button changing what a _separate_ real canvas click can hit-test, which a synthetic jsdom
`PointerEvent` can't exercise end-to-end the way the actual `getNodeAtPoint`/`getCollidedNodes`
filters are wired into the live render+hit-test pipeline.

#342/#343 are a real, reported regression: `TreeItem.tsx` opened its context menu straight off
`onContextMenu` (`useTreeItemContextMenu.ts`) without ever touching selection, so right-clicking a
row that wasn't already selected opened a menu whose actions (`useNodeMenuActions.ts` — Copy, Group
selection, Bring to front, Send to back, Move to page) all operate on the Redux _selection_, not on
the row's own node — they silently acted on whatever was selected elsewhere instead. Fixed by
having `useTreeItemContextMenu` select the right-clicked id first, unless it's already part of the
current selection (mirroring the standard convention: right-clicking a member of a multi-selection
must not collapse it down to just that one row, or bulk actions would break). The unit suite
(`useTreeItemContextMenu.spec.tsx`) asserts `store.getState().design.selectedIds` directly for both
branches; the e2e versions prove the actual observable symptom via each row's own `aria-selected`
DOM state and the real menu that opens, the same "real browser + rendering" category as #90/#341
above. `move-to-page.spec.ts`'s own scenario no longer needs a throwaway left-click before the
right-click for exactly this reason.

#344: `useZoomToTreeItem.ts` (`shared/UI/Tree/TreeItem/hooks/`) wires `onDoubleClick` on the row's
icon `span` — a separate DOM node from the name text's own `editOnDoubleClick` (rename), so there's
no conflict. It dispatches `setSelection([id])` then calls the same `handleZoomToSelection` the View
menu/Shift+2 shortcut already use (a plain reducer dispatch is synchronous, so the zoom sees the
just-set selection). This makes `TreeItem` an unconditional `useCanvasRefsContext()` consumer, so
every test mounting a real `TreeItem` needs a `CanvasRefsProvider` ancestor now.

## Layers panel — drag-drop (reorder / nest)

The generic `shared/UI/Tree` drag machinery (`useTreeRowDrag/`) powers row drag-and-drop for both
the Layers panel and the Pages list. A drop either nests the dragged row inside the row it landed on
(`handleDropInside`) or reorders it among siblings at the drop's resolved depth (`handleReorderDrop`
→ `resolveTreeDrop.ts`).

| #   | Scenario                                                                                                                                                                           | Unit |              E2E              |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: | :---------------------------: |
| 345 | Dropping a layer onto the middle of a collapsed group nests it as the first child                                                                                                  |  —   | ✅ `layers-drag-drop.spec.ts` |
| 346 | Dropping a layer onto the middle of an already-expanded group also nests it as the first child                                                                                     |  —   | ✅ `layers-drag-drop.spec.ts` |
| 347 | Holding a drag over a collapsed group auto-expands it after the spring-load delay, and releasing right there still drops into the group                                            |  —   | ✅ `layers-drag-drop.spec.ts` |
| 348 | Dragging a row onto a sibling reorders it using the target parent's own row order — forward (matching `childIds`) for an auto-layout frame, reversed (z-order) for everything else |  ✅  | ✅ `layers-drag-drop.spec.ts` |
| 349 | Dragging a Frame row into an existing Mask group, even dropped last, must not let the Frame become the active mask — it's pushed off the last slot instead                         |  ✅  | ✅ `layers-drag-drop.spec.ts` |

#348 is a real, reported regression, found right after `useTreeSource.ts` was fixed to list an
auto-layout frame's children in forward order (matching the visual layout flow — see
`.claude/docs/auto-layout.md`) instead of the reversed/z-order convention every other container
uses. That read-side fix alone broke the _write_ side: `resolveTreeDrop.ts`'s
`targetIndex = totalSiblingCount - uiOrderIndex` mirroring assumed the UI list was _always_ reversed
relative to `childIds`, so dragging a row to reorder it within an auto-layout frame silently computed
the wrong `childIds` index — often the row's own original slot, making the drag a no-op ("przerzucam
w tree 2 na 1 i nic się nie zmienia"). Fixed by threading an optional
`isForwardOrderParent?: (parentItem) => boolean` predicate through
`Tree` → `useTreeRowDrag` → `handleMouseUp` → `resolveTreeDrop`, which skips the mirroring for a
target parent that satisfies it (`LayersTree.tsx` passes `isAutoLayoutFrame`); every other consumer
(Pages list) passes nothing and keeps the original reversed behavior unchanged. The unit suite
(`resolveTreeDrop.spec.ts`) asserts the raw index math for both the forward and the still-mirrored
case; the e2e version drags a _real_ row in a _real_ auto-layout frame and asserts the resulting
Layers-panel order, since the whole point of the bug was that the write path only breaks once real
DOM row positions and the real `useTreeSource` read order interact — a synthetic `resolveTreeDrop`
call with hand-built rows can't by itself prove the two sides ever call it with matching
expectations.

## Fill section

`Common/FillSection/` (`FillRow/`) lists a node's `fills: TPaint[]` and edits each through
`UITools.ColorPickerInput` — the same input for solid and gradient paints, only its swatch/hex
adornment differs (`hexDisplayValue` shows the gradient type name, e.g. "Linear", instead of a raw
hex). Opening a gradient paint's picker also arms `design.gradientEditor` (a transient, non-history
Redux slice), which drives a Figma-style on-canvas overlay (`drawGradientHandleLayer`): the
start→end guide line, endpoint dots, and one swatch handle per stop, each independently draggable
directly on the canvas (not just via the docked panel's own `GradientBar`).

| #   | Scenario                                                                                                          | Unit |                             E2E                              |
| --- | ----------------------------------------------------------------------------------------------------------------- | :--: | :----------------------------------------------------------: |
| 385 | Adding a fill stacks a second solid layer on top and changes the render                                           |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 386 | Deleting every fill leaves the shape with none and clears the render                                              |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 387 | Typing a hex value commits it onto the fill and changes the render                                                |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 388 | Hiding a fill via the eye toggle stops it from rendering without removing it                                      |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 389 | Dragging a fill row past another reorders the stack, showing a drop indicator and a selected handle mid-drag      |  —   |                  ✅ `fill-section.spec.ts`                   |
| 390 | Clicking a fill row selects it, and clicking outside the fill list clears the selection                           |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 391 | Closes the format dropdown when clicking a plain area of the fill color picker                                    |  —   |                  ✅ `fill-section.spec.ts`                   |
| 392 | Docks a gradient stop's own color panel flush against the gradient panel, not floating over its own swatch        |  —   |                  ✅ `fill-section.spec.ts`                   |
| 393 | Rotating a shape's gradient fill (panel button) updates its stored start/end and the rendered canvas              |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 394 | Switching a solid fill to Gradient via the paint-type row actually converts and commits it, not just previews it  |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 395 | A gradient stop clamps to its own color past its own position, instead of falling back to the first stop's color  |  —   |                  ✅ `fill-section.spec.ts`                   |
| 396 | Dragging a gradient stop (in the docked panel's bar) past another stop doesn't disturb the crossed stop           |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 397 | Dragging a gradient stop directly on the canvas overlay moves it along the guide                                  |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 398 | The fill picker stays open after dragging a canvas gradient stop, even if the cursor strays off it before release |  —   |                  ✅ `fill-section.spec.ts`                   |
| 399 | Clicking the gradient guide line on the canvas adds a new stop there, at the interpolated color, and selects it   |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 400 | Clicking on/near an existing stop does not add a new one — stops take priority over the line                      |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 401 | Dragging a gradient endpoint on the canvas rotates the whole line around the shape's center                       |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 402 | Clicking (not dragging) right on a gradient endpoint doesn't add a stop there — rotating takes priority           |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 403 | Rotating a gradient whose endpoints don't touch the shape edge pivots around the line's own center, not the box   |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 404 | Rotating a gradient snaps to exactly horizontal/vertical when the angle is close to it, with a guide              |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 405 | Grabbing right on a gradient endpoint moves it freely, leaving the other endpoint untouched                       |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 406 | Dragging a gradient endpoint freely snaps onto a shape corner (edge/center landmarks)                             |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 407 | Both endpoints on the same single wall (not two distinct ones) also pivots around the line, not the box           |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 408 | A gentle rotation of a box-attached, off-center gradient (e.g. corner-to-corner along one edge) doesn't jump      |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 409 | Dragging a gradient endpoint past the shape's edge lets it travel outside the shape, unclamped, like Figma        |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 410 | Moving a radial gradient's center point on the canvas moves only that point (start/end handles reused)            |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 411 | Dragging a radial gradient's perpendicular radius handle reshapes it into an ellipse                              |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 412 | Switching a gradient's type via the panel resets its points to that type's own default (e.g. radial: centered)    |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 413 | Dragging the outer ring around a radial gradient's center rotates the whole ellipse around it, fixed radius       |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 414 | Dragging the outer ring around a radial gradient's edge point also rotates around the center, not the edge        |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 415 | Dragging a radial gradient's radius handle shows a temporary orange guide from the center, only while dragging    |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 416 | Switching a gradient's type to Angular resets its points to a centered default, same as radial                    |  —   |                  ✅ `fill-section.spec.ts`                   |
| 417 | Dragging an angular gradient's perpendicular radius handle reshapes its ellipse, same as radial's                 |  —   |                  ✅ `fill-section.spec.ts`                   |
| 418 | Dragging an angular gradient stop moves it by angle around the ellipse, not by linear position along the line     |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 419 | Clicking the ellipse guide on an angular gradient adds a new stop there and selects it                            |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 420 | Opening the picker on an existing angular gradient shows Angular in the type dropdown, not Linear                 |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 421 | Switching a gradient's type to Diamond resets its points to a centered default, same as radial/angular            |  —   |                  ✅ `fill-section.spec.ts`                   |
| 422 | A diamond gradient actually renders as a diamond shape instead of an almost-solid flat fill                       |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 423 | Dragging a diamond gradient's perpendicular radius handle reshapes it, exactly like radial's                      |  —   |                  ✅ `fill-section.spec.ts`                   |
| 424 | Dragging the outer ring around a diamond gradient's center rotates the whole shape, exactly like radial's         |  —   |                  ✅ `fill-section.spec.ts`                   |
| 425 | Switching a gradient fill to Solid resets the gradient panel, so switching back to Gradient starts fresh          |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 426 | Undoing a gradient edit updates the open panel's own controls (type dropdown included), not just the render       |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 427 | Dragging on the saturation map / a gradient stop coalesces into a single undo step, not one per pixel             |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 428 | Rotating a gradient on the canvas, then dragging a stop in the popover, keeps the canvas rotation                 |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 429 | Moving a gradient stop on the canvas updates its position live in the open popover                                |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 430 | Switching a solid fill to Pattern commits a real pattern paint and shows the Pattern panel                        |  —   |                  ✅ `fill-section.spec.ts`                   |
| 431 | A pattern fill with no source renders a placeholder dot grid instead of nothing                                   |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 432 | Editing the Pattern panel's tile type and scale commits them onto the pattern paint                               |  —   |                  ✅ `fill-section.spec.ts`                   |
| 433 | Switching away from Pattern and back resets the panel instead of resurfacing the old values                       |  —   |                  ✅ `fill-section.spec.ts`                   |
| 434 | The Direction row only shows for the Hexagonal tile type                                                          |  —   |                  ✅ `fill-section.spec.ts`                   |
| 435 | Picking a shape as the pattern source on canvas writes its id onto the paint and disarms picking                  |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 436 | A picked pattern source renders live and repeats as tiles, not a single stretched copy                            |  —   |                  ✅ `fill-section.spec.ts`                   |
| 437 | Deleting a pattern's source freezes the consumer's last appearance instead of reverting to the placeholder        |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 438 | Increasing pattern spacing opens a visible transparent gap between tiles instead of leaving them flush            |  —   |                  ✅ `fill-section.spec.ts`                   |
| 439 | Changing pattern alignment shifts which part of the tile grid sits flush with the shape                           |  —   |                  ✅ `fill-section.spec.ts`                   |
| 440 | Editing a Pattern panel setting after picking a source preserves the live sourceNodeId instead of dropping it     |  ✅  | ✅ `fill-section.spec.ts` (spacing test also exercises this) |
| 441 | Hexagonal tiling with Horizontal direction offsets alternate rows, creating a brick pattern                       |  —   |                  ✅ `fill-section.spec.ts`                   |
| 442 | Hexagonal tiling with Vertical direction offsets alternate columns, creating a brick pattern                      |  —   |                  ✅ `fill-section.spec.ts`                   |
| 443 | Picking a node that itself has a pattern fill as a source is refused, preventing A<-B<-C chains                   |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 444 | A numeric pattern offset (X/Y, in px) nudges the tile grid independently of the alignment point                   |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 445 | Shrinking a pattern source's text content does not leave a black shadow of the removed glyphs                     |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 446 | Hovering an eligible node while picking a pattern source shows a live highlight, like the default tool            |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 447 | Hovering a node that already has a pattern fill while picking a source shows no highlight                         |  ✅  |                  ✅ `fill-section.spec.ts`                   |
| 448 | Uploading an image commits a real image paint and renders it, filling the shape without distorting proportions   |  —   |                  ✅ `fill-section.spec.ts`                   |
| 449 | The fill's alpha field changes the rendered image's opacity, not just the paint's stored value                    |  —   |                  ✅ `fill-section.spec.ts`                   |

#393-#409 are all real, reported regressions. #410-#420 are new feature coverage (radial and angular
gradient on-canvas editing), not bug fixes, but every one of #412-#415 was raised by the user as
same-day follow-up feedback right after #410-#411 landed, rather than requested up front — #412
(switching types left stale, nonsensical positions behind) and #413-#415 (the rotate ring and radius
guide the first radial pass didn't include) are closer to fast-follow fixes than a fresh feature
request. #416-#418 (angular) came later still, as a separate request specifically to extend the
already-shipped radial handles onto the angular gradient type, and #419-#420 are same-day follow-up
fixes on top of #416-#418 in exactly the #412-#415 mold — gaps the angular pass itself left behind,
caught by the user comparing directly against the on-canvas result.

#395: the gradient fragment shader's `sampleGradient` seeded its "outside every stop's range"
fallback color to `u_stopColors[0]` unconditionally, so a stop dragged short of the far end (e.g.
white at 0%, black moved to 50%) rendered white from 50%-100% instead of clamping to black — the
seed needed to pick `u_stopColors[0]` or `u_stopColors[count-1]` depending on which side of the
range `t` fell on. GLSL isn't unit-testable here, so this is e2e-only, sampling a pixel past the
last stop.

#396: `useGradientBarDrag`'s thumbs are re-sorted by position on every drag update, which physically
reorders their DOM nodes once a drag crosses another stop — and reordering the element currently
holding native `setPointerCapture` silently releases it, so the very next `pointermove` lands on
whichever thumb is now on top and briefly drags _that_ one instead ("kiedy zderzam się z innym
stopem to na chwilę go zabiera"). Fixed by tracking the drag via a ref plus `window`-level
`pointermove`/`pointerup` listeners instead of per-thumb capture, immune to any DOM reordering.

#397-#398 are the canvas-side counterpart: gradient stops became draggable directly on the on-canvas
overlay (previously render-only), reusing the same hit-test/arm/continue/disarm pattern as every
other canvas handle (`getGradientStopHandleAtPoint`, `armGradientStopDrag`,
`continueGradientStopDrag`), with the dragged stop re-identified by its own color+opacity fingerprint
each frame (not by array index, which shifts under it exactly like #396) since the shader still
needs `paint.stops` kept position-sorted for correct interpolation. #398 is a second regression this
introduced: Radix's `Popover` defers its "was this click outside the content" check to the native
`click` event that fires _after_ `pointerup`, so clearing the drag ref synchronously on pointerup
made that deferred check see "no drag in progress" and dismiss the fill picker — fixed by deferring
the ref clear one macrotask (`setTimeout(0)`) past pointerup, and by narrowing the picker's
`onInteractOutside` guard to only ignore clicks that actually hit a gradient handle (not every
canvas click, which would wrongly keep the picker open when clicking the shape itself elsewhere).

#399: hovering the guide line itself (not an existing stop) now shows an "add stop here" preview —
the same real stop-handle visual, offset above the line exactly like a real stop, colored via the
actual interpolated gradient color at that position (not the nearest stop's raw color, so adding a
stop never visibly changes the gradient) — and clicking inserts + selects it. #400 confirms existing
stops keep priority over the line at the same spot (the line's own hit-test explicitly bails when the
stop hit-test already matched, same defensive double-encoding as the resolver-array ordering).
Adding a stop from the canvas only touched Redux, so the docked panel's own stop list/`GradientBar`
didn't reflect it — fixed by `useSyncExternalStopChanges`, reconciling the panel's local
`TEditableGradientStop[]` against Redux's plain `TGradientStop[]` by position+color+opacity so
existing stops keep their React key (`id`) and only the genuinely new one gets a fresh one; #399's
own assertion on the panel's stop-marker count covers this reconciliation too.

#401-#402: the line's own start/end endpoints became draggable to rotate the gradient continuously
(separate from the panel's discrete 90°-at-a-time rotate button, #393). Dragging either endpoint
rotates the whole line as a rigid body around the shape's bounds center — both endpoints are
recomputed every frame as the two opposite intersections of a line through the center with the
bounding box edge, so they visibly slide around the shape's perimeter. #402 is the same
priority-guard pattern as #400, one hit-test zone further out: the rotate hit-test also bails the
line's own hit-test near the endpoints, so clicking exactly on an endpoint rotates instead of
inserting a spurious stop there.

#403: that box-center pivot only applies when both endpoints already touch the shape's bounding-box
edge at drag-start. A gradient the user positioned freely inside the shape (not spanning it) instead
pivots around the _line's own midpoint_, at its own frozen half-length radius — checked once when the
drag starts and never re-evaluated mid-gesture (an explicit user call: re-checking every frame would
make the pivot jump under the cursor). #404: either mode also snaps the line to exactly horizontal or
vertical when the angle comes within 3° of one, showing a smart guide — reusing the app's existing
alignment-guide ref/draw pipeline (built for snapping a dragged shape to a sibling's edge) rather than
adding new drawing code, since it was already wired unconditionally into the render loop.

#405-#406: grabbing right on an endpoint (a tight ~6px zone, tighter than the rotate ring around it)
moves that one point freely instead of rotating — added after it turned out the rotate-only version
left no way to just reposition a point at all. It affects only the dragged endpoint (unlike rotate,
which always moves both). #406: while moving, each axis independently snaps to 0/0.5/1 (the shape's
edges and center), reusing the same alignment-guide pipeline as #404 — but this one can show both a
horizontal and a vertical guide at once, e.g. when landing exactly on a corner.

#407: "box" mode's distinct-walls requirement was made explicit after the user pointed out that two
endpoints sharing only the _same_ single wall (both on the top edge, say) must not be treated the same
as a true corner-to-corner span — refined via `getTouchedRectEdges.ts`, which returns every wall a
point touches (a corner touches two) so "distinct" can be checked properly instead of just "each
touches _some_ wall."

#408 is the deeper regression underneath #401/#403/#407: "box" mode measured both endpoints' angles
from the box's own geometric center unconditionally, which is only correct when the line already
straddles that center symmetrically (any true diagonal always does, by construction — which is why
#401 never caught this). The user's own repro didn't: a corner-to-corner line along one entire edge
(both ends on the bottom wall, touching distinct left/right walls too, so still legitimately "box"
mode) sits nowhere near the vertical center. The very first rotate frame forced it through the center
anyway, snapping the untouched endpoint far from where it started ("wygląda jak reset pozycji żeby
trzymały się środka"). Fixed by freezing an _angle offset_ at arm-time (the real gap between the
non-dragged endpoint's starting angle and what naive antipodal symmetry would predict) and adding it
back every frame — a true diagonal's offset works out to 0 (no behavior change), while an off-center
line keeps its own shape continuously as it rotates. An earlier fix attempt (casting a ray from the
line's own frozen midpoint to the box edge, instead of from the box center) was mathematically sound
in general but degenerated to a zero-length collapse whenever that frozen midpoint itself sat exactly
on a wall — exactly this case — since the antipodal ray then points back into the very wall it's
already on. Reverted in favor of the always-safely-interior box-center-plus-offset approach.

#409: the free-move interaction (#405) originally clamped the dragged endpoint to the shape's own
0..1 bounds ("tylko w obrębie elementu"). The user later asked for that clamp to be removed —
Figma lets a gradient endpoint travel outside the shape entirely. Nothing downstream assumed the
0..1 range (the world-point lerp, the hit-test, and the per-axis landmark snap all already worked
for any value), so the fix was simply deleting the clamp in `continueGradientEndpointMoveDrag.ts`.

#410-#411: radial gradients (`gradient-radial`, previously render-only with no on-canvas editing at
all) got the same start/end/stop handles as linear for free, by widening every hit-test/drag guard
from a literal `paint.type === 'gradient-linear'` check to a shared `isLineHandleGradientPaint`
predicate — #410 confirms moving the center point (`start`) behaves exactly like linear's endpoint
move (only that point changes; an explicit product decision, not a translate-the-whole-gradient
model). #411 covers the one genuinely new piece: a second, always-perpendicular "radius" handle
(`radiusRatio` field, new) that reshapes the circle into an ellipse — locked to the perpendicular
axis by construction, so it can only scale, never skew or rotate. This also uncovered (and fixed) a
pre-existing modeling issue: the radial shader treated the _midpoint_ of start/end as the visual
center, when `start` should be the center (matching Figma) — fixed alongside, see
`.claude/docs/properties-panel.md` for the full technical writeup. The radius handle also lost its
connecting line after #410-#411 shipped — the user pointed out it read as a second gradient axis,
not a scale control, so it now renders as a lone point instead.

#412: switching a gradient's type via the panel's dropdown (`useSetGradientType`) used to keep
whatever `start`/`end` the _previous_ type had, verbatim. Combined with #410-#411's fix (radial's
`start` is now the true center, not the midpoint of start/end), this meant switching an arbitrary
linear gradient to radial put the new "center" wherever the old line's start point happened to be —
often nowhere near the shape's middle. Fixed by giving type-switching its own small per-type default
table: radial resets to a centered point with the radius reaching the bottom edge; every other type
resets to the existing default horizontal line (which keeps diamond centered, since its own center
is still the midpoint of start/end — angular later moved onto the radial-style centered default too,
see #416-#418). Test drives the actual dropdown UI (not just a Redux dispatch) to catch regressions
in the real click path.

#413-#414: the first radial pass left rotation to `end`'s free-move alone (it already sets angle and
magnitude at once), on the theory that a dedicated fixed-radius rotate ring wasn't needed the way
linear's box/line modes needed one. The user asked for it back: a genuine rotate, reachable from
_either_ the center's ring or the edge point's ring, both pivoting at the center and holding the
radius constant. Implemented as a third `TGradientRotateMode` ('radial') on the existing rotate
dispatcher rather than a parallel hit-test/arm/continue stack — `getGradientRotateHandleAtPoint`'s
dual-ring check was already shared via `isLineHandleGradientPaint`, so it needed no radial-specific
branch at all once widened. #413 confirms grabbing the center's ring; #414 confirms grabbing the
edge point's ring produces the _same_ rotation (still pivoting at the center, never at the edge
point itself) — arming is endpoint-agnostic on purpose, since the center never moves in this mode
regardless of which ring was grabbed.

#415: while the radius handle (#411) is being dragged, a temporary guide line + crosshairs now
connects it back to the center, in the same orange used by ordinary alignment/snap guides elsewhere
in the app — cleared the instant the drag ends. An earlier version tried asserting an exact RGB
sample at the guide's midpoint, which turned out fragile against the radial's own busy, continuously
blended fill color underneath; the test instead samples the _same_ pixel once mid-drag and once
right after release at the same cursor position (so the underlying fill is provably identical in
both frames) and asserts the two differ — isolating the guide's presence as the only variable,
without needing to know its exact rendered color.

#416-#418: angular gradients (`gradient-angular`, previously render-only, same as radial before
#410) got the exact same center/edge/radius-ratio handles as radial for free, by widening every
`paint.type === 'gradient-radial'` guard that gated them (the radius handle draw/arm/continue/
hit-test, and the rotate dispatcher's `'radial'`-mode branch) to a shared `isEllipseHandleGradientPaint`
predicate — #416-#417 confirm the type-switch default and the radius handle behave identically to
radial's own #412/#411. #418 covers the one thing that couldn't just be reused: an angular stop's
`position` is an angle around the ellipse (matching the fragment shader's own `atan2`-based
interpolation), not a linear fraction of the start->end segment the way every other gradient type's
stops work — dragging a stop off the line entirely (onto the perpendicular radius-handle point, in
the test) had to land at the angle that point sits at (0.25 of a full turn) rather than clamping to
0 or 1 the way a line-projection formula would. This also meant the "click the line to add a stop"
feature (#399) deliberately does _not_ apply to angular: every point on the start->end segment maps
to the same angle, so there is no meaningful position to derive from a click offset along it. Fixing
this properly also required correcting the fragment shader's angular branch, which had been deriving
its center from the _midpoint_ of start/end (a leftover from angular's old symmetric-default model)
instead of `start` itself, the same pre-existing modeling gap #410-#411 had already fixed for radial
— see `.claude/docs/properties-panel.md` for the full technical writeup, including why the shader
change also had to start honoring `radiusRatio` for angular to keep the rendered fill consistent with
what the on-canvas ellipse handle now shows.

Also worth recording even without its own numbered e2e scenario: fixing #415 alongside a stop-marker
bug the user found — `getGradientStopHandlePositions` offset every stop by a fixed "up" vector,
which only kept the marker off the line for a near-horizontal gradient; a vertical line (radial's own
default) kept the offset marker sitting exactly on top of the guide instead of beside it. Generalized
to a real perpendicular-to-the-line offset, plus rotating the marker's own square (`drawRect` already
took a rotation angle, previously always `0`) so one edge sits parallel to the line rather than
staying axis-aligned. Covered by unit tests (`getGradientPerpendicularOffsetDirection.spec.ts`,
updated `getGradientStopHandlePositions`/`drawGradientStopPointer`/`drawSingleGradientStopHandle`
specs) rather than a new e2e scenario — the change has no Redux-observable effect (a stop's own
`position` field never changes), only a rendering one, so exact-geometry unit coverage is the more
precise and less fragile way to pin it down than sampling canvas pixels.

Also worth recording without a numbered e2e scenario: after #416-#418 shipped, the user pointed out
that the ellipse itself was never actually drawn as a curve on the canvas — radial (and now angular)
only ever rendered the straight start->end line plus the point handles, missing the oval outline
Figma's own reference UI shows connecting them. Fixed with a new `drawGradientEllipseGuide`, always
called from `drawGradientHandleLayer` (it no-ops itself for linear via `isEllipseHandleGradientPaint`).
Covered entirely by unit tests (`drawGradientEllipseGuide.spec.ts`, plus the renamed
`getGradientEllipsePoint`/`getGradientEllipseNormalizedPoint` specs) for the same reason as the
stop-marker offset fix above — purely a rendering change with no Redux-observable effect, so
exact-geometry assertions on the drawn line segments are more precise than a canvas pixel sample.

One more follow-up once the ellipse guide (above) made the curve visible: an angular stop marker's
own position (`getGradientAngularStopHandlePositions`) placed the marker's _center_ exactly on the
ellipse, unlike linear/radial's stops which are nudged `STOP_HANDLE_OFFSET_PX` (18px) off their line
so the marker sits _beside_ the guide with its little pointer notch touching it. With no such
offset, an angular marker straddled the curve with its notch pointing inward past it instead of
touching it from outside — the user caught this by comparing the on-canvas notch against the curve
directly. Fixed by reusing the exact same `STOP_HANDLE_OFFSET_PX` constant, applied in the outward-
from-center direction (`getGradientRadialOutwardDirection`) instead of perpendicular-to-the-line,
threading the world center point and zoom through to `getGradientAngularStopHandlePositions` (both
were already available at every call site via `getGradientStopPositions`, just previously unused for
the angular branch). Covered by updated unit tests on that function plus `getGradientStopPositions`/
`drawGradientHandleLayer`/`getGradientStopHandleAtPoint` specs (exact offset math) and the e2e
`fill-section.spec.ts` angular stop-drag test (updated grab point) — no new numbered scenario, same
reasoning as the two fixes above it.

#419: with the ellipse guide now visible (the fix above), the user tried clicking directly on it to
add a stop, the same way clicking the straight line already works for linear/radial (#399) — nothing
happened, since `getGradientLinePositionAtPoint` explicitly excludes angular (a deliberate scope cut
made when angular's stop-by-angle model first shipped: every point on the straight line maps to the
same angle, so a line-click position is meaningless for it). Fixed with a new
`getGradientEllipsePositionAtPoint.ts`, the ellipse-curve counterpart of the line hit-test (same
priority-guard chain — stop/endpoint-move/rotate/radius handles all still win over it — but computes
`position` via `getPositionAroundGradientEllipse` and checks distance against the actual curve point,
`getGradientEllipsePoint`, rather than a projected line point), and a new
`getGradientAddStopPositionAtPoint.ts` wrapper that dispatches to it for angular paints and falls
back to the existing line hit-test otherwise — replacing `getGradientLinePositionAtPoint` at its
three call sites (`armAddGradientStopOnPointerDown`, `resolveGradientLineHover`,
`resolveGradientLineHandleHover`) so the add-stop cursor, hover ref, and click handler all agree on
which guide applies. `drawGradientAddStopHoverPreview` also needed the angular branch: its ghost
preview marker now samples the ellipse (`getGradientEllipsePoint`) instead of the line, and reuses
the same outward-offset direction as the real stop markers.

#420: opening the color picker on a shape whose fill was already `gradient-angular` showed "Linear"
in the type dropdown regardless — `useGradientPanel`'s `type` state (what the dropdown's `value` prop
reads) was hardcoded to always initialize from `DEFAULT_GRADIENT_TYPE`, both on first mount and on
every reopen (`useResetGradientPanelOnReopen`), never from the paint actually being edited. This
affected every non-linear type equally (radial included), just surfaced here specifically while
testing angular. Root cause: `TInitialGradient` (what `FillRow` builds from the real paint and passes
down as `initialGradient`) never carried a `type` field at all — only `start`/`end`/`stops`. Fixed by
adding `type` to `TInitialGradient`, populating it in `FillRow.tsx` from `paint.type`, and seeding
`useGradientPanel`'s `type` state from `initialGradient?.type` (falling back to the default only when
there's no seed, e.g. a brand-new gradient) in both places it was previously hardcoded.

Also worth recording without its own numbered scenario: right after #419-#420, the user flagged that
an angular stop marker's own rotation looked "tilted too much" at some positions around the ellipse.
The marker's rotation (and its outward offset direction) had been computed as the vector from the
ellipse's center to the stop — correct only at the 4 axis vertices of a true ellipse; everywhere else,
"away from center" and the curve's own tangent/normal diverge for anything other than a perfect circle
(a non-1 `radiusRatio`, or simply a non-square node, both turn the normalized-space circle into a
genuine world-space ellipse). Fixed with a new `getGradientEllipseNormalDirection.ts`, computing the
true normal from the curve's derivative (tangent) at that position instead of approximating it from
the center, with the correct outward-facing sign disambiguated against the old radial approximation —
it reduces to the exact same vector at the axis vertices and on a perfect circle (proven by a unit
test looping every position for a square node), so no existing screenshot/geometry changes, only the
previously-wrong in-between angles. Replaced `getGradientRadialOutwardDirection` at all three call
sites that compute an angular stop's own orientation (`getGradientStopDirections`,
`getGradientAngularStopHandlePositions`, `drawGradientAddStopHoverPreview`) — covered entirely by unit
tests (exact-geometry assertions, including one that deliberately proves the new function _diverges_
from the old one for a stretched ellipse) rather than a new e2e scenario, same rendering-only
reasoning as the fixes above.

#421-#422: the diamond gradient type had never actually worked — a shape with a diamond fill
rendered as almost solid flat color, unrelated to and predating the angular work above. Root cause
in the shader (`vectorGradientFillFragmentShaderSource.ts`): diamond's branch computed
`halfSize = abs(u_end - center)` where `center = (u_start + u_end) * 0.5`, which only produces a
sensible (nonzero on both axes) `halfSize` if `u_start`/`u_end` are two _opposite corners_ of the
diamond's bounding box. But diamond's default points were still the linear "two opposite edge
points on the same horizontal line" (`start: (0, 0.5)`, `end: (1, 0.5)`) — under that model `center`
lands at `(0.5, 0.5)` and `halfSize` comes out `(0.5, 0)`, a zero y-extent; dividing by that
(clamped to `0.0001`) blew `t` up to a huge value everywhere except a thin horizontal band, so
`sampleGradient` clamped almost the entire fill to the last stop's color. Fixed the same way angular
was: diamond's branch now pivots at `u_start` like radial/angular, projecting onto the primary axis
and its `radiusRatio`-scaled perpendicular exactly like radial's branch, but sums the two components
with `abs(a) + abs(b)` (L1 distance) instead of `length(vec2(a, b))` (L2) — that's the only
difference between an ellipse and a diamond in this shared basis. `getDefaultGradientPoints` and the
`radiusRatio` uniform gate both widened to include `'gradient-diamond'` alongside radial/angular, so
switching to Diamond now seeds a proper centered default too. At the time of this fix, diamond still
had no on-canvas handles — `isLineHandleGradientPaint`/`isEllipseHandleGradientPaint` deliberately
still excluded it.

#423-#424: the user confirmed diamond should get the exact same on-canvas handle rules as radial. This
turned out to need no new geometry at all: diamond's `stop.position` is already a plain linear lerp
along the line (same as radial — only angular diverges into angle-based positions), so every
position/direction helper already fell into the shared non-angular branch. The fix was purely widening
`isLineHandleGradientPaint` and `isEllipseHandleGradientPaint` to include `'gradient-diamond'`, which
transitively wired up the whole handle overlay, the radiusRatio/aspect handle and its drag, and the
`'radial'` fixed-pivot rotate mode. Deliberately not widened: the ellipse-guide-curve drawer keeps its
own narrower check, since a diamond's real boundary is a rhombus, not an ellipse, and drawing a curved
guide over it would be misleading — no diamond-shaped guide exists yet. A pre-existing bug surfaced
during this work, unrelated to diamond: `useConvertSolidToGradientPaint` (which every panel change,
including a plain stop-color edit, funnels through) only preserved `radiusRatio` for
`type === 'gradient-radial'`, so editing a stop's color on an _angular_ gradient with a custom
`radiusRatio` silently reset it to 1 on the next keystroke — fixed by widening that check too.

#425-#427: three separate bugs reported together, all in the same root cause — `useGradientPanel`'s
local state is a working copy seeded once from the paint, with no general mechanism to notice the
paint changed underneath it. #425: switching to Solid left the old gradient's stops/type/points
sitting in local state, so switching back to Gradient in the same popover session resurfaced the old
paint instead of a fresh default — fixed by resetting that local state directly in the Solid-tab
click handler (`useSetActiveTab.ts`), not with another watch-effect. #426: undo/redo changes the
paint in Redux exactly the same way a real edit does (`replaceDesignSnapshot` vs. `updateNode`), so
the open panel had no way to tell "my own edit echoing back" apart from "the ground truth changed
externally" — fixed with a new `design.historyRevision` counter, bumped only by
`replaceDesignSnapshot`, that the panel now also resyncs on (alongside the existing reopen-triggered
reset), so undo/redo now updates every part of the open panel, the type dropdown included, which
previously stayed frozen on its pre-undo value. #427: dragging on a stop's saturation map or the
gradient bar pushed one history entry per pixel, because the existing begin/end-gesture coalescing
already used everywhere else (canvas drags, the Solid panel) simply never reached the Gradient tab —
`Body.tsx` only forwarded `onDragStart`/`onDragEnd` to `SolidPanel`. Threading them into
`GradientPanel`/`GradientBar`/`StopsList`/`StopRow`/`StopColorPanel` fixed it for the whole tab in one
pass, including the docked stop-color editor's own saturation map. One e2e gotcha from writing #426:
`Control+z` sent while focus is still on the type dropdown's own trigger button does nothing — that
component swallows the keydown — so the test clicks the inert "Stops" label first to move focus off
it before invoking the shortcut.

#428-#429: the very next report after #425-#427, and really the flip side of the same coin. The
`historyRevision` mechanism from #426 only caught undo/redo (`replaceDesignSnapshot`); a canvas-driven
gradient drag dispatches the same `updateNode` action the panel's own edits use, so it wasn't
detected as "external" at all — rotating/moving the line on the canvas, then dragging a stop inside
the still-open popover, silently snapped the line back to its pre-rotation position (#428), and
dragging a stop's position on the canvas never showed up in the popover's own position field while it
stayed open (#429). Fixed with a general resync (`useSyncGradientPanelWithLivePaint.ts`) that
reconciles points/type/stops from the live paint on every render where they actually differ, gated by
a new `isDraggingRef` (`useTrackIsDragging.ts`, wrapping the popover's existing `onDragStart`/`onDragEnd`)
so the panel's own in-progress drag is never fought mid-gesture. This made `historyRevision` redundant
— undo/redo is just another "external change" the general mechanism now catches — so it was removed
again along with its prop-threading, rather than leaving two overlapping sync mechanisms in place.

#430-#435 are the Pattern paint type: a fourth `TPaint` variant alongside solid/gradient/image,
edited through the same `ColorPickerInput`/`PaintTypeRow` as the others. With no source picked yet it
renders as a plain dot-grid placeholder (`drawVectorPatternFill`) rather than nothing, so an empty
pattern is still visibly distinct from a missing fill. #435 wires the "Select source..." button
(`design.isPatternSourcePicking`, an arm/disarm flag) to an actual canvas click: a `TPatternSourcePickTarget`
(`{nodeId, paintIndex}`) is synced into Redux for as long as the Pattern panel stays open
(`useSyncPatternSourcePickTarget`, mirroring `useGradientEditor`'s own sync hook), so the next primary
click on the canvas while armed (`handlePatternSourcePick`, wired into `useSelectionTool`'s existing
pointer-down dispatch) writes the hit node's id onto `paint.sourceNodeId` and disarms — refusing only
the trivial self-reference case (picking the node's own fill as its own source) for now.

#436-#437 finish the loop: the picked source now actually renders, live, tiled onto the consumer
(`resolvePatternSourceTile`/`drawVectorPatternSourceTile`, `.claude/docs/canvas-rendering-pipeline.md`
has the shader/render-target details), and deleting that source no longer leaves a dangling
`sourceNodeId` — `freezePatternConsumersOfNode` (called from `handleDeleteNode` before the node is
actually removed) snapshots the source's own subtree onto `frozenSourceSnapshot` and clears
`sourceNodeId`, so the consumer keeps its last-known appearance forever rather than reverting to the
dot-grid placeholder. Cycle-safety beyond the trivial self-pick case is still open, though a depth
cap on the render side already prevents a multi-hop cycle from hanging the tab.

#438-#440 wire `spacingX`/`spacingY`/`alignmentIndex` into the actual render. Fixing #438/#439
surfaced a real bug (#440): `useConvertToPatternPaint` rebuilds the whole `TPatternPaint` from the
panel's own local state on every field edit, so it silently dropped `sourceNodeId`/
`frozenSourceSnapshot` the moment a user touched any setting after picking a source — caught while
writing #438's e2e test (reopening the panel and setting spacing turned the picked source's green
tile white, i.e. it had reverted to the sourceless placeholder). Fixed by carrying both fields
forward from the existing paint when it's already type `'pattern'`.

#441-#442 finish `tileType: 'hexagonal'`/`direction`, the last two Pattern panel fields that didn't
touch the render. This isn't literal hexagon-shaped tiles — like Figma's own Hex Horizontal/Vertical
pattern fill, it's a brick-style offset of alternating rows or columns by half a tile, still sampling
the same rectangular tile texture. Verified by picking a source, opening a spacing gap on one axis,
and asserting the same point that was inside the gap on one row/column lands inside a tile once the
neighboring row/column shifts by half a period.

#443 closes out the original pattern-fill design question's last open item: cycle prevention. The
decision (made explicitly, after going back and forth on "just detect real cycles" vs "block chains
entirely") is to disallow `sourceNodeId` chains outright rather than detect cycles in the dependency
graph — a node (or anything in its own subtree, for a Frame source) that already has any `'pattern'`
fill can never be picked as someone else's source. If C should look like A, C must pick A directly;
routing through B (which itself consumes A) is refused the same way self-picking already was.

#444 is the last field from the original design question's panel wishlist ("x y, file type, direction
i scale") that hadn't actually been built: a free-form numeric offset, distinct from the 3×3
`alignmentIndex` grid's 9 discrete positions. It composes with alignment rather than replacing it
(offset nudges on top of whichever alignment point is picked), and needed generalizing `PatternField`
to support a `px` suffix and negative values, since every prior field on this panel was a `%`-only,
0-1000-clamped percentage.

#445 is a real, user-reported bug, first spotted as a black shadow trailing a shape used as a
pattern source, then narrowed to a precise repro: type "Mama" into a text node, pattern a frame from
it, then shrink the content to "M" — the "ama" glyphs' footprint stayed behind, solid black. Root
cause: the render-target pool recycles physical textures, and both places that clear one before
drawing fresh content into it (`renderNodeListToPatternSourceTile.ts` for patterns, and the
unrelated blend-mode isolation path in `drawVectorFillGroup.ts`, fixed alongside since it's the
identical bug) enabled alpha writes _after_ `gl.clear()` instead of before — leaving a recycled
target's old alpha untouched by the clear, so old opaque pixels survived with their RGB zeroed to
black. See `.claude/docs/canvas-rendering-pipeline.md` for the full mechanism.

#446/#447 close a real, user-reported gap: while picking a pattern source, moving the cursor over the
canvas showed no feedback at all — nothing lit up under a pickable shape, unlike the default tool's
ordinary hover outline. `useHoverHighlight.ts` used to skip hover resolution entirely whenever
`isPatternSourcePicking` was armed; it now runs a dedicated resolver
(`resolvePatternSourcePickHover.ts`) that hit-tests the same way a click would and only highlights the
hit when it passes the same `doesNodeHavePatternInSubtree` eligibility check `handlePatternSourcePick.ts`
already enforces at click-time — so a node that would be refused as a source (#443) never lights up as
if it could be picked. #446 verifies the eligible case shows a highlight; #447 verifies an
already-pattern-holding node stays unhighlighted.

#448/#449 close a real coverage gap: the `image` paint type (a fifth `TPaint` variant, alongside
solid/gradient/pattern) shipped with full unit coverage for its pieces (`getOrLoadTexture`'s size
cache, `getImageFillCoverUv`'s cover-fit math, `drawVectorImageFill`'s stencil+composite draw calls,
`useConvertToImagePaint`'s commit shape) but no e2e test ever drove the real upload → paint → render
path end to end, unlike every other paint type on this page. #448 uploads a synthesized solid-color
PNG (`createSolidColorPngBuffer`, built at test time via `pngjs` rather than committing a binary
fixture) onto a non-square rectangle and asserts both the committed `fills[0]` shape
(`{type: 'image', scaleMode: 'fill'}`, `ref` a `blob:` URL) and the actual rendered pixels at two
opposite corners of the shape, proving the cover-fit crop fills the whole frame without letterboxing
or squashing. #449 reuses the same upload flow, then drags the fill row's alpha field to 50 and
asserts the sampled pixel's red channel drops accordingly — the same opacity fix described in
`.claude/docs/canvas-rendering-pipeline.md`'s image-fill section, verified here as a real rendered
effect instead of only a unit assertion on the shader-uniform call.
