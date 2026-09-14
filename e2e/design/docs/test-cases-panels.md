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

| #   | Scenario                                                                                                       | Unit |                    E2E                    |
| --- | ---------------------------------------------------------------------------------------------------------------- | :--: | :----------------------------------------: |
| 385 | Adding a fill stacks a second solid layer on top and changes the render                                           |  ✅  |         ✅ `fill-section.spec.ts`         |
| 386 | Deleting every fill leaves the shape with none and clears the render                                              |  ✅  |         ✅ `fill-section.spec.ts`         |
| 387 | Typing a hex value commits it onto the fill and changes the render                                                |  ✅  |         ✅ `fill-section.spec.ts`         |
| 388 | Hiding a fill via the eye toggle stops it from rendering without removing it                                      |  ✅  |         ✅ `fill-section.spec.ts`         |
| 389 | Dragging a fill row past another reorders the stack, showing a drop indicator and a selected handle mid-drag      |  —   |         ✅ `fill-section.spec.ts`         |
| 390 | Clicking a fill row selects it, and clicking outside the fill list clears the selection                           |  ✅  |         ✅ `fill-section.spec.ts`         |
| 391 | Closes the format dropdown when clicking a plain area of the fill color picker                                    |  —   |         ✅ `fill-section.spec.ts`         |
| 392 | Docks a gradient stop's own color panel flush against the gradient panel, not floating over its own swatch        |  —   |         ✅ `fill-section.spec.ts`         |
| 393 | Rotating a shape's gradient fill (panel button) updates its stored start/end and the rendered canvas              |  ✅  |         ✅ `fill-section.spec.ts`         |
| 394 | Switching a solid fill to Gradient via the paint-type row actually converts and commits it, not just previews it  |  ✅  |         ✅ `fill-section.spec.ts`         |
| 395 | A gradient stop clamps to its own color past its own position, instead of falling back to the first stop's color  |  —   |         ✅ `fill-section.spec.ts`         |
| 396 | Dragging a gradient stop (in the docked panel's bar) past another stop doesn't disturb the crossed stop           |  ✅  |         ✅ `fill-section.spec.ts`         |
| 397 | Dragging a gradient stop directly on the canvas overlay moves it along the guide                                  |  ✅  |         ✅ `fill-section.spec.ts`         |
| 398 | The fill picker stays open after dragging a canvas gradient stop, even if the cursor strays off it before release |  —   |         ✅ `fill-section.spec.ts`         |
| 399 | Clicking the gradient guide line on the canvas adds a new stop there, at the interpolated color, and selects it   |  ✅  |         ✅ `fill-section.spec.ts`         |
| 400 | Clicking on/near an existing stop does not add a new one — stops take priority over the line                     |  ✅  |         ✅ `fill-section.spec.ts`         |
| 401 | Dragging a gradient endpoint on the canvas rotates the whole line around the shape's center                       |  ✅  |         ✅ `fill-section.spec.ts`         |
| 402 | Clicking (not dragging) right on a gradient endpoint doesn't add a stop there — rotating takes priority           |  ✅  |         ✅ `fill-section.spec.ts`         |

#393-#402 are all real, reported regressions.

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
