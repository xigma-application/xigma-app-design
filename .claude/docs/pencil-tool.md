# Pencil tool — freehand-drag vector drawing

Reference for `ToolName.pencil` (`Shift+P`, shares the Pen dropdown). Unlike Pen
(`vector-network.md`), Pencil is a single continuous drag — press, drag, release — that commits
exactly one `TVectorNode` per stroke, then reuses the *existing* Vector Edit Mode mechanism for any
later editing. It adds no new editing code at all; everything below is about getting from a raw
mouse path to a good-looking committed `TVectorNode`, live, while the user is still dragging.

## 1. Why not just "simplify once at release"

The first working version ran Ramer–Douglas–Peucker simplification once, over the *entire* raw
point history, only at `pointerup`, then fit one Catmull-Rom curve through the result. It worked for
smooth, simple strokes — and produced a real, user-reported bug on anything with a tight loop or
sharp reversal embedded in a longer stroke: the loop's own vertices ended up simplified using
points from *elsewhere* on the stroke (the RDP chord spans the whole path), so the curve fit
"opened up" the loop, rendering it visibly larger/rounder than what was actually drawn. Verified
with a pixel-diff overlay (live-preview vs. committed screenshot, red/green composite) showing
~40px of divergence at the loop, vs. ~2px everywhere else.

**Fix: progressive chunked commits, not one global pass.** `useDrawPencilTool` tracks two point
arrays instead of one:

- `committedPointsRef` — the already-simplified prefix of the stroke, finalized and never
  re-processed.
- `tailPointsRef` — the raw, unsimplified points since the last commit, always starting with the
  last committed point (for continuity).

On every `pointermove` (`advancePencilTail.ts`), once the **tail's own path length** (not point
count — `getPathLength.ts`) crosses `PENCIL_CHUNK_LENGTH_PX` (30, in `Canvas/constants.ts`), the
tail gets simplified in isolation (`commitPencilTail.ts`, wrapping `simplifyPencilPoints.ts` — the
RDP implementation) and folded into `committedPointsRef`; the tail then resets to just the
boundary point. A tight loop's own points, drawn in a tight time/space window, are very unlikely to
span more than one chunk — so its own simplification pass sees only its own nearby geometry, never
mixing in a straight run from elsewhere on the stroke. Verified numerically (no browser needed) via
a standalone `tsx` script sampling the fitted curve against the raw stroke: max deviation dropped
from ~15px (global pass) to ~2.6px (chunked, 30px chunks) on a reproduction of the reported shape.
`PENCIL_CHUNK_LENGTH_PX` is a feel parameter — expect to retune it live if strokes look
under/over-simplified.

## 2. Curve fit — Catmull-Rom with tangent clamping

`buildVectorNetworkFromPoints.ts` chains the (already-simplified) points into vertices/segments,
computing each vertex's tangent via `getCatmullRomTangents.ts`: the standard uniform
Catmull-Rom-to-Bezier tangent, `(next - previous) * tension` (`PENCIL_TANGENT_TENSION = 1/6`, the
textbook-correct scale for this conversion). **Tangents are offset-from-vertex vectors, sign-mirrored
between adjoining segment ends** — segment *i→i+1* gets `tangentStart = tangent[i]` on vertex *i*'s
side, `tangentEnd = -tangent[i+1]` on vertex *i+1*'s side, same convention as Pen's own vector
network (`vector-network.md` §26, `'symmetric'` handle mode on every vertex, since a fresh pencil
gesture has no prior handle state to preserve).

A second, independent bug: even with chunking, a raw tangent can still overshoot past a *sharp
corner within one chunk* when the neighboring points are far apart relative to the corner's own
scale. `clampTangentMagnitude` (inside `getCatmullRomTangents.ts`) caps each tangent's magnitude to
the **shorter of its two real adjacent segment lengths** (a missing neighbor — the stroke's own two
open ends — imposes no constraint, `Infinity`), direction preserved, only magnitude scaled down.
Both fixes (chunking + clamping) are complementary, not redundant — chunking bounds *which* points
a tangent can see, clamping bounds *how far* that tangent can reach even among the points it does see.

## 3. Live preview — smoothed by default, raw ("brutal mode") on Ctrl/Cmd

