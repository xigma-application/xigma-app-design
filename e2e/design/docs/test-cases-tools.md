# Tools — test case catalog

Test cases for standalone canvas tools (Comment, Hand, Zoom) that live in `e2e/design/tools/`.

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

## Zoom

The View menu's Zoom section (Zoom in/out, Zoom to 100%, Zoom to fit, Zoom to selection, percentage
presets, Zoom to previous/next frame) and its matching global keyboard shortcuts both dispatch
`setViewport` through shared `handleZoom*.ts` utils — see `design-store-architecture.md` §6. Zoom to
fit is "smart": it fits the current selection when one exists, otherwise it fits every top-level
node, and both fit-based paths account for the current left/right panel widths via
`getVisibleCanvasRect`.

| #   | Scenario                                                                                                                  | Unit |        E2E        |
| --- | ------------------------------------------------------------------------------------------------------------------------- | :--: | :---------------: |
| 1   | Ctrl/Cmd+= steps the zoom in, actually changing the rendered content                                                      |  ✅  | ✅ `zoom.spec.ts` |
| 2   | Zoom to fit (Shift+1) fits only the current selection when one exists, and fits every top-level node once it's cleared    |  ✅  | ✅ `zoom.spec.ts` |
| 3   | Zoom in/out/100%/fit/selection, the percentage presets, and previous/next frame all compute the correct target viewport   |  ✅  |         —         |
| 4   | The fit rect accounts for the current left/right panel widths, and each treats a hidden/minimized panel as zero width     |  ✅  |         —         |
| 5   | Zoom to fit/selection shows a `DesignHint` snackbar above the toolbar (plain text, no value) that self-dismisses after 3s |  ✅  | ✅ `zoom.spec.ts` |

Scenarios 3–4 are pure viewport-math claims (`getZoomToViewport`/`getFitViewport`/
`getVisibleCanvasRect`/`getAdjacentFrameBounds`, all in `Canvas/utils/`) already asserted precisely
in their own unit specs and in each `handleZoom*.spec.ts` — no browser-timing stakes beyond what
scenarios 1–2 already prove end to end (a real keyboard shortcut actually reaching `setViewport`
and repainting the canvas).

Scenario 5: `handleZoomToFit`/`handleZoomToSelection` dispatch a generic `designHintLabelKey`
(store/design) after computing the new viewport — a reusable "toast above the toolbar" mechanism,
not zoom-specific, meant for any future momentary hint. It's rendered by
`Toolbar/DesignHint/DesignHint.tsx`, which composes the generic `shared/UI/Snackbar` component; the
3-second auto-hide itself lives in `Snackbar`'s own `useSnackbarAutoHide` hook
(`autoHideAfterMs`/`onAutoHide` props), not duplicated per consumer — `Toolbar/MediaToolHint` stays
persistent (no `autoHideAfterMs`) since its dismissal is user-driven (a close button), unlike
`DesignHint`'s time-driven one. The auto-hide timing itself is covered precisely by
`useSnackbarAutoHide.spec.ts`/`Snackbar.spec.tsx`/`DesignHint.spec.tsx` via fake timers; the e2e test
only proves a real Zoom to fit keystroke reaches the hint end to end and that it's gone again after
its real duration elapses.
