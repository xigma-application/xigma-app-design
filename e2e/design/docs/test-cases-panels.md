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
