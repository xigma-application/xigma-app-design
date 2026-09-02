# Alt-hover distance measurement — and its Alt+arrow-nudge live-update extension

The "hold Alt, hover another shape, see the gap distance" measurement (`resolveDistanceGuides.ts`,
under `useHoverHighlight/utils/`) is driven entirely by `pointermove` — it recomputes on every real
mouse-move event where `event.buttons === 0` (see `useHoverHighlight.ts`), plus a synthesized
pointermove on Alt/Ctrl/Meta keydown/keyup (`handleModifierKeyChange.ts`) so it also appears/disappears
immediately on modifier press without requiring the mouse to move.

`isEligible` (in `resolveDistanceGuides.ts`) requires: `default` tool, `event.altKey`, at least one
selected node, a hovered node, and that hovered node **not** be part of the current selection. When
eligible it writes `{ getActiveRect(selectedNodes), getRotatedNodeBounds(hoveredNode) }` through
`getDistanceGuides()` into `refs.transform.distanceGuidesRef`; `drawDistanceGuides.ts` (`drawScene.ts`)
draws unconditionally whenever that ref is non-null.

## Keeping the measurement live while nudging with arrow keys (Alt held)

Since the whole mechanism is pointermove-driven, it goes stale the moment you start using the
keyboard instead — the cursor never moves during an arrow-key nudge, so the pointermove path never
re-fires and the label keeps showing the pre-nudge gap. `updateNudgeDistanceGuide.ts` (under
`useKeyboardShortcuts/utils/`) closes that gap: `handleNudgeSelection.ts` calls it right after the
nudge's `updateNode` dispatches commit, re-running the *same* eligibility+compute logic against
whatever is still hovered (`refs.hover.hoverRef.current` — untouched by a keyboard-only interaction)
and the selection's just-nudged position. It only ever **sets** the ref when eligible; when Alt isn't
held (or nothing eligible is hovered) it deliberately leaves the ref alone rather than clearing it —
clearing on every ineligible nudge would fight the hover path's own clear-on-real-pointermove.

### The gotcha that made this non-trivial: `triggerActions.ts`'s exact modifier-count match

`useKeyboardHandler`'s `triggerActions.ts` requires `getPressedKeys(event) === primaryKeys.length` —
the *total* number of held modifiers (alt/ctrl/meta/shift) must exactly equal what the shortcut
declares, not just "at least these". `nudgeLeft` etc. declare no `primaryKeys` (`[]`), so holding Alt
as an "extra", unrelated modifier while pressing a plain arrow key means `getPressedKeys` returns 1
against a required 0 — **the plain nudge shortcut silently does not fire at all while Alt is held**,
independent of anything this feature does. Same story for `nudgeLeftLarge` (`primaryKeys: ['shift']`)
when Alt is added on top.

Fixed by adding explicit `nudge*Alt` (`primaryKeys: ['alt']`) and `nudge*AltLarge`
(`primaryKeys: ['alt', 'shift']`) shortcuts in `shortcuts.ts`/`types.ts`, wired into `nudgeMap.ts`
with the **same step** (`NUDGE_STEP` / `NUDGE_STEP_LARGE`) as their non-Alt counterparts — Alt is not
a step modifier here, it exists purely so the shortcut still matches while Alt is held for the live
measurement. `createNudgeKeyMap.ts` passes `event.altKey` through to `handleNudgeSelection`, which
defaults it to `false` for every other call site (arrow keys pressed without Alt, or any other caller
that doesn't care about this feature).

## What was tried and reverted first

An earlier version implemented this via **mouse-drag** instead (`continueDrag.ts`/`armDrag.ts`
capturing the hover target as a frozen `TDragState.distanceMeasureTargetRect` at drag-start). It hit a
real ordering problem: starting a drag means pressing down *on the shape being dragged*, which means
moving the cursor there first — and hovering your own selection (while Alt is held, with no external
target) is exactly the case `resolveDistanceGuides.ts` already treats as "clear the measurement".  A
`resolveDistanceGuides.ts` fix (preserve rather than clear when Alt-hovering the current selection
after a real measurement had shown) fixed that ordering problem, but wasn't what was actually
wanted — the user's own gesture is keyboard-nudge, not mouse-drag. Fully reverted (`getDraggedGroupBounds.ts`,
`getMatchedPairDragGuides.ts`-adjacent files, the `resolveDistanceGuides.ts` self-hover-preserve
change, and the `TDragState.distanceMeasureTargetRect` field) in favour of the nudge-based approach
above, which sidesteps the whole problem: the cursor never has to move.

## Tests

- Unit: `useKeyboardShortcuts/utils/test/updateNudgeDistanceGuide.spec.ts`,
  `handleNudgeSelection.spec.ts`, `nudgeMap.spec.ts` (16 key-map entries: plain/Alt/Shift/Alt+Shift ×
  4 directions).
- e2e: `e2e/design/selection/distance-guide.spec.ts` — "Alt+arrow-key nudging keeps the distance
  measurement live...".
