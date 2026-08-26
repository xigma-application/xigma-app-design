# Vector node performance — caching, frozen-snapshot drags, and the large-node problem

The performance work on Vector Network nodes, done as one long profile→fix→reprofile loop against
Chrome DevTools (Bottom-up view), driven by a user-built stress-test scene (thousands of disconnected
squares baked into a single `TVectorNode`, generator moved to `scripts/`, excluded from coverage — see
`59fe9c6`). Every fix here was confirmed against a live profile, not derived from reading the code
alone — this doc records the *why*, since the code itself only shows the *what*.

## 1. Why vector nodes are the hot path

Every other node type (`frame`, `ellipse`, `star`, ...) stores its final on-screen shape directly as a
handful of scalar fields (`x`/`y`/`width`/`height`/`rotation`). A vector node stores a **graph**
(`segments`/`vertices`) and derives everything actually drawn — planarized network, filled faces,
fill-loop point rings, tessellated thick stroke — fresh from that graph via
`utils/canvas/vectorNetwork/*` ([[vector-network]] §2, §12, §36, §44). That derivation is genuinely
expensive (crossing detection, DCEL face-walking, curve tessellation) and, unlike every other node
type, **there was no caching layer at all** for most of it before this work — every render-loop frame
recomputed the whole pipeline from scratch for every vector node on screen, and every pointermove during
a drag/resize/rotate did the same again on top of a full Redux dispatch.

## 2. The core failure mode: WeakMap caches keyed on the whole node's object reference

Every cache added here (and most that already existed — `deriveVectorFaces`, `getVectorFillLoopPoints`,
`getPlanarVectorNetwork`, `flattenVectorSegments`) is a `WeakMap<TVectorNode, ...>` (or
`WeakMap<TVectorNodeOrigin, ...>`) keyed on **the node object's own reference**. Two things break that:

