# Smart guides — every variant, and exactly when each fires

Roadmap Stage 13's "smart guides ... with the distance shown". This file is the **single reference
for all of them** so a future change doesn't re-derive, misread the spec, or reintroduce a reverted
approach. Implementation detail lives in `selection-and-manipulation.md` §24-28a; this file is the
"which mechanism does what" map.

All of these are **active only during a plain move-drag of a single existing shape** (via
`useSelectionTool`'s `continueDrag/continueDrag.ts`). None of them apply to: drawing a new shape,
resizing, rotating, multi-shape drags, hover, or selection. None of them change a shape's *size* —
position only.

Colour for every one of them is the existing orange distance-guide stroke (`DISTANCE_GUIDE_STROKE` /
`DISTANCE_GUIDE_LABEL_FILL` — `#cd4422`), reusing `drawDistanceGuideLine` / `drawValueLabel` /
`drawXMarker`. **Do not invent a new colour** (a reverted v1 used pink `#ff2fc2` and it matched
nothing else on screen).

---

## The two families

### A. Equal-spacing snaps — `getEqualSpacingGuides/`, orchestrated by `getChainSnap.ts`

These **correct the drag position** (return a delta) and draw the gap distances as two guide lines
with a `${gap}` label each. `getChainGapDragSnap.ts` gates to one eligible plain-origin node and
feeds `getChainSnap.ts`, whose delta composes on top of the alignment-snap delta in `continueDrag.ts`.

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
| **Matched pair** | `getVerticalMatchedPair.ts` / `getHorizontalMatchedPair.ts`, orchestrated by `getMatchedPairGuides.ts` (vertical tried first); drag gate `continueDrag/getMatchedPairDragGuides.ts` | the dragged shape has a neighbour, across a **real gap** (not flush contact), that is the **exact same size** (both W and H, `GRID_CELL_SIZE_MATCH_TOLERANCE_PX`) **and** centred on it (`ALIGNMENT_SNAP_TOLERANCE_PX` on the perpendicular axis) | a centre-axis line from the dragged shape's centre through the whole neighbour to its far edge, the two shared edge lines spanning both shapes, and an × at every endpoint/corner |

**When matched-pair fires, `continueDrag.ts` suppresses the alignment guide for that frame**
(`alignmentGuideRef = null`) — the matched-pair lines already sit on the same edge/centre positions,
drawing both just doubles the strokes.

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

## Tests

- Unit: `getEqualSpacingGuides/**/test/`, `continueDrag/test/`, `drawScene/test/drawMatchedPairGuides.spec.ts`
- e2e: `e2e/design/selection/guide-smart.spec.ts` (one file, all variants — chain match/no-match,
  flanked, grid, matched-pair).
