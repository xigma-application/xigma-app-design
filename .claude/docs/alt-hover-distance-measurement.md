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

## Vector Edit Mode extension: nudging selected vertices/tangent handles, and keeping *that*
## measurement live too

Arrow keys previously did nothing in Vector Edit Mode at all — `handleNudgeSelection.ts` early-
returned whenever `vectorEditingNodeIds.length > 0`, regardless of what was selected. Points
(vertices) and tangent handles now nudge, mirroring the whole-node feature above one level down:

- `handleNudgeSelection.ts` now branches first on `vectorEditingNodeIds.length > 0` and delegates to
  `handleNudgeVectorEdit.ts` (`useKeyboardShortcuts/utils/`) instead of running the regular-node path.
- `handleNudgeVectorEdit.ts` reads `refs.vectorEdit.selectedVectorVertexIdsRef` /
  `selectedVectorHandlesRef` (never `selectedIds` — vector-edit selection lives entirely in these
  refs, not Redux) and picks one of two paths, vertices taking priority (mirrors the same precedence
  `handleDeleteSelection.ts` uses):
  - **Vertices**: grouped by owning node via `getOwningVertexNodes` (already existed, for
    delete/copy), each node's selected vertices translated by `translateVectorVertices` (the same
    util `continueVectorVertexDrag.ts` uses for a mouse drag) and dispatched as one `updateNode` per
    owning node — so a multi-node vertex selection nudges in a single history step, same pattern as
    the multi-node vertex delete.
  - **Handles (tangents)**: for each selected `{ end, segmentId }`, the owning node is found via
    `findVectorEditingNodeForSegment`, the tangent is offset by the raw delta (tangents are stored as
    an absolute `{x,y}` offset from their vertex, already in world units — the same field
    `continueVectorHandleDrag.ts` computes when dragging by mouse, so no vertex-relative math is
    needed), and run through the existing `getMirroredVectorSegments` so a `smooth`/`symmetric`
    vertex's opposite handle mirrors automatically, exactly like a mouse drag. A handle with a `null`
    tangent (not actually placed) is silently skipped.
  - **Segments are deliberately out of scope** — explicit user call: "Segment nie sa przesuwalne
    klawiszami to odpada" (segments aren't keyboard-movable, drop it). Only vertex/handle selection is
    read; a segment-only selection nudges nothing.
- `updateNudgeVectorDistanceGuide.ts` is the Vector-Edit-Mode sibling of `updateNudgeDistanceGuide.ts`
  above — called from `handleNudgeVectorEdit.ts` after the dispatch commits. Rather than
  reimplementing eligibility/anchor/target math, it reuses the exact resolver pieces
  `resolveVectorDistanceGuides.ts` (`useSelectionTool/utils/handlePointerMove/resolveVectorDistanceGuides/`)
  is built from — `getBakedEditingNodes`, `getAnchor`, `getAnchorReferencePoint`, `getTarget` — plus
  the shared `getVectorDistanceGuides` util, imported directly rather than duplicated (there's
  precedent for a `useKeyboardShortcuts` util reaching into `useSelectionTool/utils/` this way, see
  `handleFlipSelection.ts`). Eligibility: `altKey`, Vector Edit Mode active, and the active **sub**-
  tool is `ToolName.move` (Vector Edit Mode's own Move/Lasso/Paint/Bend/Cut toolbar — see
  `vector-network.md` §41 — not the outer canvas tool) — matching `resolveVectorDistanceGuides.ts`'s
  own check exactly.
  - **One deliberate gap vs. the mouse-driven resolver**: a keyboard nudge never moves the cursor, so
    there is no live cursor point to project a hovered *segment* or *face* target onto (that's what
    `getTarget`'s cursor-point projection is for). Only a hovered **vertex** target
    (`hover.hoveredVectorVertexIdRef`) is re-measured after a nudge; a hovered segment/face target is
    passed through as absent (`null`) rather than guessed at, so the last real measurement just stays
    on screen unchanged until the mouse actually moves again. This mirrors the same restraint
    `updateNudgeDistanceGuide.ts` already takes with plain nodes (node-hover only, no nearest-point-
    on-edge).
- Tests: `useKeyboardShortcuts/utils/test/handleNudgeVectorEdit.spec.ts`,
  `updateNudgeVectorDistanceGuide.spec.ts`.

### Bug caught right after shipping: the multi-select box went stale on a 2+ vertex nudge

Nudging two or more selected vertices moved them correctly but left the multi-select bounding box
(`getVectorMultiSelectBox.ts`, drawn by `drawVectorMultiSelectStaticBox.ts`) frozen at its pre-nudge
position — it visually "ran away" from the actual selection. Root cause: that box is cached in
`refs.vectorMultiSelect.vectorMultiSelectBoxRef`, keyed only on *which* ids are selected
(`getVectorMultiSelectSelectionKey`), not their positions — a mouse drag keeps it in sync by
translating the cached bounds live every pointermove (`continueVectorMultiDrag.ts` mutates
`vectorMultiSelectBoxRef.current` directly), but a keyboard nudge has no such in-progress drag state
and never touched this ref at all, so the stale cached box just sat there. Fixed by nulling
`vectorMultiSelectBoxRef.current` at the end of `handleNudgeVectorEdit.ts` (both the vertex and the
handle path) — the discrete, already-committed nature of a keyboard nudge means there's no live
delta to apply like the mouse-drag path does; forcing a fresh `getVectorMultiSelectBox` recompute on
the next render is simpler and correct. Verified live (not just unit-tested) — a Playwright e2e
compares the box after a real 2-vertex nudge against a reference shape drawn already-shifted to the
same end position, pixel-identical; the test was confirmed to actually fail without the fix before
being kept. See `e2e/design/vector/vector-edit-nudge.spec.ts`.