- **Redux immutability**: any `dispatch(updateNode(...))` produces a brand-new top-level node object,
  even when the actual sub-field passed through is unchanged by reference (e.g. `segments` untouched).
  A cache keyed on the node's reference is therefore invalidated by *any* edit anywhere in the node —
  intentional (Redux's whole point is immutable snapshots), but it means the cache can never survive a
  dispatch, however small the real change.
- **Two different call sites building two different wrapper objects for what is conceptually "the
  same" node** silently defeats a cache even with *no* dispatch involved — see §3.9 below, the single
  most surprising bug found this way.

Every fix below is a variation on "give this computation a cache key that actually survives the case
that matters," not a rewrite of the derivation algorithms themselves.

## 3. Fixes, in the order they landed

### 3.1 — `Set`-based selection lookups (`e123eb3`, `610e796`)

Several vector hover/hit-test/render helpers (`getVectorHandleAtPoint.ts`,
`getVectorHandlesInRect.ts`, `isVectorHandleVisible.ts`, `isVectorSegmentEndpointSelected.ts`,
`getAllVectorVertexPositions.ts`, `getVectorFilledFacesTouchingVertexIds.ts`,
`drawVectorDraggedFillPreview.ts`) tested membership in the current selection via `Array.includes`
inside a loop over every vertex/segment — O(n²) against selection size × shape size. Swapped for
`Set.has`. Also batched `drawVectorVertexDots.ts` (new `collectVertexDotBuckets.ts`/
`processVectorVertexDot.ts`/`drawOrCollectVertexDot.ts`) so same-styled dots draw in one pass instead
of one `drawArrays` per vertex, and rewrote `findAllNetworkCrossings.ts`'s crossing search from a flat
O(n²) segment-pair scan to a sweep-line broad phase (`boundingBoxesOverlap` pre-filter) — this is what
[[vector-network]]'s `getVectorNodeClusters` follow-up plan (§5 below) explicitly builds on rather than
re-solving.

### 3.2 — Throttled dispatch to one per animation frame (`71d5edd`, part of `75de2da`)

Vertex drag, multi-drag, and generic whole-node drag were all dispatching `updateNode` on **every**
native `pointermove` event — far more frequent than the render loop's rAF cadence, and each dispatch
independently invalidated every WeakMap cache described above. New
`Canvas/utils/{scheduleThrottledDispatch,flushThrottledDispatch}.ts` + a `dispatchThrottle` field added
to the relevant drag-state types coalesce this to at most one dispatch per animation frame — the drag
still *feels* live (it dispatches on the very next frame, not on drop) but stops re-triggering the full
derivation pipeline hundreds of times for a single mouse gesture.

### 3.3 — Thick-stroke caching, a first (partial) node-bounds fix, same-color fill batching (`75de2da`)

`getThickVectorPathVertices.ts` gained its first cache; `groupFilledFacesByColor.ts` (new) batches
same-color faces into one `drawVectorFill` call instead of one per face, used by `drawVectorNode.ts`.
`getVectorNodeBounds.ts` got a partial fix at this point (still not the full WeakMap it needed — that
came in §3.5).

### 3.4 — Whole-node drag: the first frozen-snapshot fast path (`dc1bc61`)

The pattern every later fast path (resize, rotate, resize-while-rotated) copies. Established here:

- **Capture** (`arm*`, pointerdown): compute the node's *rendered* geometry once —
  `captureDraggedVectorNodeSnapshots.ts` — and store it on a `TCanvasRefs` ref
  (`draggedVectorNodeSnapshotsRef`), keyed by node id.
- **Continue** (pointermove): update only a couple of cheap scalar fields on the snapshot in place
  (`deltaX`/`deltaY`) — **no dispatch, no re-derivation**.
- **Draw** (render loop): `drawSceneVectorNode.ts` checks the snapshot map first and, if present, draws
  the frozen geometry translated by the live delta (`drawVectorNodeDragSnapshot.ts`) instead of calling
  the normal `drawVectorNode.ts` path.
- **Commit** (disarm, pointerup): dispatch **once**, computing final geometry from the frozen origin +
  final delta, through the exact same pure functions the plain (slow) path already used.
- A `draggedNodeIdsRef: Set<string>` marks which nodes are mid-fast-path so the selection
  outline/hover-outline layers can skip them (they'd otherwise show stale/wrong geometry, since Redux
  isn't updating live) — the render loop hides them instead, then reveals the true post-commit state.

This is the shape reused for resize (§3.6, §3.9) and rotate (§3.8).

### 3.5 — Real `getVectorNodeBounds` caching + whole-node resize fast path (`c609deb`)

Profiling found `getVectorNodeBounds` as the single largest hotspot (977ms self-time on the stress
scene) — it was being recomputed from scratch on every call, notably inside the resize math
(`getAnchorCorrectionDelta.ts`) which ran every pointermove against a *frozen* `origin` object that
never changes mid-drag, yet got no cache benefit at all. Fixed with a straightforward
`WeakMap<TVectorNodeOrigin, TDraftRect>` (977ms → 30.5ms self-time, confirmed live). Alongside it, the
resize equivalent of §3.4's drag snapshot landed —
`captureVectorNodeResizeSnapshot.ts`/`drawVectorNodeResizeSnapshot.ts`/
`updateResizedVectorNodeSnapshot.ts`/`commitResizedVectorNodeSnapshots.ts` — for the
**non-rotated** case only at this point (see §3.9 for the rotated extension).

### 3.6 — `getRenderedVectorNode` — caching the rotation bake itself (`aa8c5b9`)

Even after §3.5, a *rotated* vector node still lagged the viewport on every pan/zoom, with no drag in
progress at all. Root cause: `bakeVectorNodeRotation.ts` (rotates a node's stored/unrotated geometry
around its own bounds-center pivot into final world-space points, so `rotation` never needs to be baked
into `segments`/`vertices` storage — [[vector-network]]) had **zero caching**. Ten separate render-loop
call sites each did `node.rotation ? { ...node, ...bakeVectorNodeRotation(node) } : node` inline —
redoing the entire face/crossing/fill-loop derivation pipeline for the rotated node **every single
frame**, even completely idle ones, because the baked object is a fresh literal every call and every
downstream cache is keyed on *that* object's reference.

Fix: `Canvas/utils/getRenderedVectorNode.ts` — a `WeakMap<TVectorNode, TVectorNode>` wrapping the bake,
keyed on the *live store node's own reference* (stable across idle frames):
```ts
const cache = new WeakMap<TVectorNode, TVectorNode>();

export const getRenderedVectorNode = (node: TVectorNode): TVectorNode => {
  if (!node.rotation) return node;
  const cached = cache.get(node);
  if (cached) return cached;
  const renderedNode = { ...node, ...bakeVectorNodeRotation(node) };
  cache.set(node, renderedNode);
  return renderedNode;
};
```
All ten call sites (`drawVectorNode.ts`, `drawVectorFaceSelectHoverPreview.ts`,
`drawShapeBuilderNodeFacesHatch.ts`, `drawVectorDraggedFillPreview.ts`,
`drawVectorSelectedFillPreview.ts`, `drawVectorPaintHoverPreview.ts`, `drawVectorCutHoverPreview.ts`,
`drawVectorWidthPointsForNode.ts`, `drawVectorWidthValueLabel.ts`, `drawVectorWidthPointHoverMarker.ts`,
`getBakedVectorEditingNodes.ts`) now go through this one function. Four of them
(`drawVectorCutHoverPreview.ts`, and the three width-point files) turned out to have an *additional*,
independent bug — they rebaked unconditionally with no `node.rotation ?` guard at all — fixed for free
by `getRenderedVectorNode`'s own `if (!node.rotation) return node` fast path.

**~19 other direct `bakeVectorNodeRotation` call sites remain uncached**, deliberately not touched —
arm resolvers for cut/paint/divide/shape-builder, hover-matching (`resolveVectorSegmentHoverInNode.ts`),
vertex/face/edge hit-testing across open nodes (`getVectorVertexAtPointAcrossNodes.ts` and siblings).
These are interaction-only (arm/hover), not per-frame render-loop work, so they weren't profiled as
hot — §3.10 is the one that turned out to matter, found by the user reporting lag on plain selection,
not by pre-emptively auditing this list.

### 3.7 — `drawScene.ts` extraction (part of `fc6d567`)

Once §3.4/§3.6/§3.8's various `*NodeIdsRef` sets needed checking in `drawScene.ts`'s selected/hovered
node filtering, the inline logic there ("is this node mid-transform," the `hoveredNode` derivation)
became a genuine mess by inspection, not by profiling — pulled into three dedicated, individually
tested files: `isNodeTransforming.ts` (`draggedNodeIdsRef.has(id) || resizedNodeIdsRef.has(id) ||
rotatedNodeIdsRef.has(id)`), `getVisibleSelectedNodes.ts`, `getVisibleHoveredNode.ts`.

### 3.8 — Rotate: frozen-snapshot fast path, single node only (`fc6d567`)

Same shape as §3.4/§3.5, applied to live rotate-drag. The one thing that makes rotate *architecturally*
simpler than resize: rotating already-tessellated (baked) points around a **fixed pivot** by an
incremental angle is mathematically exact and composes additively with the bake's own rotation
(`rotate(rotate(p, pivot, a), pivot, b) === rotate(p, pivot, a+b)`) — no re-tessellation needed at all,
just a pointwise `rotatePoint` on the frozen, once-captured world-space faces/stroke vertices
(`captureVectorNodeRotateSnapshot.ts`/`drawVectorNodeRotateSnapshot.ts`).

**Deliberately scoped to single-node selections only.** `getRotatedNodeChanges.ts`'s single-node branch
never touches `segments`/`vertices` during a live drag — it only updates the `rotation` scalar, with the
actual geometry derived later at render time via `bakeVectorNodeRotation`'s own pivot. Multi-node group
rotate is different: it bakes rotation directly into vertex positions and resets `rotation` to 0. Mixing
the two into one fast path would need two different math paths under one snapshot type — not attempted.

### 3.9 — Resize of an already-rotated single node (`27e8439`)

The one case flagged as still lagging after §3.5/§3.8: resizing a vector node that's currently rotated
(e.g. 10°). §3.5's resize snapshot deliberately excluded this case (`!isSingleSelection ||
node.rotation === 0`) because the plain scale transform it drew (`anchor + (value - anchor) * scale`,
axis-aligned) doesn't match what a *rotated* single-node resize actually needs — resizing along the
shape's own rotated local axes, then correcting position so the dragged handle's world point stays
fixed under the cursor (`getRotatedAnchorSolver.ts`/`getAnchorCorrectionDelta.ts`, pre-existing, already
proven correct for the slow/dispatch path — see `continueResizeDrag.spec.ts`'s dedicated
"anchor stays fixed in world space" tests).

**The math**: the committed result (scale in local space around an anchor, translate by a correction
delta, then bake-rotate around the new local bounds center) resolves to a single closed form for any
point on the frozen snapshot:
```
worldPoint = pivot + R(rotation) · (scaledPoint − scaledCenter)
```
where `pivot` is the *solved* new bounds-center (from `rotatedAnchorSolver`) and `scaledCenter` is the
anchor-scaled *origin* bounds center. Both are derivable **without touching the node's actual
segments/vertices at all** — extracted into `getRotatedResizePivot.ts` (shared, unchanged behavior, by
`getAnchorCorrectionDelta.ts` itself and the new snapshot-update path) plus a `transformCoord` call on
just the origin's cached bounds. This relies on one non-obvious but exact fact: `getVectorNodeBounds`'s
min/max is built from a flat point list (vertices + tangent-handle points), and an anchor-scale
(`transformCoord`) is a monotonic 1D affine map per axis — monotonic maps commute with min/max, so the
scaled bounds are *exactly* the affine transform of the origin bounds' corners, never an approximation,
even for curved (bezier-handled) paths. This is what makes the per-frame update cheap: no
`resizeVectorVertices`/`resizeVectorSegments` recompute needed just to preview the drag.

`TVectorNodeResizeSnapshot` gained `pivot`/`rotation`/`scaledCenter` fields (default: the node's own
current bounds center, seeded from `getVectorNodeBounds(node)` at capture time, so frame 0 — before any
pointermove — renders identically to the live bake with zero flash). `captureResizedVectorNodeSnapshots.ts`
now captures **every** vector node regardless of rotation, passing `rotation: isSingleSelection ?
node.rotation : 0` — 0 disables the new branch and preserves the pre-existing (already-correct) plain
scale-only behavior for group-member resize, where the rotated-anchor solver was never applied anyway.

**Also fixed in passing**: `commitResizedVectorNodeSnapshots.ts` previously reconstructed final geometry
inline (`resizeVectorSegments`/`resizeVectorVertices` called directly, no anchor correction at all) —
correct only for the non-rotated/group case this file was written for. Rewritten to call
`resizeVectorNode.ts` directly (the *same* function the slow/dispatch path already uses), reconstructing
`rotatedAnchorSolver` from `resizeDragState.bounds`/`.handle`/`origin.rotation` — guarantees the
fast-path commit and the slow-path dispatch can never silently diverge, since they're now the same code.

### 3.10 — `getNodeAtPoint.ts`: hit-testing was cache-**inconsistent**, not cache-**missing** (`0bd55f4`)

Found from the user reporting lag on plain single-click *selection* of a rotated vector — no drag
involved at all, so none of §3.4–§3.9 apply. `getNodeAtPoint.ts` (used for click-to-select, hover
resolution, and double-click-to-edit — see file index) tested a rotated vector by **un-rotating the
query point** and testing it against the **raw, unbaked** node — mathematically fine, but the raw node
is a *different object reference* than `getRenderedVectorNode`'s baked node the render loop uses and
already has cached. `getVectorFillLoopPoints`'s `WeakMap<TVectorNode, ...>` cache (and
`flattenVectorSegments`'s) was therefore **never populated under the raw-node key** by anything — every
single click/hover on a rotated vector was a guaranteed full cache miss, redoing planarization + face
resolution from scratch, however recently the same node had just been rendered (cache hit) under its
*baked* reference.

Fix: for the vector case only, skip the query-point un-rotation and test the **original** point against
`getRenderedVectorNode(node)` instead — same object the render loop already caches under, so hit-testing
and rendering now always agree on which "version" of the node's geometry is cached.
```ts
case NodeType.vector: {
  const bakedNode = getRenderedVectorNode(node);
  return isPointInVectorRegions(testPoint, bakedNode) || isPointNearVectorPath(testPoint, bakedNode, lineTolerance);
}
```
Unrotated nodes are unaffected either way (`getRenderedVectorNode` short-circuits to `node` itself, same
as the old un-rotate-by-zero path). Not yet fixed: the ~19 other direct `bakeVectorNodeRotation`
callers noted in §3.6 have the exact same raw-vs-baked mismatch potential (vertex/edge/handle hit-testing
across open nodes, all gated to Vector Edit Mode rather than plain selection) — not addressed since no
lag has been reported from them yet.

## 4. The frozen-snapshot pattern, generalized

Every live-drag fast path here (§3.4, §3.5, §3.8, §3.9) is the same four-phase shape:

| Phase | When | Does |
|---|---|---|
| Capture | pointerdown (arm) | Compute rendered geometry **once**, store on a `TCanvasRefs` snapshot map keyed by node id |
| Continue | pointermove | Mutate a few cheap scalar fields on the snapshot **in place** — no dispatch, no re-derivation |
| Draw | render loop, every frame | If a snapshot exists for this node id, draw it (cheap pointwise transform) instead of the live node |
| Commit | pointerup (disarm) | Dispatch **once**, via the *same* pure functions the slow/dispatch path already used |

The recurring justification: a Redux dispatch's cost isn't the dispatch itself, it's every downstream
WeakMap-cached derivation being invalidated by the new node reference it produces. Not dispatching
during the drag sidesteps that entirely; dispatching exactly once at the end means the cache only pays
that cost once per gesture, not once per `pointermove` event (which fires far more often than the
render loop's rAF cadence — §3.2 already established this for the plain-dispatch case before any
snapshot existed).

## 5. Still open: whole-node cache granularity breaks down at many-shapes-per-node scale

**Everything above assumes the cost of a cache miss is proportional to one shape.** It isn't, for the
stress-test scenario that drove this whole session: one `TVectorNode` containing thousands of
*disconnected* shapes (squares with no shared vertices) in one flat `segments`/`vertices` record.
Editing a single vertex on **one** of those squares still triggers a full re-derivation of **all** of
them, because every cache here — including every fix above — is keyed on the *whole node's* object
reference. Any edit anywhere in the node produces one new node object, which invalidates every one of
those caches for the entire node, however small the actual change. This is architectural, not a bug in
any individual fix, and none of §3's work addresses it — a real drag/resize/rotate on one shape inside a
1000+-shape node still recomputes the derivation pipeline for the other 999 shapes on every commit (and,
for rotated nodes, every render frame — §3.6's cache still keys on the whole node).

A plan exists for the fix (`~/.claude/plans/compressed-leaping-koala.md` at time of writing — **designed,
not yet implemented**): cache at **cluster** granularity instead of whole-node granularity, where a
cluster is a graph-connected-component (shared vertices) **unioned with** whatever
`findAllNetworkCrossings.ts` (§3.1's sweep-line version) already finds crossing each other — two shapes
with no shared vertex but that visually overlap must still be treated as one cluster, or their cached
fill boundaries would go stale wherever they cross. For the stress-test scenario (disjoint squares, real
gaps) this degrades to exactly "one square = one cluster" — the intended win; for one fully-connected
complex path it degrades to "one cluster = the whole node," identical to today.

Design, in brief: `getVectorNodeClusters.ts` reuses the existing BFS adjacency machinery from
`vectorNetwork/cutVectorNetwork/` (`buildVectorAdjacency.ts`/`findConnectedVertexIds.ts`) rather than
reimplementing graph traversal, extended with crossing-adjacency; a new persistent, **string-keyed**
(not `WeakMap`, since the whole point is surviving across node-reference changes — key:
`${node.id}:${sortedVertexIds.join(',')}`) LRU cache stores each cluster's derived faces, invalidated
implicitly by cluster identity changing (any topology change produces a different vertex-id set for the
affected cluster, a clean miss with no explicit invalidation needed at any of the dozens of mutation
call sites); `deriveVectorFaces.ts`/`getVectorFillLoopPoints.ts` get rewritten internally to
compute-or-fetch per cluster and concatenate, with **no change to either function's external signature**.

**Explicitly out of scope even once that plan lands** (flagged there as follow-up work):
- **Stroke tessellation** (`flattenVectorSegments`, `getThickVectorPathVertices`) currently has **zero**
  cache at all (worse off than fill derivation ever was) and profiling shows it as the single largest
  remaining cost at scale (`drawVectorThickStrokeVertices` ~10%, `getThickVectorPathVertices` ~9% of
  frame time on the 1000-shape stress scene, per the most recent profile in this session). A strong
  candidate to reuse the same cluster primitive, deliberately not bundled into the first slice to keep
  its surface area/risk down.
- **GPU-buffer-level caching** (skipping `bufferData`/`drawArrays` for an unchanged cluster) — no
  precedent anywhere in the renderer (only 4 shared GL buffers total, app-wide, rebound per-primitive
  every frame, [[canvas-rendering-pipeline]] §3/§8) — a materially larger rendering-architecture change.
- Rotated nodes will **still** get a cluster-cache miss every render frame even after that plan lands —
  `drawVectorNode.ts` allocates a new baked node (and, inside the bake, new vertex objects) every frame
  for `rotation !== 0` (§3.6), and a reference-keyed-by-vertex-object cluster cache inherits that same
  limitation. Not a regression from the plan, a pre-existing one it doesn't fix.

## File index

- Caching: `utils/canvas/vectorNetwork/getVectorNodeBounds.ts`,
  `Canvas/utils/getRenderedVectorNode.ts`, `utils/canvas/drawVectorNode/groupFilledFacesByColor.ts`,
  `utils/canvas/vectorNetwork/getThickVectorPathVertices/getThickVectorPathVertices.ts`
- Throttled dispatch: `Canvas/utils/{scheduleThrottledDispatch,flushThrottledDispatch}.ts`
- Drag snapshot: `useSelectionTool/utils/handlePointerDown/armDrag/{armDrag,captureDraggedVectorNodeSnapshots,getDragNodeOrigins}.ts`,
  `utils/canvas/drawVectorNode/drawVectorNodeDragSnapshot.ts`
- Resize snapshot: `useSelectionTool/utils/handlePointerDown/captureResizedVectorNodeSnapshots.ts`,
  `utils/canvas/drawVectorNode/{captureVectorNodeResizeSnapshot,drawVectorNodeResizeSnapshot}.ts`,
  `useSelectionTool/utils/handlePointerMove/continueResizeDrag/{continueResizeDrag,updateResizedVectorNodeSnapshot}.ts`,
  `.../resizeNode/resizeVectorNode/{resizeVectorNode,getAnchorCorrectionDelta,getRotatedResizePivot,getRotatedAnchorSolver}.ts`,
  `useSelectionTool/utils/handlePointerUp/{commitResizedVectorNodeSnapshots,disarmResizeDrag}.ts`
- Rotate snapshot: `useSelectionTool/utils/handlePointerDown/captureRotatedVectorNodeSnapshot.ts`,
  `utils/canvas/drawVectorNode/{captureVectorNodeRotateSnapshot,drawVectorNodeRotateSnapshot}.ts`,
  `useSelectionTool/utils/handlePointerMove/continueRotateDrag/continueRotateDrag.ts`,
  `useSelectionTool/utils/handlePointerUp/{commitRotatedVectorNodeSnapshots,disarmRotateDrag}.ts`
- Render-loop gating: `useCanvasRenderLoop/utils/drawScene/{drawScene,drawSceneVectorNode,
  isNodeTransforming,getVisibleSelectedNodes,getVisibleHoveredNode}.ts`, `useCanvasRefs/createCanvasRefs.ts`
  (`*NodeIdsRef`/`*VectorNodeSnapshotsRef` fields)
- Hit-testing: `Canvas/utils/getNodeAtPoint.ts`
- Stress-test scaffold (not part of the app bundle): `scripts/` (generator moved/excluded per `59fe9c6`)
- Pending cluster-cache plan: `~/.claude/plans/compressed-leaping-koala.md` (not yet implemented — §5)

## Related

[[canvas-rendering-pipeline]] — the render loop and GL-buffer model these caches sit in front of; §3/§8
there is why GPU-buffer caching (§5's third non-goal) has no precedent to build on.
[[vector-network]] — the derivation pipeline itself (§2, §12, §36, §44) that every cache here is a
front-end for, and §35's dispatch-per-pointermove nuance §3.2 here generalizes past the multi-drag case
it was first fixed for.
[[selection-and-manipulation]] — the drag/resize/rotate arm→continue→disarm resolver shape (§13, §19)
that §4's four-phase snapshot pattern is built directly on top of, one snapshot type per gesture.