`drawPencilPreview.ts` is a thin dispatcher over two sibling renderers, chosen by
`refs.pencilShowRawPreviewRef.current` (written every move in `updateRawPreview.ts`, true while
`event.ctrlKey || event.metaKey` — **both**, not just `ctrlKey`, since Mac users hold Cmd for this
class of gesture and there's no reliable dedicated Ctrl-hold convention there):

- `drawSmoothedPencilPreview.ts` (default) — runs the **exact same** `buildVectorNetworkFromPoints`
  → `flattenVectorSegments` → `drawVectorStroke` pipeline a committed node uses, plus
  `drawVectorRoundedCaps` (see §4) — so the preview already looks like the final shape while
  still dragging, not just after release. Feeding it *only* `committed + rawTail` would still look
  jagged near the cursor (many closely-spaced raw points hug themselves tightly under Catmull-Rom,
  since interpolation is forced through every point) — so the preview additionally re-simplifies
  the *live* tail on every move (`simplifyPencilPoints`, same tolerance) purely for display; the
  underlying `tailPointsRef` stays raw for correct chunk-length measurement.
- `drawRawPencilPreview.ts` (Ctrl/Cmd held) — the literal, unprocessed mouse path as a flat
  polyline, no simplification/curve-fit/caps at all. Figma has an equivalent "show me the raw line"
  modifier; this is the same idea, useful for judging how aggressively the smoothing is reshaping a
  given stroke.

Both preview renderers are fed by `pencilPreviewPointsRef`/`pencilRawPreviewPointsRef` respectively
(both new `TCanvasRefs` fields) — `drawScene.ts` passes both plus the boolean flag into
`drawPencilPreview` every frame; only one of the two ever actually draws.

## 4. Rounded caps — render-time only, both preview and committed

`capStyle?: 'round'` (optional field on `TVectorNode`) is set on every Pencil-created node.
`getOpenVectorEndpoints.ts` (`utils/canvas/vectorNetwork/`) returns every vertex touched by exactly
one segment — the open ends of a simple chain. `drawVectorRoundedCaps.ts`
(`utils/canvas/drawVectorNode/`) stamps a small filled circle there via the existing `drawEllipse`
primitive when `capStyle === 'round'`, radius = `PENCIL_CAP_RADIUS_PX` (1, in `constant/canvas.ts`
— the global layer, not `Canvas/constants.ts`, because `utils/canvas/` can't import from
`components/`), **unscaled by zoom** (a stroke cap grows/shrinks with the stroke in world space,
unlike a UI handle dot that stays constant screen size). Called from `drawVectorNode.ts`
unconditionally (no-ops for any node without the flag) — and, per §3, also from
`drawSmoothedPencilPreview.ts`, since skipping it there was a real shipped-and-fixed bug: the caps
only appeared after `pointerup`, visibly "popping" round at release instead of looking capped
throughout the drag. Radius is a fixed render-time constant for now, not stored per-point — a
future iteration may make it configurable per point, at which point it becomes real node data
instead of a `PENCIL_CAP_RADIUS_PX` constant.

## 5. Shift axis-lock — same "lock on first move, hold until release" shape as Pen's angle snap

Holding Shift mid-drag constrains the *current* segment to the nearest cardinal (horizontal/
vertical) line. `updateShiftLockedPreview.ts` freezes an anchor point (`shiftAnchorRef`, the tail's
last real point at the moment Shift first mattered) and, once movement clears
`PENCIL_AXIS_LOCK_THRESHOLD_PX` (4, zoom-scaled), locks an axis (`getDominantAxis.ts`: whichever of
`|dx|`/`|dy|` is larger) into `axisLockRef` — **the axis never re-evaluates once locked**, even if
the mouse then moves more in the other direction, matching the `getPointOnSnapAngle`-style "hold
until release" pattern already established for Pen's own angle snap (`vector-network.md` §39).
`getAxisLockedPoint.ts` computes the constrained point by holding the locked axis's anchor
coordinate fixed. While Shift is held, only the *preview* reflects the lock — the real tail stays
untouched (`advancePencilTail.ts` never runs).

**Two release paths, one shared fold-in step, and a real gap between them found live:**

- **Shift released first** (`onModifierKeyChange` in `useDrawPencilTool.ts`, mirroring Pen's own
  `onShiftKeyChange`, generalized to also fire on `Control`/`Meta` for §3) re-fires a synthetic
  `pointermove` at the last known cursor position with `shiftKey: false`. `advancePencilTail.ts`'s
  first step folds the pending locked point into the real tail (`if (axisLockRef.current &&
  shiftAnchorRef.current)`), *then* clears the lock and resumes normal freehand sampling from
  there — so releasing Shift mid-drag genuinely resumes freehand, not stays constrained.
- **Mouse button released while Shift is still held** — a completely ordinary way to finish a
  straight-line stroke, and initially a real, shipped-and-fixed bug: `handlePointerUp.ts` read
  `tailPointsRef` directly, which the Shift branch above had *never written to* — so the tail was
  still just its single anchor point, `commitPencilTail` had nothing to simplify beyond that one
  point, and the stroke silently discarded with nothing drawn. Fixed by giving `handlePointerUp`
  its own copy of the exact same fold-in check, extracted to `foldPendingAxisLock.ts` (computing
  `currentPoint` from the `pointerup` event itself) and run before `commitPencilTail`. Both
  `advancePencilTail.ts` and `foldPendingAxisLock.ts` independently guard on
  `axisLockRef.current && shiftAnchorRef.current` — there's no shared "did we already fold this in"
  flag, so if a *third* release path is ever added, it needs the same explicit check, not an
  assumption that one of the other two already handled it.

## 6. Files touched (for a future similar change)

- Data/constants: `types/design/types.ts` (`capStyle`), `Canvas/constants.ts` (`PENCIL_*`),
  `constant/canvas.ts` (`PENCIL_CAP_RADIUS_PX`, global-layer only).
- Refs: `types/design/canvas/types.ts` + both `TCanvasRefs` builders
  (`useCanvasRefs/createCanvasRefs.ts` and the separate manual one in
  `components/App/core/CanvasRefsProvider/CanvasRefsProvider.tsx` — **two places**, easy to update
  only one) — `pencilPreviewPointsRef`, `pencilRawPreviewPointsRef`, `pencilShowRawPreviewRef`.
- Hook: `Canvas/hooks/useDrawPencilTool/` — `useDrawPencilTool.ts` (thin listener-wiring shell) →
  `utils/handlePointerDown/`, `utils/handlePointerMove/` (`handlePointerMove.ts` orchestrator +
  `advancePencilTail.ts` / `updateShiftLockedPreview.ts` / `updateRawPreview.ts`, each with its own
  spec), `utils/handlePointerUp/` (`handlePointerUp.ts` orchestrator + `foldPendingAxisLock.ts` /
  `commitPencilNodeIfLongEnough.ts` / `buildVectorNetworkFromPoints.ts` / `getCatmullRomTangents.ts`),
  flat `utils/` for pieces shared across handlers (`simplifyPencilPoints.ts`, `commitPencilTail.ts`,
  `getPathLength.ts`).
- Rendering: `useCanvasRenderLoop/utils/drawScene/drawPencilPreview/` (`drawPencilPreview.ts` +
  `drawSmoothedPencilPreview.ts` + `drawRawPencilPreview.ts`), wired into `drawScene.ts` right after
  Pen's own preview call; `utils/canvas/vectorNetwork/getOpenVectorEndpoints.ts` +
  `utils/canvas/drawVectorNode/drawVectorRoundedCaps.ts`, wired into `drawVectorNode.ts`.
- Zero changes to Vector Edit Mode, hit-testing, or selection — a Pencil-committed node is a plain
  `TVectorNode`, indistinguishable to every other system once `addNode` has fired.

## 7. Tests

Unit: every file in §6 has its own spec, 100% branch coverage — see `useDrawPencilTool/utils/**`
for the split-file/split-spec convention (`xigma-function-style`'s "ifologia" rule applied
throughout: `handlePointerMove`/`handlePointerUp` are thin orchestrators, each concern is its own
named function with its own test file). Notably: the tight-loop-overshoot fix has no direct unit
test (it's an emergent property of chunk length interacting with real stroke shapes, not a single
function's branch) — it was verified numerically via a throwaway `tsx` script, and is covered
going forward by e2e's Shift/regression scenarios plus manual live testing, not a unit assertion.

e2e: `e2e/pages/design/pencil.spec.ts` — a plain drag draws and the tool stays active for an
immediate second stroke, a too-short drag discards, Shift locks an axis and holds it through a
direction reversal, releasing Shift mid-drag resumes freehand, the mouse-released-while-Shift-held
regression, and Vector Edit Mode entry via double-click with a vertex drag proving it behaves like
an ordinary node. See `e2e/pages/design/docs/TEST_CASES.md`'s "Pencil drawing" section for the
scenario table.

## Related

[[design-tool-architecture]] — the generic 8-concern draw-tool checklist; Pencil follows most of it
(§1 data model, §3-6 toolbar/icon/translation/shortcut wiring) but its actual drag gesture (§7) and
rendering (§8) are genuinely different from a `useDrawShapeTool`-style box tool, which is why this
doc exists separately rather than as one more entry there.
[[vector-network]] — the data model and rendering primitives Pencil's committed output is built
from and shares with Pen (`TVectorNode`, tangent conventions, Vector Edit Mode, `drawVectorNode.ts`);
read this first if the tangent sign-mirroring or `vertexHandleModes` conventions in §2 are unfamiliar.
