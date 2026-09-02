# Smart guides — every variant, and exactly when each fires

Roadmap Stage 13's "smart guides ... with the distance shown". This file is the **single reference
for all of them** so a future change doesn't re-derive, misread the spec, or reintroduce a reverted
approach. Implementation detail lives in `selection-and-manipulation.md` §24-28a; this file is the
"which mechanism does what" map.

All of these are **active only during a plain move-drag of existing shape(s)** (via
`useSelectionTool`'s `continueDrag/continueDrag.ts`). None of them apply to: drawing a new shape,
resizing, rotating, hover, or selection. None of them change a shape's *size* — position only.

**Multi-shape drags are supported, and both families now match per-member — never a combined
selection box.** This was a real back-and-forth (see History below): an earlier version reduced the
whole dragged selection to one union bounding box (`getDraggedGroupBounds.ts`, since deleted) and
compared *that* box against candidates. It looked reasonable and had passing e2e coverage, but was
wrong — a box can sit near a candidate's established gap or size while none of its real members do
(the box's own edges don't have to coincide with anything actually visible), producing a guide that
visually made no sense relative to what was on screen. Both families now use
`getEligibleDraggedEntries` (filters out ineligible/rotated/hidden members and anything without a
plain `{x, y}` origin, e.g. a vector node mid-edit) and match **each eligible member's own
size/position individually** — the same per-node pattern `resolveShapeContactGuides.ts` already uses
for contact guides:

- **Family A (equal-spacing/chain-gap)** returns one delta (it corrects the drag position), and a
  multi-selection can only move by one shared delta — so `getChainGapDragSnap.ts` walks the eligible
  members in order and uses the **first one that matches** anything; that member's delta moves the
  whole selection, and only that member's guides are drawn. A member that itself doesn't match rides
  along with the group and is never compared against candidates on its own if an earlier member
  already matched.
- **Family B (matched-pair)** is display-only (no delta), so it has no such constraint —
  `getMatchedPairDragGuides.ts` matches **every** eligible member independently and merges
  `labels`/`lines`/`markers` from all of them that produced anything. A multi-select where only *one*
  member happens to match a candidate still shows that member's guide; other, non-matching members
  riding along in the same selection never suppress it.

Dragging a single shape is just the one-entry case of either path — behaviour is unchanged there. If
zero members are eligible, both families no-op (zero delta, no guides), same as before.

Colour for every one of them is the existing orange distance-guide stroke (`DISTANCE_GUIDE_STROKE` /
`DISTANCE_GUIDE_LABEL_FILL` — `#cd4422`), reusing `drawDistanceGuideLine` / `drawValueLabel` /
`drawXMarker`. **Do not invent a new colour** (a reverted v1 used pink `#ff2fc2` and it matched
nothing else on screen).

---

## The two families

### A. Equal-spacing snaps — `getEqualSpacingGuides/`, orchestrated by `getChainSnap.ts`

These **correct the drag position** (return a delta) and draw the gap distances as two guide lines
with a `${gap}` label each. `getChainGapDragSnap.ts` tries `getChainSnap.ts` against each eligible
dragged member's own bounds in turn, in `getEligibleDraggedEntries` order, and returns the first
member's delta and guides — its delta composes on top of the alignment-snap delta in
`continueDrag.ts`.

`getChainSnap.ts` tries, **per axis, in this order**, and takes the first that produces lines:

| # | Name | File | Fires when | Reference for the target position |
|---|------|------|-----------|-----------------------------------|
| 1 | **Grid row / column** | `filterRowCandidates.ts` + `filterColumnCandidates.ts` pre-filter, then the same axis functions below | the dragged shape has a neighbour on that axis that is **exactly the same height** (for a row / horizontal axis) or **width** (for a column / vertical axis), within `GRID_CELL_SIZE_MATCH_TOLERANCE_PX` (0.5, tight) | whatever #2 or #3 below then matches, but only against the size-filtered candidate list |
| 2 | **Flanked** | `getHorizontalChainSnap/getFlankedChainSnap.ts`, `getVerticalChainSnap/getFlankedChainSnap.ts` | the dragged shape has a neighbour on **both** sides of the axis (e.g. shape 2 of a 1-2-3 row, dragged away and back) | centre it: `idealGap = (rightNeighbour.left - leftNeighbour.right - draggedWidth) / 2` |
| 3 | **Chain (one-sided)** | `getLeftChainSnap.ts` / `getRightChainSnap.ts` (and `getTop` / `getBottom` for vertical) | the dragged shape has a neighbour on **one** side only, **and that neighbour has its own further neighbour** on the same side (minimum 3 shapes in a line) | match the gap the neighbour already has to *its* further neighbour — "continue the established rhythm". This is what a shape at the **end** of a row needs; the flanked model can't fire for it. |

If none match on an axis, `getChainSnap.ts` falls back to trying #2/#3 against the **full,
size-agnostic** candidate list (so #1's grid filter never *removes* a match that the plain
chain/flanked would have found — the original "three differently-sized squares in a row" case still
works).

Catchment tolerance for the *position* match (how close the raw drag must be): `EQUAL_SPACING_SNAP_TOLERANCE_PX`
(8 screen-px / zoom). Separate from the tight size-match tolerance above.

`findHorizontalNeighbors.ts` / `findVerticalNeighbors.ts` take a `toleranceWorldUnits` and tolerate
the raw drag position **overlapping** a candidate by up to that amount (a live drag overshoots
mid-gesture) — without it a genuinely close candidate goes undetected for that frame.

### B. Matched-pair guides — `getEqualSpacingGuides/getMatchedPairGuides/`

**Display only** — no delta. The alignment snap already did the centring; this is a richer visual
confirmation of it.

| Name | File | Fires when | Draws |
|------|------|-----------|-------|
| **Matched pair / chain** | `getVerticalMatchedPair.ts` / `getHorizontalMatchedPair.ts`, **both** run by `getMatchedPairGuides.ts` and their outputs concatenated; drag gate `continueDrag/getMatchedPairDragGuides.ts` (per-member) | **each individually eligible dragged shape** (its own size/position — a multi-selection's combined box is never compared) has at least one neighbour, across a **real gap** (not flush contact), that is the **exact same size** (both W and H, `GRID_CELL_SIZE_MATCH_TOLERANCE_PX`) **and** centred on it (`ALIGNMENT_SNAP_TOLERANCE_PX` on the perpendicular axis) | a centre-axis line spanning the **entire chain** (both ways from the dragged shape — full `spanNear`→`spanFar`, same extent as the edge lines), the two shared edge lines also spanning the entire chain, an × at every corner of every chain shape plus the two centre-axis ends, and — in **each gap that is part of a run of ≥2 equal gaps** — a px label. A shape at the **crossing of a vertical and a horizontal run** (a `+` layout) draws **both** chains at once — `getMatchedPairGuides.ts` runs each axis with its own independent `used` set and merges `labels`/`lines`/`markers`. When dragging a multi-selection, every matching member's guides are merged the same way |

The match is a **chain walk**, not a single neighbour:

- `walkMatchedChain/` — `walkMatchedChain.ts` steps outward from the dragged shape in one direction
  (`sign` −1/+1), repeatedly calling `pickNextChainLink.ts` (nearest unused same-size + centred
  candidate beyond the cursor) until the run breaks. `getAxisEdges.ts` is the axis-agnostic view of a
  `TEdges` (near/far/centre/length/breadth) both files share; `types.ts` holds `TMatchedChainAxis`.
- `buildMatchedChainGuides/` — `buildMatchedChainGuides.ts` orchestrates over the ordered chain
  `[...beforeReversed, active, ...after]`: `getChainGeometry.ts` (`activeCross` + chain span
  `spanNear`/`spanFar` + the per-gap array), then `getChainGapLabels.ts` (label only gaps in an equal
  run — a lone odd gap gets none), `getChainGuideLines.ts` (3 lines all spanning the full chain —
  centre axis + 2 side edges), `getChainMarkers.ts` (corner × + the 2 centre-axis span ends).
  `types.ts` holds `TChainGeometry`.

**When matched-pair fires, `continueDrag.ts` suppresses BOTH the alignment guide and the chain-gap
equal-spacing guides for that frame** (`alignmentGuideRef = null`, `equalSpacingGuidesRef = null`) —
the matched-chain lines/labels already sit on the same edge/centre/gap positions, drawing either of
the others on top just doubles the strokes and the gap numbers. The chain-gap **delta** (position
correction) is still applied; only its guides are dropped.

---

## Refs and render order

`TTransformRefs`: `equalSpacingGuidesRef` (family A) and `matchedPairGuidesRef` (family B). Both set
every frame by `continueDrag.ts`, cleared in `disarmDrag.ts` and `useSelectionTool.ts`'s
`onPointerLeave` / teardown effect. Drawn in `drawScene.ts`, in order:
`drawShapeContactGuides` → `drawDistanceGuides` → `drawEqualSpacingGuides` → `drawMatchedPairGuides`.

## What is deliberately NOT built (don't assume otherwise)

- **Figma's actual "Smart Selection"** — pink centre-dots + a draggable handle *between* selected
  layers, triggered by *selection*. A reverted v1 drifted toward this. It is a different, much bigger
  feature. Not asked for.
- Snapping during **draw-new-shape** or **resize** — equal-spacing only runs during a move-drag.
- **Auto-reflow** — moving a shape never pushes its neighbours.
- Any **size change** to the dragged shape.

## History (so it isn't repeated)

1. v1 modelled equal-spacing as *only* flanked centring → never fired for the last shape in a row.
2. Reading Figma's Smart Selection help article → built toward pink handles/dots → wrong feature,
   fully reverted.
3. A jsdom `renderHook` test "proved" a subtly-wrong version worked; only a real Playwright
   screenshot exposed it. **Verify this file class with a real rendered frame**, and use
   `tsc --build --force` (not `tsc --noEmit -p .`, which skips test files here — see
   `~/.claude/.../memory/tsc-build-vs-noemit.md`).
4. Both families' multi-select handling was first built as **one union box** (`getDraggedGroupBounds.ts`,
   shared by both) and shipped with e2e coverage that passed. It was wrong: a live repro (multi-select
   whose *combined* box didn't match any candidate, even though one *member* individually did) showed
   nothing, correctly per that design, but not per what was wanted. The existing e2e tests only
   asserted "screenshots differ before/after", which is also true when nothing but the plain alignment
   guide's fallback renders — they never caught that a specific line/edge was the *only* thing under
   test, drawn from a synthetic scene that happened to still produce it by coincidence, not because the
   box-matching was actually correct. Switched matched-pair to per-member matching first (assumed
   family A had to stay box-based, since its single delta can't represent multiple members correcting
   to different positions at once) — then a second live repro showed family A had the exact same
   "guide references something nowhere near what's visible" symptom (a gap label spanning a large,
   visually unrelated distance). Fixed by having `getChainGapDragSnap.ts` also match per-member and
   use the *first* member that matches for both its delta and its guides, rather than deriving either
   from the union box. `getDraggedGroupBounds.ts` is now unused by both families and was deleted.

## Tests

- Unit: `getEqualSpacingGuides/**/test/`, `continueDrag/test/`, `drawScene/test/drawMatchedPairGuides.spec.ts`
- e2e: `e2e/design/selection/guide-smart.spec.ts` (one file, all variants — chain match/no-match,
  flanked, grid, chain-gap per-member on a multi-shape selection, matched-pair single neighbour,
  matched-pair full chain-walk, matched-pair crossing, matched-pair per-member on a multi-shape
  selection).
