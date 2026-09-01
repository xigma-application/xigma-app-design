# Pen Tool / Vector Network

How `NodeType.vector` — a Figma-style Vector Network (branching graph of vertices + curved segments,
supporting multiple independent open/closed contours in one object) — is modeled, drawn, drawn-while-
in-progress, and edited. Companion to `design-tool-architecture.md` (the generic 8-concern tool
checklist — this tool doesn't fit it cleanly, see §1) and `selection-and-manipulation.md` (Vector Edit
Mode is implemented as new resolvers inside `useSelectionTool`, not a parallel tool).

## 1. Why this isn't a normal `useDraw<X>Tool`

Every other draw tool is one `pointerdown → pointermove* → pointerup` gesture, `addNode` on release. Pen
is genuinely multi-click and multi-session: one click places a vertex, drawing continues across
subsequent clicks, `Escape` ends a fragment without ending the tool, and the network can be resumed
later (Vector Edit Mode → Pen again) with no "session" concept surviving anywhere except two small
Redux fields. `types/design/types.ts`:

```ts
export type TVectorVertex = { id: string; x: number; y: number }; // absolute world coords
export type TVectorTangent = { x: number; y: number } | null;     // offset relative to ITS OWN vertex
export type TVectorSegment = { id: string; startId: string; endId: string; tangentStart: TVectorTangent; tangentEnd: TVectorTangent };
export type TVertexHandleMode = 'corner' | 'smooth' | 'symmetric'; // per-vertex, missing = 'corner'
export type TVectorNode = {
  id: string; name: string; parentId: string | null; type: NodeType.vector;
  vertices: Record<string, TVectorVertex>;
  segments: Record<string, TVectorSegment>;
  vertexHandleModes: Record<string, TVertexHandleMode>;
  fillColor: string; strokeColor: string; strokeWidth: number;
  rotation: number;
};
```

Not a `TBaseNode` (no `x/y/width/height`) — like `TLineNode`, a point graph doesn't fit a box. Bounds
are derived on demand (`utils/canvas/vectorNetwork/getVectorNodeBounds.ts`, min/max over `vertices`),
exactly mirroring how `getNodeBounds.ts` already special-cases `TLineNode`.

`rotation` **is** stored (unlike `TLineNode`), but `vertices`/`segments` always stay in that rotation's
*local/reference* frame — `rotation` is a live transform applied non-destructively wherever the shape is
drawn or hit-tested (`bakeVectorNodeRotation.ts`, mirroring `TBaseNode.rotation`'s role for every other
shape), never baked into the stored coordinates at rest. It only gets permanently folded into
`vertices`/`segments` (and reset to `0`) at specific points where downstream math still assumes a
rotation-free node — group transforms and Vector Edit Mode entry — see §6/§7.

**Tangents live on the segment, not the vertex.** A branch vertex (degree 3+) can have several outgoing
segments each needing its own tangent at that point; a single `handleIn`/`handleOut` pair on the vertex
can't represent that. Tangents are stored as offsets **relative to their own vertex** so dragging a
vertex carries its handles for free (no separate update needed) — `getVectorHandlePosition.ts` is the
one-line `vertex + tangent` conversion to an absolute point, used everywhere a handle needs to be drawn
or hit-tested.

`vertexHandleModes` only matters at a vertex with exactly two segment-tangents touching it —
`'smooth'` mirrors direction, `'symmetric'` mirrors direction and magnitude, `'corner'` (the default,
absent entry) applies no constraint. Set to `'smooth'` automatically the first time a click-drag creates
a handle at that vertex (`useDrawPenTool/utils/updateVectorHandleDrag.ts`).

No new reducers were needed for vertex/segment CRUD — every mutation is a plain `updateNode({ id,
changes: { vertices, segments, ... } })` patch, the same `Object.assign`-per-key mechanism every other
optional node field already uses.

## 2. Face derivation — fill is computed, never stored

No contour/region list is persisted (a second source of truth that could desync from
`vertices`/`segments`). `utils/canvas/vectorNetwork/deriveVectorFaces.ts` derives every closed,
fillable region fresh, from the graph alone, on every call (rendering and hit-testing both call it):

- `buildVectorHalfEdgeAdjacency.ts` — each undirected segment becomes two directed half-edges.
- `walkVectorFace.ts` — walks forward from one directed half-edge, continuing only through vertices with
  **exactly one** unvisited way onward (degree-2). A branch (2+ options) or dead end (0) aborts the walk;
  returning to the walk's own start vertex closes it. A branch vertex may legitimately start/end a loop,
  just never be a *mid-loop* choice point.
- `deriveVectorFaces.ts` tries both directions of every segment as a starting half-edge, and **dedupes**
  closed walks by their sorted segment-id set — necessary because a simple loop with no branch at all
  closes cleanly in *both* winding directions from the same segment set, and submitting the same region
  twice to the stencil pass (§3) would toggle it back to unfilled.

**Known, deliberate limitation**: a true "figure-8" (two loops sharing one vertex, where you'd need
angle-sorted adjacency to know which face is which) renders stroke-only at that shared vertex — neither
loop gets filled, since the walk can't disambiguate which way to turn without genuinely rotationally-
sorted adjacency (real Figma does this via planar face-traversal with angle sorting; this is the one
piece of that algorithm not implemented). Every topology a Pen session naturally produces — single
closed shape, closed shape + separate open tail, multiple disjoint closed shapes — is handled correctly.
See `deriveVectorFaces.spec.ts`/`walkVectorFace.spec.ts` for the exact cases this covers and the ones it
doesn't.

**Update (§43, Paint tool)**: the *geometry* of a face is still never persisted — `deriveVectorFaces.ts`
recomputes every face's boundary fresh on every call, exactly as above. What changed is that each face
now also carries a stable `key` (the same sorted-segment-id string this function already used internally
for its own de-dupe pass), and `TVectorNode.filledFaceKeys: string[]` persists *which* of those keys are
currently painted. This is still "derived, not duplicated" in the sense that matters: a stale key (one
whose segments got deleted) simply matches no current face and renders nothing, with no explicit cleanup
needed — see §43.

## 3. Rendering — `utils/canvas/drawVectorNode/`

- `flattenSegment.ts` (`vectorNetwork/`) — cubic-bezier-to-polyline, fixed `VECTOR_CURVE_SEGMENTS`
  subdivision; both-tangents-null short-circuits to the two endpoints, no subdivision.
- `drawVectorStroke.ts` — one quad per consecutive flattened-point pair across every segment (open-
  polyline variant of the existing closed-ring "quad per point pair" trick, `getThickPolylineVertices.ts`
  reusing `getQuadVertices.ts` directly), batched into one `bufferData`/`drawArrays` call.
- `drawVectorFill.ts` — **stencil-buffer even-odd fill**, the one genuinely new WebGL technique in this
  codebase: every face's flattened boundary is fanned into the stencil buffer with `gl.stencilOp(KEEP,
  KEEP, INVERT)` and color writes off, then one covering quad composites the fill color wherever the
  stencil ended up non-zero (`stencilFunc(NOTEQUAL, 0, 0xff)`). Handles concave regions and holes for
  free via the even-odd rule — an inner loop toggles the same bit twice inside its own area, cancelling
  back out — with no CPU-side polygon triangulation. Requires `WEBGL_CONTEXT_ATTRIBUTES`
  (`Canvas/constants.ts`) to request `stencil: true`, the one context-setup change this feature needed
  (see `canvas-rendering-pipeline.md` §1).
- `drawSceneNodes.ts` gets a `case NodeType.vector`; `drawHoverOutline.ts` and
  `drawPerNodeSelectionOutlines.ts` also get cases (hover redraws the stroke thicker; per-node selection
  draws the same bounds-box-plus-corner-handles outline every box node gets, using
  `getVectorNodeBounds.ts` + `node.rotation`, except while `vectorEditingNodeId` matches the node — then
  it's a no-op, since Vector Edit Mode's own handle layer, below, is what shows during editing instead).
  `drawHoverOutline.ts` takes `vectorEditingNodeId` as a parameter for the same reason and skips the
  hovered node entirely (`hoveredNode.id !== vectorEditingNodeId` gate before the `switch`, not just the
  `vector` case — the hovered node can never legitimately be anything but a vector node when this matches)
  — without it, moving the cursor over the network's own strokes/vertices while already inside Vector Edit
  Mode redrew the thick hover outline on top of the edit-mode gray outline + handles layer every frame.
  Both `drawSceneNodes.ts`'s fill/stroke render and the hover outline call `bakeVectorNodeRotation.ts`
  first — `node.rotation` is never baked into stored `vertices`/`segments` (§1), so anything drawing the
  shape must apply that rotation transform itself, non-destructively, every frame.
- `drawScene/drawVectorEditHandlesLayer.ts` — vertex dots (highlighted per `selectedVectorVertexIdsRef`)
  and tangent-handle dots + guide lines, gated only on `vectorEditingNodeId !== null` (Redux). Runs
  during **both** Pen-tool drawing and Vector Edit Mode, since both are just that one field being set —
  reads committed state fresh every frame, so a handle dragged live by either mechanism tracks the
  pointer with no ref-lifting to `TCanvasRefs` needed (unlike the ellipse-arc handles, which need lifted
  refs specifically because *that* interaction is ref/preview-based, not Redux-dispatched-per-move).

## 4. Pen tool — `Canvas/hooks/useDrawPenTool/`

Two small Redux fields drive the whole session (`store/design/types.ts`):
- `vectorEditingNodeId: string | null` — which Vector Network is open for editing/drawing. Persists
  across a tool switch away from Pen (mirrors `editingNodeId`'s shape for text).
- `penActiveVertexId: string | null` — the vertex Pen would extend from next. Changes only on discrete
  clicks/Escape (not per pixel), so — like `editingNodeId`/`commentDraftPosition` — it's fine as Redux
  state, not a ref.

Three pointerdown cases (`useDrawPenTool/utils/`), dispatched on `node`/`penActiveVertexId` presence:

1. **`startNewVectorNetwork.ts`** — no `vectorEditingNodeId` yet. The click **is** the first anchor
   point: `addNode` a real one-vertex `TVectorNode` immediately (not a draft — there's nothing to hold in
   `draftRef`, unlike every drag-to-commit tool), then `setVectorEditingNodeId`/`setPenActiveVertexId`.
2. **`startVectorFragment.ts`** — a network exists, no active vertex (fresh fragment). Hovering an
   existing vertex just resumes from it (no vertex/segment mutation, but the drag **is** armed — §15 —
   so click-dragging away from it still shapes a fresh outgoing tangent); blank canvas adds a new,
   disconnected vertex to the same node.
3. **`continueVectorNetwork.ts`** — an active vertex exists. Hovering **any** existing vertex of the
   network (not just the fragment's own start — requirement #3) adds a connecting segment and **clears**
   `penActiveVertexId`, always ending the fragment on a click-to-existing-vertex (closure itself is never
   special-cased; `deriveVectorFaces` just sees a cycle once the segments describe one). Blank canvas
   adds a vertex + segment and keeps drawing.

**Click-drag Bezier creation**: `updateVectorHandleDrag.ts` (pointermove, button held) shapes the
just-placed vertex — mirrors the drag into the *incoming* segment's `tangentEnd` (if one exists) and
always remembers the dragged direction in a hook-local `pendingOutgoingTangentRef` as the pending
`tangentStart` for whichever segment eventually departs from that vertex next (segments don't exist yet
to store it on until then). This is what makes dragging the very **first** vertex of a fresh fragment
work correctly too, not just later ones — `startNewVectorNetwork.ts`/`startVectorFragment.ts` both arm
`dragOriginRef` with `segmentId: null` (no incoming segment to mirror-shape yet, so that half of the
drag is a no-op), but `pendingOutgoingTangentRef` still gets set unconditionally, so the *first* real
segment drawn from that point picks up the dragged tangent as its `tangentStart` exactly like any
later point would.

**Live preview** (`penPreviewRef`/`penNewVertexPreviewRef`, `TCanvasRefs`, ref not Redux — pure
uncommitted visuals), two cases depending on whether there's an active vertex yet, both driven by the
**same shared resolver pipeline** (below):
- **No active vertex** (`handlePointerMove.ts`'s `node === null` branch — nothing placed yet at all, or
  `node` case with no `penActiveVertexId`) — `updateNewVertexPreview.ts` recomputes `penNewVertexPreviewRef`
  every pointermove.
- **Active vertex exists** — `updateVectorPenPreview.ts` recomputes `penPreviewRef` every pointermove: the
  rubber-band edge from the active vertex to the cursor, curved via `tangentFromOffset` if a drag left a
  pending outgoing tangent, with its endpoint (`to`) resolved the same way as the no-active-vertex case
  below rather than the raw pointer position, so the next click naturally lands on/connects to it (shown
  even before requiring a second click, satisfying "handler podąża za nim między networkami" within the
  one active object — cross-*object* connecting is explicitly out of scope, see §7).

**Vertex/edge hover resolution — `handlePointerMove/resolvePenPointHover/`, mirrors
`useHoverHighlight`'s `resolveHover`/`hoverResolvers` chain-of-responsibility exactly** (same shape,
asked for directly, "zobacz jak to jest zrobione i zrób tak samo"): `PEN_POINT_HOVER_RESOLVERS`
(`resolvePenPointHover/constants.ts`) is an ordered array of pure `(ctx) => TPenPointHoverResult |
undefined` functions — `resolveVertexPointHover` first, `resolveEdgePointHover` second
(`resolvePenPointHover/hoverResolvers/`) — each taking a `TPenPointHoverContext`
(`node`/`point`/`viewport`/optional `excludeVertexId`) and returning `{ hoverKind: 'vertex' | 'edge' |
'edge-snap'; point: TPoint; segmentId: string | null }` on a match. Both `updateNewVertexPreview.ts`
(idle) and `updateVectorPenPreview.ts` (active-draw) — flat siblings in `handlePointerMove/`, not nested
inside `resolvePenPointHover/` themselves, since that folder holds only the shared resolver pipeline, not
either of its two call sites — loop over the **same** resolver array and stop at the first match. The
only difference is `updateVectorPenPreview.ts` passes `excludeVertexId: activeVertexId` so the vertex
you're extending *from* is never offered back as its own snap target, and it wraps the winning `point`
into the rubber-band's `to` (instead of writing straight to `penNewVertexPreviewRef`). This means
edge-hover (attract + highlight + cursor, below) works identically whether the network is idle or
mid-draw — extending onto an existing segment previews the same "closing onto an edge" outcome
`closeLoopOntoEdge.ts` (§6) actually commits on click, instead of only showing feedback for closing onto
an existing *vertex*. (First pass nested `updateNewVertexPreview.ts` itself inside a same-named
promoted folder, with `updateVectorPenPreview.ts` reaching into a sibling's folder for the shared
pieces — corrected by the user once `updateVectorPenPreview.ts` grew the same dependency: the shared
resolver pipeline moved to this neutrally-named folder and both call sites went back to flat sibling
files, "przenieść wyżej... a tamten folder zmienić na jakąś ogólną nazwę".)
- **`resolveVertexPointHover`** — `getVectorVertexAtPoint`, unchanged snap-onto-a-vertex behavior.
- **`resolveEdgePointHover`** — `getVectorEdgeAtPoint.ts` (§6) returns `{ point, segmentId, snapped }`,
  not just the `segmentId`. `point` is the cursor's continuous perpendicular projection onto the hit
  sub-segment (`getClosestPointOnLine.ts`) **unless** that projection lands within `vertexTolerance` of
  the segment's fixed midpoint (`getSegmentMidpoint.ts`, `utils/canvas/vectorNetwork/` — averages the
  two endpoints for a straight segment, or the curve's `t=0.5` point via `flattenSegment(start, end,
  tangentStart, tangentEnd, 2)[1]` for a curved one), in which case `point` locks onto that exact
  midpoint and `snapped` is `true`. `resolveEdgePointHover` maps `snapped` to the hover kind:
  `hoverKind: snapped ? 'edge-snap' : 'edge'`.
  **This two-tier shape (loose continuous attraction across the whole segment, full snap only near the
  midpoint) is the result of two rounds of direct correction, both worth keeping in mind before touching
  this file again:**
  1. A first version replaced the continuous projection outright with "hit-test proximity to the
     midpoint only" — meaning nothing happened at all unless the cursor was already within
     `vertexTolerance` of the midpoint, so hovering anywhere else along a long segment showed no
     color/cursor feedback whatsoever. Reported directly ("wgl nie przyciąga i nie podpowiada linia")
     and reverted by the user re-editing `getVectorEdgeAtPoint.ts` back to the continuous-projection
     version in their IDE mid-session ("Cofam twoje zmiany... Tak cofnąłem tylko tą część").
  2. The now-current shape is the reconciliation: keep the continuous, whole-segment attraction as the
     general "there's an edge here" affordance (`pen-extend`, no full lock), and layer the midpoint-only
     **full snap** (`pen-snap`, point locks exactly onto the midpoint) on top of it, triggered only once
     the cursor is actually close to that specific point — "Gdy jestem blisko tego punktu powinno
     przyciągnąć ale mówię punktu nie całego segmentu."
- A third ref, **`hoveredSegmentIdRef`** (`TCanvasRefs`), carries the matched `segmentId` (or `null`) from
  whichever resolver ran into the render loop, consumed by `drawVectorEditOutline/` (below). Cursor class
  comes from `handlePointerMove.ts`'s `getPenHoverCursorClassName`, mapping `hoverKind` three-to-two:
  `'vertex'`/`'edge-snap'` → `'pen-snap'`, `'edge'` → `'pen-extend'` (an until-then-unused cursor asset
  that already existed in `canvas.module.scss`/`assets/icons/cursors/`), `null` → `'pen'`. Same mapping
  used by both the idle and active-draw branches. `startVectorFragment.ts`/`continueVectorNetwork.ts`
  (§6) both pass the resolver's `t` (the curve parameter at whichever of the two tiers matched, §12 —
  not the raw click coordinate, and no longer the resolved `point` either since §12) into
  `splitVectorSegment.ts`/`closeLoopOntoEdge.ts` — the committed split point always matches whatever was
  last previewed, now derived exactly from `t` rather than from the (slightly lossy, polyline-projected)
  preview point.

**Rendering — `drawScene/drawVectorEditHandlesLayer/drawVectorEditOutline/`**, promoted from a single
flat file to its own folder once it grew a second, unrelated `if`-branch (the "ifologia" split rule,
[[xigma-module-structure]] — asked for directly, "trzeba rozbić te ify na osobne funkcje"):
- `drawVectorEditOutline.ts` — thin orchestrator, calls the two pieces below in sequence.
- `drawEditModeOutline.ts` — the plain gray `VECTOR_EDIT_OUTLINE_STROKE` (`#aaaaaa`) whole-node outline,
  drawn unconditionally regardless of hover state. **Used to skip itself while the node was the
  separately-hover-outlined one** — on the assumption `drawHoverOutline.ts`'s thicker outline would always
  be covering the same shape whenever that happened. Once `drawHoverOutline.ts` was fixed to stop drawing
  its own outline for the node currently open in Vector Edit Mode (§3, above), that assumption broke: hovering
  the network *while already inside edit mode* left both outlines suppressed simultaneously — the gray
  outline vanishing exactly while the cursor sat over it, reported directly with a screenshot. Fixed by
  dropping `drawEditModeOutline.ts`'s own hover check entirely (and the now-dead `hoveredNodeId` parameter
  threaded down to it through `drawVectorEditOutline.ts`/`drawVectorEditHandlesLayer.ts`) — the two
  outlines were never meant to both react to hover independently; only `drawHoverOutline.ts`'s edit-mode
  suppression was the actual fix needed.
- `drawHoveredSegmentHighlight.ts` — draws the currently-hovered segment (`hoveredSegmentId`) a second
  time in `VECTOR_EDGE_HOVER_STROKE` (`#cd4422`) on top of the gray outline, **plus** a helper dot
  (`drawVertexPreviewDot`, reused as-is — see below) at that segment's `getSegmentMidpoint`. This dot is
  the additive "suggested insertion point" from the original ask ("dodatkowo pokazuje punkt który można
  doczepić na środku pomiędzy dwoma punktami") — it is drawn continuously for as long as *any* part of
  the segment is hovered, independent of whether the cursor has actually snapped to it yet
  (`resolveEdgePointHover`'s two-tier logic above only affects the *attraction point* and *cursor*, not
  whether this dot is drawn) — "to jest bardziej pomocniczy punkt niż ostateczny."

`drawScene/drawPenPreview/drawPenPreview.ts` renders the preview dots — never touches Vector Network
state, and is itself just a thin orchestrator: `drawPenSegmentPreview.ts` owns the rubber-band
stroke/rotation math, `drawVertexPreviewDot.ts` is the shared dot primitive both it and the bare
cursor-position case call, and each sits flat as a sibling in the `drawPenPreview/` folder (own `test/`),
split out once the single-file version accumulated too many concerns to review at a glance.
`drawVertexPreviewDot` draws a vertex-styled dot (white fill, blue border, `VECTOR_VERTEX_SIZE` — matching
a real committed vertex dot, not the larger `VECTOR_SNAP_INDICATOR_RADIUS_PX` circle an earlier version
used) at `penNewVertexPreviewRef`'s point *and* at the rubber-band's `to` endpoint, so the "where will my
next click land" dot shows continuously across every point of a session, not just the very first one —
asked for directly after the first version only showed it before the first click. This same primitive is
reused, unmodified, by `drawHoveredSegmentHighlight.ts` above for the edge-midpoint helper dot.
**There is no separate snap-indicator overlay for vertex-snap** (an earlier `penHoverVertexRef`/
`TPenHoverVertex` ref+type existed solely to draw one, removed in full — asked for directly, "usuń
wskaźnik, zostaw samo przyciąganie") — the vertex attraction is only visible as the rubber-band's endpoint
(and its dot) jumping onto the nearby vertex, not as an extra circle drawn around it. Edge-hover is the
one exception to "attraction only, no extra visual": the segment highlight stroke *and* the midpoint
helper dot above **are** a deliberate second and third visual (Figma parity, asked for directly), not a
snap-indicator circle around a point.

## 5. Escape — 3-stage exit

`useToolbarShortcuts/utils/handleLeave.ts`, the one existing global Escape handler, became state-aware
(reads `store.getState()` fresh) instead of gaining a second listener:

1. `penActiveVertexId !== null` → clear it only. Stays in Pen, same network.
2. else `vectorEditingNodeId !== null && activeTool === pen || pencil` → `setActiveTool(default)` only.
   Vector Edit Mode persists. **Gated on `vectorEditingNodeId`, not just the active tool** — selecting
   Pen and pressing Escape with nothing drawn yet must fall straight through to stage 4 (the user's own
   spec: "jeśli wybierzemy pen i klikniemy escape to działa tak jak zawsze"), not stop here with a
   half-original response that resets the tool but leaves the old selection/comment-draft untouched.
3. else `vectorEditingNodeId !== null` → clear it (exit edit mode; node stays selected).
4. else → original unconditional behavior (deselect all, reset tool, cancel comment draft).

## 6. Vector Edit Mode — new `useSelectionTool` resolvers, not a parallel tool

New entries in `handlePointerDown/constants.ts`'s `ARM_RESOLVERS` (highest priority, before resize/hit —
`armResolvers.ts`):

- `armVectorHandleOnPointerDown` / `continueVectorHandleDrag` / `disarmVectorHandleDrag` — drag a
  tangent dot (`getVectorHandleAtPoint.ts`); mirrors the paired segment's tangent via
  `getMirroredVectorSegments.ts` when the vertex's mode calls for it.
- `armVectorVertexOnPointerDown` / `continueVectorVertexDrag` / `disarmVectorVertexDrag` — select
  (`selectedVectorVertexIdsRef`, single-vertex only — see §7) and drag a vertex; dispatches `updateNode`
  every `pointermove` like an ordinary node move, so no ref-lifting needed for the render loop to see it
  live.
- **Edge-splitting is Pen-only, not a Move-tool resolver.** `armVectorEdgeInsertOnPointerDown.ts`
  originally lived here (click a segment's stroke away from either endpoint — `getVectorEdgeAtPoint.ts`
  — to split it, one-shot `updateNode`, no drag state) and fired regardless of active tool. Removed
  from `ARM_RESOLVERS` and the file deleted outright — Figma only allows edge-splitting with the Pen
  tool active, so this stayed a Move-tool affordance too long. The split math itself moved to
  `useDrawPenTool/utils/handlePointerDown/splitVectorSegment.ts` — proper De Casteljau subdivision
  since §12, not just a visually-reasonable approximation — and is now called from two Pen-tool sites:
  `startVectorFragment.ts` (Pen idle, no active
  vertex — clicking an edge splits it and arms the new vertex as `penActiveVertexId`, ready for
  immediate extension, same as clicking empty canvas would) and
  `continueVectorNetwork/closeLoopOntoEdge.ts` (Pen mid-extension — clicking an edge splits it **and**
  connects the active vertex to the new split point via a fresh segment, then clears
  `penActiveVertexId` exactly like `closeLoopOntoVertex.ts` closing onto an existing vertex — "attaching
  a line by extending it onto an existing edge" is the same gesture as closing a loop, just onto a
  freshly-created point instead of a pre-existing one).
- Entry without Pen: `useVectorEditOnDoubleClick.ts` mirrors `useTextEditOnDoubleClick.ts`'s shape
  exactly — double-click a `NodeType.vector` node on the Selection tool sets `vectorEditingNodeId`. Entry
  itself never touches `rotation` — a rotated node can be entered and left again with the selection
  outline still tilted, as long as nothing was actually dragged.
- `armBakeVectorRotationOnPointerDown.ts` — first entry in `ARM_RESOLVERS` (ahead of every other Vector
  Edit Mode resolver below), and the only one that never claims the pointer event (always returns
  `undefined`, letting whichever resolver actually matches the click still run). On every pointerdown
  while `vectorEditingNodeId` points at a node with a non-zero `rotation`, it permanently folds that
  rotation into `vertices`/`segments` and resets it to `0` (`bakeVectorNodeRotation.ts`) *before* any
  hit-testing below runs — vertex/handle dragging reads/writes raw coordinates with no rotation
  awareness, so an actual edit must always start from a rotation-free node. This is deliberately deferred
  to the first pointerdown *inside* edit mode, not entry, so merely looking at a rotated node in Vector
  Edit Mode and leaving again doesn't reset it. `drawVectorEditHandlesLayer.ts` applies the same
  `bakeVectorNodeRotation.ts` transform for **display only** (no dispatch) before drawing vertex dots and
  tangent handles, so they track the shape's true rotated position even in the brief window before any
  bake has actually landed in the store. **Known, accepted trade-off**: once a rotated node's rotation is
  baked, `drawPerNodeSelectionOutlines.ts`'s vector-node outline (§3) can no longer render a tilted
  rectangle for it — that outline gets its tilt from `bounds` (the node's *raw, pre-rotation* local box)
  drawn together with `node.rotation`; once baked, `bounds` is recomputed from the now-rotated vertices
  (their axis-aligned bounding box, wider than the original tilted rectangle) while `rotation` reads `0`,
  so the box renders un-tilted. Deliberately accepted rather than fixed, since avoiding it would mean
  either never baking (bringing back the vertex-jump bug below) or computing a true minimum-area bounding
  rectangle from the point set — real added complexity for what's just a selection-outline cosmetic.
- **Pen tool has its own, separate bake call** — `useDrawPenTool/utils/handlePointerDown/handlePointerDown.ts`
  doesn't go through `ARM_RESOLVERS` (§4) at all, so `armBakeVectorRotationOnPointerDown.ts` above never
  fires for it. It carries its own equivalent, `bakeEditingNodeRotation.ts` (same folder), called at the
  top of every Pen pointerdown before `startNewVectorNetwork`/`startVectorFragment`/`continueVectorNetwork`
  run — same guard (`node.rotation` truthy), same `bakeVectorNodeRotation.ts` call, same dispatch shape.
  Necessary because those three handlers read/write vertex coordinates in raw local space exactly like the
  Selection-tool resolvers do; without this, drawing new points onto a rotated, not-yet-baked network
  reproduces the same per-frame vertex-jump instability that motivated baking in the first place, for the
  Pen-tool path specifically.
  `drawScene/drawPenPreview/drawPenPreview.ts` (§4's live preview) is the one renderer that still has to stay
  rotation-*aware* rather than relying on baking alone: its rubber-band line/dot update on every
  `pointermove`, including the window *before* any pointerdown (hence bake) has happened, so it reads
  `node.vertices` while `node.rotation` may still be non-zero — it applies the same
  `bakeVectorNodeRotation.ts`-style pivot rotation as `drawVectorEditHandlesLayer.ts` (display-only, no
  dispatch) so the preview lands on the visually-rotated vertex instead of the raw local one. Don't
  remove this thinking it's now dead code just because pointerdown bakes — the hover window before that
  first click is exactly when it's load-bearing.
- Continuing via Pen from inside Edit Mode falls out for free — `useDrawPenTool` only checks
  `activeTool === pen`, and `vectorEditingNodeId` already persists across the tool switch (§5), so
  pressing `P` again resumes on the existing network with no extra wiring.
- Delete/Backspace (`Canvas/hooks/useDeleteShortcut/`, new — **no generic "Delete removes selected
  node(s))" feature existed anywhere in the app before this**, so this hook covers both: with a vector
  vertex selected, removes it + every incident segment; otherwise deletes the whole selected node(s).
  Lives in `Canvas.tsx`'s own tree (not `useToolbarShortcuts`, which is mounted at `DesignPage` level)
  specifically because it needs `refs.selectedVectorVertexIdsRef`, a `TCanvasRefs` ref inaccessible from
  there — same reasoning that kept `vectorEditingNodeId`/`penActiveVertexId` in Redux instead (§4).
- **An abandoned, still-empty vector node is auto-deleted the moment its edit session fully ends** —
  place one point, back all the way out (Escape ×3, per §5) without ever drawing a segment, and the
  node disappears instead of leaving a permanent, invisible, zero-segment node behind. `isEmptyVectorNode.ts`
  (`store/design/utils/`) is the predicate — `node.type === NodeType.vector && Object.keys(node.segments)
  .length === 0`, true for the fresh one-vertex-no-segments node `startNewVectorNetwork.ts` (§4) creates
  on the very first click. Wired into **every** place `vectorEditingNodeId` can transition away from a
  node, so it fires regardless of which exit path was used:
  - `handleSetVectorEditingNodeId.ts` — the `setVectorEditingNodeId` reducer itself now diffs old vs. new
    payload; if the *previous* id resolves to an empty vector node, `handleDeleteNode.ts` runs before the
    field updates. Catches the two exits that dispatch this action directly with no accompanying
    `setSelection`: Escape's 3rd stage (§5) and `useVectorEditOnDoubleClick.ts`'s empty-space exit (§6
    above) — neither of those touches `selectedIds`, so nothing else would have caught them.
  - `handleSetSelection.ts` — the *other* way `vectorEditingNodeId` can clear, as a side effect of
    selecting something else (e.g. clicking a different node) rather than a direct `setVectorEditingNodeId`
    call (see "Selecting a different node..." above). Split into two named steps for this reason
    (`deleteDegenerateDeselectedNodes` / `exitVectorEditingIfNeeded`): the second one now runs the same
    `isEmptyVectorNode.ts` check right before nulling `vectorEditingNodeId`. The first step is unrelated
    but pre-existing — it already auto-deletes a *deselected*, fully-cut-away ellipse arc
    (`isFullyCutAwayEllipse`) the same way; `isEmptyVectorNode.ts` was added as a second condition
    alongside it, the established precedent for "auto-clean a degenerate node on the way out" in this file.
  - **Never fires while the node still has any segment** — both call sites check the *specific node being
    exited*, not "any empty vector node anywhere," so continuing to draw a second, still-unconnected
    fragment vertex onto an already-populated network and backing out leaves the whole node (and its
    existing segments) untouched; only a node with zero segments *overall* is ever deleted, matching "jeśli
    mamy wektor... nie możemy usunąć jeśli jakiś wektor jest" (asked for directly).

## 7. Explicit scope trims (flagged, not silent)

- ~~Cross-object connecting/merging is out of scope~~ — **still true for the Pen tool specifically**
  (Pen/its own click-to-close-a-loop only ever snaps to vertices of the one network currently open,
  `vectorEditingNodeId`, never a different object's — that part of the original decision stands
  unchanged), but a **separate, later feature implements it for Vector Edit Mode's vertex** *drag*,
  including across two different shapes — see §46.
- ~~Single-vertex selection only~~ — **implemented**: shift-multi-select and marquee-select of
  vertices/handles, plus multi-drag, all landed as part of §9-11's work; `selectedVectorVertexIdsRef`
  now holds any number of ids. See §20 for segment selection, which followed the same shift-toggle shape.
- **Solo rotate and solo resize both work, including on an already-rotated node** —
  `getResizeHandleAtPoint.ts`/`getRotateHandleAtPoint.ts` no longer exclude `NodeType.vector`; both fall
  through to the same generic single-node branch every box node uses (`getNodeBounds.ts` + `node.rotation`,
  §1). Rotating a single vector node keeps `rotation` fully live across repeated gestures, exactly like a
  box node: `armRotateDrag.ts` records the origin's raw `rotation`/`vertices`/`segments` **unchanged** at
  arm-time (no baking), and `getRotatedNodeChanges.ts`'s single-node vector branch sets
  `rotation: origin.rotation + deltaDegrees`, leaving vertices/segments untouched — the same
  accumulate-onto-the-live-value shape `rotateShapeNodeOrigin.ts` already used for every other node type.
  **This replaced an earlier version that baked the origin's rotation into vertices and reset the field
  to just `deltaDegrees` on every new gesture** (arming the *next* drag re-baked from there again). That
  was mathematically equivalent for the shape's own fill/stroke (baked-vertices-at-30° + `rotation: 0` at
  drag-start renders identically to raw-vertices + `rotation: 30`), but not for
  `drawPerNodeSelectionOutlines.ts`'s vector-node outline rectangle, which derives its tilt from `bounds`
  (the *raw, pre-rotation* local box) drawn together with `rotation` — once a gesture baked the vertices,
  `bounds` recomputed from them became the shape's axis-aligned bounding box instead of the original tight
  local one, so grabbing the rotate handle a second time made the outline visibly snap toward looking
  un-tilted the instant the drag started, before the user had moved the pointer at all. A **group** rotate
  still needs to fully bake (below) since a shared external pivot can't be expressed as a live `rotation`
  field alone; that baking now happens lazily inside `getRotatedNodeChanges.ts`'s group branch (folding in
  `origin.rotation` around the origin's own bounds-center first, via the same `bakeVectorNodeRotation.ts`
  — now typed to accept a `{rotation, segments, vertices}` origin snapshot, not just a full `TVectorNode`
  — then rotating the result around the external pivot), rather than `armRotateDrag.ts` baking every
  selected vector node unconditionally at arm-time regardless of whether the drag turns out solo or group.
  Resizing a single vector node reuses the exact same rotated-anchor-solve a rotated box gets
  (`continueResizeDrag.ts`'s `getSingleRotatableOrigin` now admits a vector origin carrying its live
  `rotation`, feeding the shared `getResizeQueryPoint.ts`/`getResizeAnchorSolver.ts` pipeline unchanged —
  neither reads anything box-specific off the origin, only `.rotation`). Since a vector has no single
  `x/y` position to solve for, `resizeVectorNode.ts` scales vertices anchor-relatively as before, then
  (only when a `rotatedAnchorSolver` is present) computes the delta between the scaled shape's own new
  bounds-center and the solver's target center, and translates every vertex by that delta — left
  unrounded, exactly like a rotated box's `x`/`y` (`getResizeChanges.ts`), to avoid reintroducing anchor
  drift through rounding.
- **Group rotate/resize/move stay exactly as before** (your call, asked directly — solo behavior was the
  ask) — `resizeVectorNode.ts` grew the solo-only anchor-correction step above, but a group resize's
  `rotatedAnchorSolver` is always `null` (only a true single-node selection gets one), so it takes the
  same plain anchor-relative scale path it always has; `getVectorNodeOrigin.ts`/`rotateVectorNodeOrigin.ts`/
  `translateVectorVertices.ts` are untouched. A group rotate always fully bakes into vertices (any
  pre-existing solo `rotation` gets folded in first, same `bakeVectorNodeRotation.ts` step as Vector Edit
  Mode entry) because the group's shared pivot generally isn't the node's own center, so the
  set-`rotation`-live shortcut above doesn't apply there.
- **No freehand Pencil** — `ToolName.pencil`'s toolbar entry stays exactly as wired before this feature
  (icon/shortcut/cursor only); only the click-based `ToolName.pen` flow is implemented. Freehand would
  need stroke-sampling + curve-fitting, a different algorithm the spec never described.
- **Stroke end caps** — explicitly deferred (asked directly).
- ~~No "pull a fresh handle out of a corner point" in Vector Edit Mode~~ — **implemented**, see §9.
- ~~No standalone "select just an edge, delete only it" interaction~~ — **implemented**, see §20:
  a segment can be selected (single, shift-multi, or dragged-as-a-group), hovered, and deleted on its
  own, independent of vertex selection.

## 8. Undo/redo — built as this feature's own foundation

No history mechanism existed anywhere before this (confirmed — ROADMAP Etap 11 was unstarted). See
`design-store-architecture.md` §8 for the full mechanism (`store/history/`); the short version: a
`beginHistoryGesture()`/`endHistoryGesture()` pair wraps `useSelectionTool`'s pointerdown/pointerup
orchestrators (and `useDrawPenTool`'s own pointerdown/pointerup) unconditionally — cheap enough to fire
on every gesture regardless of what it turns out to be, since the middleware only actually pushes a
snapshot the first time an undoable action (`addNode`/`updateNode`/`deleteNode`) fires inside an open
gesture, coalescing an entire drag into one entry.

**Segment/vertex/tangent-handle selection now round-trips through undo/redo too.** `selectedVectorVertexIdsRef`/
`selectedVectorSegmentIdsRef`/`selectedVectorHandlesRef` (§20 below, §"Vector Edit Mode" resolver notes)
live entirely in `TCanvasRefs`, outside Redux — undo/redo originally only restored the Redux document
(`nodes`/`rootOrder`/`selectedIds`), so undoing a vertex/segment-affecting mutation left these three refs
holding whatever they'd been cleared/set to by the delete/drag itself, with no relationship to the
restored document. Concretely: select two vertices, delete them, undo — the vertices came back, but
nothing re-selected them, and worse, nothing guaranteed the ids sitting in the refs still existed
post-undo (a dangling-reference risk for anything doing `node.vertices[id]`).

Fixed by widening what a history entry snapshots: `store/history/createHistoryStack.ts`'s
`THistorySnapshot = { design: TDesignSnapshot; vectorSelection: TVectorSelectionSnapshot }` — the second
half is `{ selectedVectorVertexIds, selectedVectorSegmentIds, selectedVectorHandles }`
(`types/design/canvas/types.ts`), captured from `TCanvasRefs` via `store/history/getVectorSelectionSnapshot.ts`
at the exact moment `beginHistoryGesture` is dispatched (mirroring how the design half is captured), and
written back onto the refs via `store/history/applyVectorSelectionSnapshot.ts` when a `undo`/`redo` thunk
returns a non-null result. `undo`/`redo` became thunks (not plain actions) specifically so a value could
flow back out of `dispatch(...)` to the caller — see `design-store-architecture.md` §8 for the
`extraArgument`/thunk wiring.

**The one place a vector-editing mutation could reach the middleware outside an open gesture**:
`handleDeleteSelection.ts`'s vertex/segment branches used to call the shared
`dispatchAsOneGestureIfMultiNode.ts` helper, which only opened a gesture bracket when 2+ nodes owned the
selection (an optimization — a single dispatch needs no bracket to become one undo entry). Since my
capture point is `beginHistoryGesture` itself, that single-owning-node path had no capture point at all.
Fixed by giving these two branches their own explicit, unconditional `beginHistoryGesture(getVectorSelectionSnapshot(refs))`
/ `endHistoryGesture()` bracket instead, capturing the pre-delete selection right before it's cleared two
lines later anyway — behaviorally inert for the design-snapshot push count (still exactly one entry
either way), it only adds the missing vector-selection capture. `dispatchAsOneGestureIfMultiNode.ts`
itself gained an optional 4th `vectorSelection` param (default `EMPTY_VECTOR_SELECTION_SNAPSHOT`) purely
so its own remaining `beginHistoryGesture()` call still compiles — its other 5 call sites (all vector-drag
commits, all already nested inside `useSelectionTool`'s own outer pointerdown-bracketed gesture) don't
need one of their own.

**Gotcha that nearly sank this feature, worth knowing before touching `handleReplaceDesignSnapshot.ts`
or `useVectorEditOnDoubleClick.ts` again**: the restore mechanism above worked correctly in isolation
(proven via direct instrumentation — the refs held the right ids immediately after
`applyVectorSelectionSnapshot` ran) but the moment React flushed the following re-render, the selection
was gone again. Root cause: `handleReplaceDesignSnapshot.ts`'s `vectorEditingNodeIds =
vectorEditingNodeIds.filter(...)` always produced a *new* array, even when nothing was actually pruned;
`useVectorEditOnDoubleClick.ts`'s own cleanup effect depends on that array by reference
(`useSelector(selectVectorEditingNodeIds)`) and unconditionally wipes all three vector-selection refs on
every dependency change — so **every** undo/redo (not just ones that changed which node is open) was
tripping that "switched to a different node" cleanup and erasing the just-restored selection one render
later. Fixed at the source: `handleReplaceDesignSnapshot.ts` now only reassigns `vectorEditingNodeIds`
when the filtered result's length actually differs, keeping the same array reference (and therefore the
same `useSelector` identity, and therefore no spurious effect re-run) on the common no-op path.

## 9. Corner-pull handles, the render-only default tangent preview, and handle styling/hover

Landed as a follow-up round after §6-8, closing the "pull a fresh handle out of a corner point" gap
§7 used to flag as unimplemented, plus a Figma-parity pass on how tangent handles look and default.

**Ctrl/Cmd+drag pulls a fresh handle out of a plain corner vertex.** `armVectorCornerHandleOnPointerDown.ts`
(`ARM_RESOLVERS`, between `armVectorHandleOnPointerDown` and `armVectorVertexOnPointerDown` — existing-handle
drag still wins, plain vertex-move still wins when the modifier isn't held) fires only when
`event.ctrlKey || event.metaKey` (macOS Cmd resolves through `metaKey`, same as `useCommentDraftKeyDown.ts`'s
submit shortcut — deliberately a plain OR check here, not the keyboard-shortcut system's
`CONTROL_PRIMARY_KEY`/`primaryKeys` machinery, since that's for `KeyboardEvent`s matched against a `keysMap`,
not a raw pointer-event modifier read). `getVectorCornerHandleAtPoint.ts` (`Canvas/utils/`) hit-tests the
*vertex* itself (not an existing handle dot), then picks whichever touching segment-end still has a null
tangent (falling back to the first touching segment if both already have one, e.g. re-dragging). Once armed,
it reuses `armVectorHandleDrag`/`continueVectorHandleDrag`/`disarmVectorHandleDrag` **unmodified** — the only
new code is the hit-test and the resolver; the drag mechanics are identical to dragging an already-real
handle. `getMirroredVectorSegments.ts` was extended so a vertex's *other* segment-end can now be mirrored
into even when it doesn't have a tangent yet (`getOtherHandlesAtVertex` no longer filters out null tangents;
`getMirroredTangent`'s length falls back to the dragged handle's own length when the other side has nothing
to preserve) — so pulling a handle out of a true mid-path corner (two segments, both null) now yields a
symmetric pair from the first drag frame, matching Figma's "pull a fresh pair of handles" behavior; pulling
from a path *endpoint* (one segment) just shapes that one segment, no mirroring target exists.

**The default tangentStart preview is render-only — it never touches the store until dragged for real.**
The first attempt at "show a curve handle at the segment's start vertex too, not just where you dragged"
actually wrote a computed default into `segment.tangentStart` from `updateVectorHandleDrag.ts` (the Pen
tool's own click-drag-to-shape-a-curve path) — reverted after real testing, because writing a real value
there **changes the rendered curve's shape** the instant a default gets applied (`flattenSegment` uses
both tangents unconditionally once either is non-null), which is not what "just show me where I *could*
grab a handle" is supposed to do. The fix moved the default entirely into the *rendering/hit-testing*
layer: `getEffectiveTangentStart.ts` (`utils/canvas/vectorNetwork/`) returns the segment's real
`tangentStart` if one exists, otherwise derives a preview value from `tangentEnd` alone — direction aimed
at the same shared control point `tangentEnd` implies (`(end - start) + tangentEnd`, i.e. the point where
`start + tangentStart` and `end + tangentEnd` would coincide if both control points were literally the same
point — the "grab a straight line at one spot and pull it into an arc" construction), length capped to
`VECTOR_DEFAULT_TANGENT_PREVIEW_RATIO` (`0.5`, `constant/canvas.ts`, renamed from `..._START_RATIO` once §10
made the same preview construction symmetric for the `tangentEnd` side too) of `tangentEnd`'s own length so the
preview handle's dot never lands exactly on top of the real `tangentEnd` handle's dot. `segment.tangentStart`
itself is never written by this — `drawVectorTangentHandles.ts` and `getVectorHandleAtPoint.ts` both call
`getEffectiveTangentStart` instead of reading `segment.tangentStart` raw, so the preview is simultaneously
visible *and* grabbable (dragging it runs through the completely ordinary `armVectorHandleOnPointerDown` →
`continueVectorHandleDrag` path, which writes a real value the moment a real drag starts) without ever
perturbing the actual curve on its own. Two things this section replaced along the way, worth knowing if
this code looks like it should be simpler: an earlier version tried "continue the direction of whatever
segment precedes this vertex, scaled to that segment's own length" — dropped for being both more complex
(needs a third segment lookup, a not-a-predecessor fallback) and visibly wrong once tested (the real
requirement was matching `tangentEnd`'s own direction/shared-point, not the unrelated incoming segment).

**Handle styling**: `drawTangentHandle.ts` (own file, `drawVectorTangentHandles/` — promoted from a flat
`drawVectorTangentHandles.ts` once it grew this per-handle helper, same "ifologia" folder-promotion rule
as `drawScene/`) draws the connecting line in `VECTOR_EDIT_OUTLINE_STROKE` (the same gray as the Vector Edit
Mode connection outline — **not** `VECTOR_HANDLE_FILL` blue and **not** the node's own `strokeColor`, both
tried and rejected: "kolor przyjmuje ten domyślny jak kontur który przedstawia połączenie") and the handle
dot as a diamond — `drawRect` with `rotation: 45` (a square rotated 45° is a diamond by construction, no
dedicated diamond primitive needed), white fill (`VECTOR_VERTEX_FILL`)/blue border (`VECTOR_HANDLE_FILL`),
sized `VECTOR_VERTEX_SIZE` to match the plain vertex dots. **Hover** state (`VECTOR_HANDLE_HOVER_STROKE`,
`#a6cef7`) recolors only the *line*, not the dot — the dot instead enlarges by `VECTOR_VERTEX_HOVER_SCALE`
(same factor vertex-dot hover already uses) with its own fill/border colors untouched ("kwadrat nie
dotykamy jego kolory zostają"). Hover detection is a new resolver, `resolveVectorTangentHandleHover.ts`
(`useSelectionTool/utils/handlePointerMove/`, mirrors `resolveVectorVertexHover.ts` exactly, called right
after it), writing into a new `TCanvasRefs` ref, `hoveredVectorHandleRef` (`TVectorHandleHover | null =
{end, segmentId} | null`) — reuses `getVectorHandleAtPoint` for the hit-test, so hovering a still-default
preview handle highlights it too, consistent with it already being grabbable.

**Gotcha, shipped-and-fixed — a stale rubber-band line pointing at the just-placed vertex during an active
drag.** `handlePointerMove.ts` (Pen tool) branches on `dragOriginRef.current`: while a drag is in progress
it only calls `updateVectorHandleDrag` (shapes `tangentEnd`), never `updateVectorPenPreview` (the "next
click" rubber-band, which only runs in the hover branch) — but `drawPenPreview.ts` still renders whatever
`penPreviewRef.current` last held, unconditionally, every frame, regardless of drag state. Since nothing
cleared it at the moment a new vertex got placed, the rubber-band from the *previous* hover (pointing from
the prior vertex to right where you just clicked, i.e. now the newly-placed vertex) kept rendering as a
straight line underneath the real curve+handle visuals for the whole drag. Fixed with one line —
`useDrawPenTool.ts`'s `onPointerDown` sets `penPreviewRef.current = null` before delegating to
`handlePointerDown` — since a fresh click always makes the old rubber-band stale one way or another (either
a new drag starts, shaping a real tangent instead, or the loop closes and `penActiveVertexId` clears,
which the hover branch already self-clears on the very next `updateNewVertexPreview` call).

**Live mirrored drag-preview handle — a third, render-only diamond that literally follows the cursor.**
`updateVectorHandleDrag.ts` writes the incoming segment's `tangentEnd` as `{-dx, -dy}` (mirrored *away*
from the cursor, §4) — correct for the committed curve, but it means nothing ever showed a handle on the
cursor's own side while dragging. Since the mirror of that mirror is trivially the cursor itself
(`vertex + (dx, dy) = vertex + (point - dragStart) = point`), a fourth ref, `penDraggedHandlePositionRef`
(`TCanvasRefs`, parent-owned like `ellipseArcDragRef`'s `draggedHandlePosition` — the render loop needs
to read it every frame), is set to the raw `point` alongside `tangentEnd`/`pendingOutgoingTangentRef` in
`updateVectorHandleDrag.ts`, and cleared the instant the gesture ends: in `handlePointerUp.ts`/
`handlePointerCancel.ts` (immediate, no extra `pointermove` needed) and defensively in
`handlePointerMove.ts`'s hover branch (`dragOriginRef.current` falsy) for any other path back to idle.
`drawVectorTangentHandles.ts` draws it via a small `drawPenDragHandlePreview` helper (same file, not
promoted to its own module) — reuses the existing `drawTangentHandle` primitive unmodified, from
`node.vertices[penActiveVertexId]` to `penDraggedHandlePosition`, so it looks identical to a real
tangent-handle line/diamond even though it's never written to `segment.tangentStart`/`tangentEnd` and
disappears the moment the drag ends (asked for directly: "tymczasowo rysować tangen odbity w stronę
kursora... Potem tangen ten przy kursorze ginie").

## 10. Tangent-handle visibility — hidden unless a selected vertex directly touches or one-hops to a segment

Landed as a follow-up after §9 shipped a click-and-drag mirrored preview — tangent handles used to render
for **every** segment of the edited network unconditionally (`drawSegmentTangentHandles.ts` drew both ends
regardless of any selection state), which cluttered any network with more than a couple of curved segments.
Went through three real rounds of live user correction before landing on the final rule below — each round's
"fix" turned out to satisfy one confirmed case while breaking another, until the two rules were finally kept
**separate** instead of collapsed into one. Worth reading the whole arc if touching this code again, since
the two rules look almost redundant at a glance but aren't.

**The final rule, confirmed directly against concrete screenshots for both halves:**
1. **A segment directly touching a selected/active vertex always reveals *both* its ends** — "Tak, zawsze —
   dla każdego segmentu dotykającego P" (yes, always, for every segment touching P), confirmed against a
   real curve where the selected vertex is one of the segment's own two endpoints: own handle *and* the
   far/neighbor handle on that same segment both show, regardless of whether that segment is straight or
   curved. A branch vertex with several segments (a "starburst") reveals one pair per touching segment, all
   at once — this is what "one hop, both directions" meant in the very first request for this feature.
2. **A segment reached only through a one-hop *straight* corridor reveals *only* the corridor-connected
   end** — not the far end of that segment too. Concretely: `A --plain click, straight--> B --click-drag,
   curve--> C`, selecting `A`: `B`'s own handle on the `B`–`C` segment shows (Figma parity — the straight
   corner is transparent, so `B` counts as reached), but `C`'s own handle does **not**, since `C` is two
   conceptual hops from `A` and `B`–`C` never directly touches `A`. Confirmed directly: "Ma być tylko tangen
   tego pierwszego a pokazuje dwa" (there should only be the first one's tangent, but it shows two).

**Why these can't be merged into a single "OR over one expanded set" check** (the mistake made twice before
landing here): if you fold rule 2's one-hop set into the *same* vertex-id list rule 1's "either end in the
set → show both ends" checks against, a corridor-reached vertex (`B` above) — now sitting in that combined
set purely because it's one hop from `A` — makes rule 1 fire for **`B`'s *other* segment** too, revealing
its far end (`C`'s handle) as an unwanted side effect. This is exactly the regression reported as "teraz
patrzy o jeden za daleko" (now it looks one too far) after the first attempt to reuse one shared set. The fix
is keeping **two separate id lists** and checking both, not merging them:

- `selectedVertexIds` — the literal selection (`visualSelectedVertexIds`: real selection + `penActiveVertexId`,
  see below) — used **only** for the "does this segment directly touch the selection" check
  (`isVectorSegmentEndpointSelected.ts`, `utils/canvas/vectorNetwork/`: `(segmentStartId, segmentEndId,
  selectedVertexIds) => selectedVertexIds.includes(segmentStartId) || selectedVertexIds.includes(segmentEndId)`) —
  when true, **both** ends are visible, full stop.
- `oneHopVertexIds` (`getOneHopVectorVertexIds.ts`, `utils/canvas/vectorNetwork/`) — the selection expanded by
  one hop, but **only** through segments carrying no tangent at all (`!segment.tangentStart &&
  !segment.tangentEnd` — a real curve is an opaque boundary the expansion never crosses, a plain corner is
  transparent to it) — checked **per end, independently** (`oneHopVertexIds.includes(segment.startId)` /
  `...endId`), *only* as a fallback when rule 1 didn't already make the segment visible.

Combined per end: `isStartVisible = isSegmentDirectlyTouchingSelection || oneHopVertexIds.includes(segment.startId)
|| isStartHandleItselfSelected` (and the mirror for `isEndVisible`). `drawSegmentTangentHandles.ts` and
`getVectorHandleAtPoint.ts` both compute it this exact way, taking `selectedVertexIds` **and**
`oneHopVertexIds` as two separate parameters (not one pre-merged list) — `drawVectorEditHandlesLayer.ts`,
`armVectorHandleOnPointerDown.ts`, and `resolveVectorTangentHandleHover.ts` each compute
`oneHopVertexIds = getOneHopVectorVertexIds(node, visualSelectedVertexIds)` once and pass both down. The
"handle itself selected" exception is layered on top of this at each call site, since that part is
genuinely per-end, never per-segment.

- **The Pen tool's still-active vertex counts as "selected" too, matching §3/§9's live-drawing UX.**
  `drawVectorEditHandlesLayer.ts` already computed `visualSelectedVertexIds` (real selection +
  `penActiveVertexId`, when set) for vertex-dot rendering; the same merge is a named helper,
  `getVisualSelectedVectorVertexIds.ts` (`utils/canvas/vectorNetwork/`), reused by the renderer **and** by
  `armVectorHandleOnPointerDown.ts`/`resolveVectorTangentHandleHover.ts` before they call
  `getVectorHandleAtPoint`. This matters concretely: `penActiveVertexId` persists across a tool switch away
  from Pen (§4) with nothing in `TCanvasRefs` ever mirroring it into `selectedVectorVertexIdsRef` — so
  without this merge, a handle shaped mid-draw and left as-is after switching to the Selection tool would
  render (correctly, via the renderer's own merge) but be un-draggable (hit-test only seeing the empty ref),
  a visible-but-dead control. Feeding the same merged set into both layers is what keeps that handle
  interactive immediately after the tool switch, matching `e2e/design/vector/vector-edit.spec.ts`'s "dragging
  an existing tangent handle" test, which grabs a just-drawn handle right after switching off Pen with no
  intervening vertex click.
- **The default-preview mechanism (§9) is now symmetric — `getEffectiveTangentEnd.ts` mirrors
  `getEffectiveTangentStart.ts`.** Originally one-directional (a real `tangentEnd` could derive a preview
  `tangentStart`, never the reverse), which meant a segment authored with only a real `tangentStart` had
  *no* handle position at all on its `tangentEnd` side — not merely hidden, genuinely absent — so selecting
  the far vertex of such a segment had nothing to reveal. `getEffectiveTangentEnd.ts` (`utils/canvas/vectorNetwork/`)
  is the exact mirror (`start`↔`end`, `tangentStart`↔`tangentEnd` swapped throughout), and
  `drawSegmentTangentHandles.ts`/`getVectorHandleAtPoint.ts` both call it for `handleEnd` instead of reading
  `segment.tangentEnd` raw, same non-destructive preview-only contract as the original. The shared ratio
  constant was renamed `VECTOR_DEFAULT_TANGENT_PREVIEW_RATIO` (was `..._START_RATIO`) since it now scales
  a preview in either direction, not just the start one.

## 11. Gotcha, shipped-and-fixed — a stale `pendingOutgoingTangentRef` surviving an Escape-interrupted fragment

Reported directly, with before/after screenshots: click-drag to curve a segment, press `Escape` (stage 1,
§5 — clears only `penActiveVertexId`, ends the fragment), then click straight back onto that same vertex to
resume drawing from it. The very next `pointermove` (or even the resuming click itself, if the pointer moved
at all between down and up) instantly rendered — and would commit — a brand-new curved tangent the user never
dragged for, "wchodzi w tryb robienia kolejnego tangentu" (enters the mode of making another tangent) purely
from a plain click, and the effect felt wildly oversensitive to the tiniest cursor movement ("bardzo
wrażliwe są te łuki").

**Root cause: `pendingOutgoingTangentRef` (§4, hook-local to `useDrawPenTool`, never lifted to `TCanvasRefs`)
is only ever cleared when a segment actually commits** (`extendWithNewVertex.ts`/`closeLoopOntoVertex.ts`/
`closeLoopOntoEdge.ts`, inside `continueVectorNetwork/`) — nothing clears it when a fragment merely *ends*
without committing anything further: not Escape (dispatches a plain Redux `setPenActiveVertexId(null)`, with
no way to reach a ref private to a different hook instance's closure), not switching tools, not
`startVectorFragment.ts`'s own `hover` branch (resuming an *existing* vertex via a plain click). So the ref
kept holding `{ tangent: <the earlier drag's delta>, vertexId: <the same vertex just resumed> }` across the
entire interruption. Both consumers of this ref — `updateVectorPenPreview.ts` (idle rubber-band preview) and
`continueVectorNetwork.ts`'s `getTangentStart` (the next committed segment's `tangentStart`) — only check
`pending.vertexId === activeVertexId`, with no concept of "is this the *same drawing session* as when the
tangent was staged, or a resumed one." Resuming the exact vertex that had a staged tangent made that check
pass trivially, silently reusing stale, unrelated drag-delta math for the new session.

**Fix: `startVectorFragment.ts` now unconditionally resets `pendingOutgoingTangentRef.current = null` before
its three branches run** (`hover`/`edgeHit`/blank-canvas) — the function threads the ref through as a new
parameter (`startOrContinueVectorNetwork.ts` passes it along, already had it in scope for the sibling
`continueVectorNetwork` call). Scoped correctly: `startVectorFragment` only ever runs at the *start* of a
fragment (`penActiveVertexId === null`, per `startOrContinueVectorNetwork.ts`'s branch), never mid-fragment
— so this can't clobber the legitimate same-session carry-over `continueVectorNetwork.ts` relies on for
consecutive smooth-mirrored segments (v1→v2→v3 within one continuous draw). `startNewVectorNetwork.ts`
(brand-new node, fresh `nanoid()` vertex id) was deliberately left untouched — a freshly generated id can
never collide with a stale `pending.vertexId`, so the guard there is already unreachable and adding a redundant
clear would just be dead defensive code.

## 12. Edge-splitting via proper De Casteljau subdivision — the naive split retired

Reported directly, with screenshots: inserting a new point on an existing **curved** segment (Pen idle,
clicking mid-edge, §6) visibly kinked the curve right at the new point. `splitVectorSegment.ts` originally
did the simplest thing that could work — keep the original `tangentStart` on the first new segment,
the original `tangentEnd` on the second, and null both tangents at the newly shared vertex — which is
flagged in the git history as a deliberate simplification, not an oversight, but real testing showed the
resulting kink is visually obvious on anything but a very shallow curve, and it's a well-known, exactly
solvable problem: standard cubic Bezier subdivision.

**`splitCubicBezier.ts` (`utils/canvas/vectorNetwork/`) implements the standard De Casteljau construction**
— given the segment's absolute control points (`start`, `start+tangentStart` or `start` itself if null,
`end+tangentEnd` or `end` itself if null, `end` — the same "missing tangent's control point coincides with
its vertex" convention `flattenSegment.ts` already used for rendering, kept consistent here) and a split
parameter `t`, it computes the two new cubic curves via three rounds of linear interpolation and converts
the resulting absolute control points back into the codebase's tangent-offset representation
(`{x,y}` relative to each segment's own vertex). The defining property of this construction — unlike the
naive split — is that the union of the two output curves retraces the **exact same path** as the original,
for any `t`: no visual kink is possible by construction, not just approximated away. A fully straight
segment (`!tangentStart && !tangentEnd`) short-circuits to a plain linear interpolation of the split point
with every output tangent `null`, mirroring `flattenSegment.ts`'s own straight-line fast path — running the
full subdivision math on a degenerate (zero-length control arm) bezier does *not* reduce to "stays straight"
on its own and was verified to introduce spurious curvature before this guard was added. A resulting tangent
offset that comes out as exactly `{x:0,y:0}` (always exact, never a floating-point near-miss, since it only
happens when the corresponding input tangent was itself `null`) is reported as `null` rather than a
zero-length object, so a still-straight side of a partially-curved segment doesn't accidentally start
looking like a "real" zero-length tangent to `getEffectiveTangentStart.ts`/`getEffectiveTangentEnd.ts`'s
truthiness checks (§9, §10) — those exist specifically to derive a *preview* handle when a tangent is
genuinely absent, and a stray zero-length object would silently defeat that.

**Finding the split parameter `t` — extending the existing polyline-projection hit-test rather than adding
a second one.** `getVectorEdgeAtPoint.ts` already flattens a segment into `VECTOR_CURVE_SEGMENTS` uniform-`t`
samples and finds the closest point via `getClosestPointOnLine.ts` on whichever consecutive pair the cursor
falls nearest to (§4's edge-hover mechanism, shared verbatim). `getClosestPointOnLine.ts` was extended to
also return the local projection ratio (`{ point, t }` instead of a bare point — its only caller already
lived in this same file, so this was a safe, non-breaking signature change) and `getVectorEdgeAtPoint.ts`
combines that local ratio with the sample pair's index to recover the full-curve `t = (index + localT) /
(points.length - 1)` — dividing by the *actual* flattened point count rather than the `VECTOR_CURVE_SEGMENTS`
constant directly, since a fully straight segment's fast path only ever produces 2 points regardless of that
constant. When the hover snaps to the segment's exact midpoint (the pre-existing "suggested insertion point"
tier, §4), `t` is hardcoded to exactly `0.5` rather than whatever the polyline projection happened to
compute — matching `getSegmentMidpoint.ts`'s own construction (`flattenSegment(...,2)[1]`, the literal `t=0.5`
sample) exactly, so a snapped click and a non-snapped click landing on the same pixel don't silently split at
two different parameters.

**`splitVectorSegment.ts` now takes `t` instead of a `point`, and derives the split vertex's position from
the subdivision itself** (`split.point`) rather than from the caller's (slightly lossy, polyline-approximated)
hit-test position — the two are visually indistinguishable at `VECTOR_CURVE_SEGMENTS` resolution, but deriving
position from the same computation that derives the tangents guarantees the vertex and its handles are always
mutually consistent. Both call sites changed to match: `startVectorFragment.ts` (Pen idle) and
`continueVectorNetwork/closeLoopOntoEdge.ts` (Pen mid-extension, §6) both now thread `edgeHit.t` through
instead of `edgeHit.point`.

## 13. Point placement snaps to the half-pixel grid, not the whole-pixel one — Figma parity

Reported directly: "POint przyczepia się 1x1 px w figmie można się przesuwać o 0.5px w x i y" (the point
snaps to a 1×1 px grid; in Figma you can move by 0.5px in x and y). Scoped to **drawing** specifically
("Gdy rysuje") — placing/inserting new points with the Pen tool — not the already-unrounded post-hoc vertex
drag (`continueVectorVertexDrag.ts` never rounded at all; dragging an *existing* vertex already had full
float precision).

**`roundVectorPoint.ts` (`utils/canvas/vectorNetwork/`)** — `{ x: Math.round(x*2)/2, y: Math.round(y*2)/2 }`
— replaces the plain `Math.round(x)`/`Math.round(y)` pair at the two places `useDrawPenTool` turns a raw
`screenToWorld` position into the `point` every placement decision is built from:
`handlePointerDown/handlePointerDown.ts` (every click: new vertex, resumed vertex, edge-split hit-test) and
`handlePointerMove/handlePointerMove.ts` (the live preview position, *and* the `point` fed into
`updateVectorHandleDrag.ts`'s click-drag tangent shaping — so tangent handles shaped while placing a vertex
also gained the finer grid, not just the vertex position itself). `splitVectorSegment.ts`'s own
`Math.round(split.point.x)` (§12) was switched to the same helper for consistency — the De Casteljau split
point now also lands on the half-pixel grid rather than the whole-pixel one.

Every *downstream* consumer of these points — `startNewVectorNetwork.ts`, `startVectorFragment.ts`,
`continueVectorNetwork/extendWithNewVertex.ts` — reads `point.x`/`point.y` straight through with no rounding
of their own, so fixing it at these two upstream call sites was sufficient; nothing else needed touching.

## 14. Curve tessellation — adaptive segment count replaces the flat `VECTOR_CURVE_SEGMENTS` constant

Reported directly, with a screenshot: a large, mostly-straight arc curving sharply near one end showed
visible faceting — long straight-edge "seams" along the shallow part, and a fan of small overlapping
diamond-ish quads where the curve turns sharply. Worse the bigger the arc and the closer the zoom
("im bliżej jest zoom i większy łuk tym bardziej jest ten wektor pocięty").

**Root cause: `flattenSegment.ts` always subdivided a curve into a fixed `VECTOR_CURVE_SEGMENTS` (24)
count, uniform in `t`, regardless of the curve's actual size.** Uniform-`t` sampling doesn't adapt to
curvature or scale — a tiny curve and a curve spanning thousands of world units both got exactly 24
straight quads (`drawVectorStroke.ts`, §3: one quad per flattened point pair, no joins between them).
For a small curve 24 is plenty; for a large one each quad covers a much longer chord, so the polyline
visibly deviates from the true curve, and high-curvature regions (where equal `t` steps turn through a
much larger angle) show the worst of it — exactly the "fan of quads" artifact reported.

**Fix: `getVectorCurveSegmentCount.ts` (`utils/canvas/vectorNetwork/`) computes a segment count from the
segment's own control-polygon length** (`start→controlStart→controlEnd→end`, the same "missing tangent's
control point coincides with its vertex" convention `flattenSegment.ts`/`splitCubicBezier.ts` already use,
so this doesn't introduce a second convention) — `ceil(controlPolygonLength / VECTOR_CURVE_SEGMENT_WORLD_LENGTH)`,
clamped to `[VECTOR_CURVE_MIN_SEGMENTS, VECTOR_CURVE_MAX_SEGMENTS]` (`constant/canvas.ts`: `24`/`200`/`12`
respectively — the min preserves the exact look small curves already had, so no existing curve gets
coarser). This is **world-space, not screen-space/zoom-aware** — a deliberate scope trim: tying resolution
to zoom would need threading `viewport` into every flatten call site (several of which, like
`deriveVectorFaces.ts`, have no natural access to it and must stay deterministic regardless of the current
view), whereas tying it to the curve's actual size fixes the "większy łuk" half of the report directly and
the "bliżej zoom" half incidentally, since a curve large enough to need it at all only starts existing
past the `MIN_SEGMENTS` floor's implicit ~288-world-unit threshold (`24 × 12`) — well beyond what any of
this codebase's curve-fixture tests use, so every existing exact-point-count assertion (`deriveVectorFaces.spec.ts`,
`drawPenSegmentPreview.spec.ts`) kept passing unchanged; only real large curves get more segments.

**Replaces `VECTOR_CURVE_SEGMENTS` at all five call sites that flatten a curve for display or hit-testing**
— `flattenVectorSegments.ts` (main stroke/fill render, §3), `deriveVectorFaces.ts` (fill boundary, §2),
`getVectorEdgeAtPoint.ts` (edge hover/hit-test polyline projection, §4/§12), `drawHoveredSegmentHighlight.ts`
(§4's edge-hover highlight overlay), and `drawPenSegmentPreview.ts` (the Pen tool's live rubber-band
preview) — kept uniform deliberately: leaving even one of these on the old fixed count would make it
visibly disagree with the others on a large curve (e.g. the hover highlight not exactly overlaying the
now-smoother stroke it's supposed to trace). `getSegmentMidpoint.ts`'s own `flattenSegment(...,2)` call
(hardcoded to get exactly the `t=0.5` sample, unrelated to visual resolution) and `splitCubicBezier.ts`
(De Casteljau control-point math, takes no segment count at all) were untouched — neither one tessellates
for display.

## 15. Click-drag tangent creation now also works when resuming an existing vertex

Asked for directly, with two screenshots of the desired gesture: press on point A, drag — instead of
rubber-banding a segment toward B, this shapes a gray outgoing tangent handle at A (`VECTOR_EDIT_OUTLINE_STROKE`
gray line, per §9's `drawPenDragHandlePreview`); releasing commits that pending tangent, and *only then*
does hovering/clicking toward B draw the actual curve, in `DRAFT_FRAME_STROKE` blue
(`drawPenSegmentPreview.ts`). Point A, per the ask, can be any of three cases: starting a fresh network,
extending mid-draw onto blank canvas, or **resuming an already-placed vertex to start a new fragment from
it**.

The first two cases already worked this way — `startNewVectorNetwork.ts` and `extendWithNewVertex.ts`
(§4's `continueVectorNetwork.ts` blank-canvas branch) both unconditionally arm `dragOriginRef`/`dragStartRef`
the moment they place a point, so the very next `pointermove` while the button is still held goes through
`updateVectorHandleDrag.ts` instead of the idle rubber-band path (§4's shared resolver pipeline). The third
case — `startVectorFragment.ts`'s `hover` branch, clicking back onto an existing vertex with no active
fragment — did **not**: it only dispatched `setPenActiveVertexId` and immediately `endHistoryGesture()`,
with no drag ever armed. A click-drag from a resumed vertex fell through to the idle hover path exactly as
if the button had never been held, so no tangent could ever be shaped there. There was an explicit test
asserting `dragOriginRef.current` stayed `null` after this branch — this was a deliberate scope trim in the
original Pen tool build, not an oversight, which is why it needed calling out rather than just "fixing" —
the test itself has been rewritten to assert the drag now arms instead.

**Fix**: the `hover` branch now arms `dragOriginRef.current = { nodeId: node.id, segmentId: null,
vertexId: hover.vertexId }` / `dragStartRef.current = point`, the exact same `segmentId: null` convention
`startNewVectorNetwork.ts` uses (§4: "no incoming segment to mirror-shape yet, so that half of the drag is
a no-op" — a resumed vertex may have other segments already touching it, but there's no unambiguous
"incoming" one to pick among them, so this deliberately only ever sets up a *pending outgoing* tangent for
whatever segment gets drawn next, never mirrors into an existing one). The inline `endHistoryGesture()`
call was removed rather than kept alongside the new arm — it existed only because this branch used to be a
guaranteed no-op needing its gesture closed early; now that a drag can genuinely mutate the node
(`updateVectorHandleDrag.ts` dispatches `updateNode` past `MIN_DRAG_DISTANCE_PX`), the gesture needs to
stay open across the possible drag exactly like the other two branches already leave it, closing naturally
on the unconditional `endHistoryGesture()` in `handlePointerUp.ts`/`handlePointerCancel.ts` — a plain click
with no drag still closes on the very next pointerup either way, so nothing regresses for that path.

**A fourth case surfaced immediately after, with its own screenshot: pressing down back on the vertex
you're *currently* extending from** (`continueVectorNetwork.ts`, `penActiveVertexId` already set — not a
fresh resume, mid-fragment) **— e.g. hovering toward B with the normal blue rubber-band preview already
showing, then moving back onto the active vertex A itself and drag-shaping its tangent from there instead
of clicking away for B.** `getVectorVertexAtPoint`'s `excludeId` parameter is already passed
`activeVertexId` everywhere in this file specifically so the active vertex never satisfies its own `hover`
match (closing a loop onto the point you're extending *from* is meaningless — zero-length) — meaning a
click exactly on it always fell all the way through to the `else` branch, `extendWithNewVertex`, adding a
second, fully-overlapping vertex at the same coordinates connected by a degenerate zero-length segment.

**Fix**: a new `isOnActiveVertex` check runs *first*, ahead of the existing `hover`/`edgeHit`/blank-canvas
three-way branch (which only runs in its `else`) — a plain distance check against `node.vertices[activeVertexId]`
using the same `VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom` tolerance `findEdgeMatchOnSegment`'s own
`nearEndpoint` check already uses. When it matches, `continueVectorNetwork` arms the drag exactly like
`startVectorFragment.ts`'s hover branch above (`segmentId: null`, no mirroring — same reasoning: no single
unambiguous "incoming" segment to pick if the active vertex is a branch point) and does nothing else — no
vertex, no segment, `penActiveVertexId` itself untouched (this call never dispatches it either way; the
caller already set it when this vertex first became active). Deliberately **not** clearing
`pendingOutgoingTangentRef` first, unlike `startVectorFragment.ts`'s hover branch — that clear exists there
specifically for the Escape-interrupted-then-resumed staleness case (§11), which doesn't apply here: this
branch only ever runs *mid-fragment*, so any existing pending tangent on this same vertex is either from
earlier in this same uninterrupted session (legitimately still current) or gets overwritten the moment a
real drag exceeds `MIN_DRAG_DISTANCE_PX` regardless.

## 16. Hover affordance for a drag-armable vertex — a resolver, not a special case, and a cross overlay, not a new shape

Follow-up asked for directly, with screenshots at each step: once §15 made click-dragging from a resumed or
active vertex shape a tangent, there was no visual cue *before* the click telling you a given vertex-hover
was one of these drag-armable spots versus an ordinary vertex hover (e.g. mid-fragment, hovering a
*different* vertex to close the loop onto it — never drag-armable, §15). Went through the same
two-round-correction pattern §10 warns to expect from this codebase's history:

1. **First pass invented a brand new shape** — a hollow ring (`drawThickEllipseOutline.ts`, reusing the
   annulus primitive real ellipse-arc nodes use) sized independently of the existing dot, replacing it
   outright when drag-armable. Reported back immediately as broken — the cross inside rendered as a
   distorted "pinwheel," and more fundamentally: "Miał być ten niebieski border w środku tej białej kropki
   a w tym niebieskim krzyżyk mały pomarańczowy" (it was supposed to be that blue border in the middle of
   the white dot, and inside that blue [border] a small orange cross) — i.e. **keep the existing white/blue
   `drawVertexPreviewDot` exactly as-is, unconditionally, and only additively overlay a small cross on top
   of it**, not switch between two different shapes for two different states ("Dlaczego zrobiłeś na dwa
   różne widoki?" — why did you make it into two different views?).
2. **Fixed to exactly that**: `drawVertexPreviewDot.ts` always draws the same `drawEllipse` call it always
   did, then — only if `isDragArmable` — layers `drawDragArmableVertexCross.ts` on top, two thin
   `drawLine` diagonals in `VECTOR_EDGE_HOVER_STROKE` orange, sized as a small *fraction* of the same
   `vertexSize` the dot itself used (`CROSS_RADIUS_RATIO = 0.25`, `CROSS_STROKE_RATIO = 0.12` — no
   independent constant, so the cross always stays proportional to whatever the dot's own size is,
   including its `1 / viewport.zoom` scaling, without a second zoom division). One view, one dot, an
   optional small addition — not a second shape.

**A separate correction, asked immediately after landing the fix above: the "is this vertex drag-armable"
check lived as a hand-rolled distance test bolted directly into `updateVectorPenPreview.ts`, not as an
entry in `PEN_POINT_HOVER_RESOLVERS`** ("Czemu nie wrzuciłeś tego w resolver?" — why didn't you put this in
a resolver?) — inconsistent with §4's explicit chain-of-responsibility architecture every other hover case
in this pipeline already follows. Fixed by adding `resolveActiveVertexHover.ts`
(`resolvePenPointHover/hoverResolvers/`) as a proper resolver, first in the array (ahead of
`resolveVertexPointHover`, which structurally can never also match — it explicitly excludes
`excludeVertexId`, so the two can't double-fire on the same point) — it checks `isPointNearVertex` against
`node.vertices[excludeVertexId]` and returns a new, distinct `hoverKind: 'active-vertex'` (added to
`TPenPointHoverKind`, mapped to the same `'pen-snap'` cursor class as plain `'vertex'`). This let
`updateVectorPenPreview.ts` shrink back down to a plain resolver loop with no special-cased branch —
`penHoveredDragArmableVertexRef.current = result.hoverKind === 'active-vertex' || result.hoverKind ===
'vertex'` is now the *only* extra line needed, derived straight from the resolver's own output instead of
re-testing distance separately (the plain `'vertex'` half of that check is explained in §17 below — it
wasn't drag-armable yet at the time this section first landed).
`updateNewVertexPreview.ts` (the idle/resuming-vertex case, §15) needed no equivalent resolver — every
vertex match there (`hoverKind === 'vertex'`, `resolveVertexPointHover` with no `excludeVertexId` at all)
is already drag-armable by construction, so its existing `result.hoverKind === 'vertex'` check was already
correct and untouched by this refactor.

`isPointNearVertex.ts` (`Canvas/utils/`) is the one small shared predicate behind both the resolver above
and `continueVectorNetwork.ts`'s own pointerdown arm-check (§15) — deliberately **not** itself routed
through the resolver pipeline, since arming a drag at `pointerdown` and previewing a hover before any click
happens are different concerns (one needs a plain boolean, the other needs the full resolver
point/segmentId/hoverKind shape); only the *hover preview* half needed to join the resolver chain.

## 17. Closing onto an existing vertex is drag-armable too — the cross now covers every clickable point

Asked for directly as a follow-up once §16's cross landed: "it'd be worth having it also when we're
drawing segments and instead of placing a new point B we click on a point that already exists" — i.e. the
*closing* case, `continueVectorNetwork.ts`'s `hover` branch (mid-fragment, hovering a *different* existing
vertex than the active one). Confirmed the recommended scope directly when asked: not just the cross, but
real click-drag-to-shape-tangent behavior backing it, so the cross keeps meaning one consistent thing
("drag here to shape a tangent") everywhere it appears, rather than being a plain click-target hint in this
one spot and a drag-affordance everywhere else.

**`closeLoopOntoVertex.ts` now arms the drag** exactly like every other commit-a-segment site
(`extendWithNewVertex.ts`, §15's active-vertex/resumed-vertex cases): once the closing segment is
created, `dragOriginRef.current = { nodeId: node.id, segmentId, vertexId: targetVertexId }` /
`dragStartRef.current = point`, so a click-drag onto the target (not just a plain click) shapes that
closing segment's own `tangentEnd` via the same unmodified `updateVectorHandleDrag.ts` mirror-into-
`dragOrigin.segmentId` mechanism every other drag-armed site already uses — no new drag machinery, just a
new call site. Two things had to move to make this safe:

- **The inline `dispatch(endHistoryGesture())` was removed**, same reasoning as §15's `startVectorFragment.ts`
  fix — closing used to be guaranteed to need no further mutation, so ending the gesture immediately was
  harmless; now a drag can genuinely mutate the segment's tangent after the click, so the gesture must stay
  open across it, closing naturally on the unconditional `endHistoryGesture()` in `handlePointerUp.ts`/
  `handlePointerCancel.ts` instead.
- **The already-connected duplicate-segment guard (`isAlreadyConnected`) now also skips arming the drag**,
  not just skips creating the segment — if `A`/`B` are already directly connected, closing is a no-op
  beyond clearing `penActiveVertexId`, and there's no real segment id left to mirror a drag into (arming one
  anyway would silently mutate a stale/wrong segment on the next `updateVectorHandleDrag` call).

**The hover-preview side needed one line, not a new resolver**: `updateVectorPenPreview.ts`'s
`penHoveredDragArmableVertexRef.current` check (§16) grew from `hoverKind === 'active-vertex'` to
`hoverKind === 'active-vertex' || hoverKind === 'vertex'` — no third resolver or hover kind needed, because
mid-fragment (`resolveVertexPointHover` called with `excludeVertexId` set), a plain `'vertex'` match can
*only* ever mean "an existing vertex other than the active one" (the active one is claimed by
`resolveActiveVertexHover` first, §16) — which is now unconditionally the closing case, and now
unconditionally drag-armable. No ambiguity to resolve at the hover layer at all; the resolver's existing
output already disambiguates it for free.

**Update — the `isAlreadyConnected` guard was removed outright.** It blocked a real, legitimate case:
drawing a first arc `A -> B`, then starting a second fragment from `B` and closing it back onto `A`,
which should produce a second, independent segment between the same two vertices (e.g. two arcs forming
a lens/circle shape) — not get silently swallowed. Direction-independence was itself correct (an
existing `A->B` should also block a naive `B->A` duplicate along the exact same path), but the guard had
no way to distinguish "the same connection again" from "a deliberately different second connection
between the same two points", so it blocked both. Nothing downstream (rendering, face-derivation,
`findAllNetworkCrossings`, `deriveVectorFaces`) assumes at most one segment between a given vertex pair —
multiple parallel/independent segments between the same two vertices are handled the same as any other
segment. `closeLoopOntoVertex.ts` now always creates the new segment and arms the drag, unconditionally.

## 18. A persistent tangent-handle diamond for the staged-but-not-yet-committed outgoing tangent

Asked for directly, with a screenshot of the desired look: while drawing (an active fragment, `preview`
non-null), if the active vertex already has a pending outgoing tangent staged (§4's
`pendingOutgoingTangentRef`, surfaced into `preview.tangentFromOffset` by `updateVectorPenPreview.ts`), a
real tangent-handle diamond — not just the rubber-band curve it shapes — should stay visible the whole
time you're aiming toward the next point, not only during the original drag that created it
(`penDraggedHandlePositionRef`'s live diamond, §9, is cleared the instant that drag ends).

**Fix, entirely inside `drawPenSegmentPreview.ts`, no new refs**: `tangentFromOffset` was already computed
there (previously only used to shape the rubber-band curve, and only inside the "stroke needed" branch,
skipped whenever `from === to` — §16's snapped-onto-active-vertex case). It's now hoisted to always compute,
and whenever non-null, `drawTangentHandle` (the exact same primitive §9's diamonds and §10's real segment
handles already share — no new visual, no new styling decision) draws a plain, unselected/unhovered handle
from `from` to `from + tangentFromOffset`. This reuses data already in scope — `preview.from`/
`preview.tangentFromOffset` are already threaded into this function — so no ref needed to be lifted, unlike
§19 immediately below. Only fires while an active fragment exists (`drawPenPreview.ts`'s `if (preview)`
branch); the idle/no-active-vertex case has no `tangentFromOffset` concept at all.

## 19. Two tangent handles during a click-drag close — lifting `dragOriginRef` so the render loop can see it

Immediate follow-up ask, still about the closing-drag from §17: "those 2 tangents should appear" while
dragging onto an existing vertex to close the loop — the closing segment's own outgoing tangent (at the
vertex you're closing *from*) and the one being actively shaped (at the vertex you're closing *onto*).
Both turned out to already be silently broken for this specific case, for two independent reasons that
both trace back to the same root cause: `closeLoopOntoVertex.ts` (§17) clears `penActiveVertexId` to `null`
*before* the drag continues (closing always ends the active fragment), and two different rendering paths
both used to key off `penActiveVertexId` as their only way to know which vertex a live drag was anchored
to:

1. **`drawPenDragHandlePreview.ts`** (§9's live mirrored diamond, follows the cursor) resolved its anchor
   vertex via `node.vertices[penActiveVertexId]` — with that now `null`, the whole component silently
   rendered nothing for the entire closing-drag, even though `updateVectorHandleDrag.ts` was mutating the
   segment's `tangentEnd` correctly the whole time.
2. **`drawVectorEditHandlesLayer.ts`'s own `visualSelectedVertexIds`** (§10's "does this segment touch a
   selected vertex" reveal rule) — `getVisualSelectedVectorVertexIds(selectedVertexIds, penActiveVertexId)`
   — with `penActiveVertexId` null and the closing-*from* vertex never added to Vector Edit Mode's own
   `selectedVertexIds` ref either, the closing segment's real, already-committed `tangentStart` (passed in
   at creation time, §17) had *no* selected/one-hop endpoint to reveal it through — invisible by the same
   §10 rule that normally shows a fresh segment's own handles immediately.

**Fix: `dragOriginRef` (`TPenDragOrigin | null` — `{nodeId, segmentId, vertexId}`, §4/§9) is lifted from a
hook-local `useRef` inside `useDrawPenTool` into `TCanvasRefs` as `penDragOriginRef`**, exactly the same
move `penDraggedHandlePositionRef` itself already went through for the same reason (the render loop needs
to read a Pen-tool drag ref that isn't Redux state). `useDrawPenTool.ts` now destructures
`penDragOriginRef: dragOriginRef` from `refs` instead of creating its own `useRef` — every internal
handler keeps calling it `dragOriginRef`, only its *origin* changed, so `handlePointerDown.ts`/
`handlePointerMove.ts`/`handlePointerUp.ts`/`handlePointerCancel.ts` needed no signature changes at all.
The mount-cleanup effect now also resets `dragOriginRef.current = null` on tool switch-away, since a ref
now living in `TCanvasRefs` persists across this hook's own mount/unmount cycles (tool switches) instead of
being torn down for free — leaving a stale non-null value there could otherwise make a future
`handlePointerMove` on Pen misread an old drag as still armed.

With the ref lifted, `drawScene.ts` reads `dragOriginVertexId = refs.penDragOriginRef.current?.vertexId ??
null` once per frame and threads it two places:
- **`drawVectorTangentHandles.ts`/`drawPenDragHandlePreview.ts`**: the parameter that used to be named
  `penActiveVertexId` is now literally `dragOriginVertexId` (a rename, not just a new parallel value) —
  this component's only real job is showing where a live drag is anchored, which was *never* actually the
  same concept as "the Redux-tracked active vertex," it just always happened to coincide with it until
  closing broke that assumption.
- **`drawVectorEditHandlesLayer.ts`**: `getVisualSelectedVectorVertexIds(selectedVertexIds, penActiveVertexId
  ?? dragOriginVertexId)` — a plain fallback, deliberately *not* passing both simultaneously or merging two
  lists. In every drag-armed case except closing, `penActiveVertexId` and `dragOriginRef.vertexId` already
  point at the exact same vertex (`extendWithNewVertex.ts`, `continueVectorNetwork.ts`'s own-vertex branch
  §15, `startVectorFragment.ts`'s hover branch §15 — all set both to match), so the fallback is a genuine
  no-op there; it only ever actually kicks in for the one case where they diverge — closing — which is
  exactly the case that needed it.

The net effect during a closing-drag: the closing-*from* vertex now counts as visually selected again (its
real, already-committed `tangentStart` handle reappears via the ordinary §10 mechanism, *and* its vertex
dot gets the selected two-layer styling, both harmless/expected side effects of being "visually active"),
while `drawPenDragHandlePreview` now correctly anchors its live cursor-following diamond on the closing-
*onto* vertex instead of rendering nothing. Two real, independent handles — one static (the closing-from
vertex's own tangent), one live (the vertex being dragged onto) — matching what dragging onto an existing
vertex earlier in the *same* fragment already showed for free (§10's rule already covered that case, since
the newly-placed vertex there **was** `penActiveVertexId` at drag time).

## 20. Segment selection — click, shift-multi-select, hover, and drag-by-the-segment

Landed in two rounds: a first pass added single-segment click-to-select plus delete
(`armVectorSegmentOnPointerDown.ts` in `ARM_RESOLVERS`, lowest priority among the vector resolvers —
vertex/handle/multi-select-box all win a tied hit first; `getVectorEdgeAtPoint.ts`, §6, already existed
for Pen's own edge-attraction and is reused unmodified for the hit-test). A follow-up round added
shift-multi-select, a hover highlight, tangent-handle reveal for a directly-selected segment, and
dragging a selection by grabbing any one of its already-selected segments — closing the three gaps §7
used to flag.

**Selection state**: `selectedVectorSegmentIdsRef` (`TCanvasRefs`, `string[]`) — same shift-toggle shape
as vertex/handle selection (`toggleSelection.ts`), and, like those, **not mutually exclusive with them**:
a shift-click only ever touches its own category's ref, so a vertex, a handle, and a segment can all be
selected together at once. A plain (non-shift) click on a segment resets all three refs to just that one
segment, mirroring every other plain-click-replaces-selection resolver in this file.

**Hover** — a *second*, independent ref from Pen's own `hoveredSegmentIdRef` (§4's orange "extend/attract"
highlight, `#cd4422`, Pen-tool only): `hoveredVectorSegmentIdRef`, set by `resolveVectorSegmentHover.ts`
(`useSelectionTool/utils/handlePointerMove/`, mirrors `resolveVectorVertexHover.ts` exactly, same
`getVectorEdgeAtPoint` tolerances as the arm resolver) and cleared on `pointerleave` alongside
`hoveredVectorVertexIdRef`. Rendered via `drawHoveredVectorSegmentHighlight.ts` (new file, sibling to the
Pen-only `drawHoveredSegmentHighlight.ts` in `drawVectorEditOutline/`) — the *same* `VECTOR_HANDLE_FILL`
blue the selected-segment highlight uses (`drawSelectedSegmentsHighlight.ts`), but at
`VECTOR_SEGMENT_HOVER_FILL_ALPHA` (`0.5`) instead of fully opaque, so hover reads as a lighter version of
"this is about to be selected" rather than a different color meaning a different thing. This required
threading an optional `alpha = 1` parameter through `drawVectorStroke.ts` itself (`hexToRgbaFloat(color,
alpha)` — that function already took an alpha argument, just never received one from here) — the WebGL
context already runs with `gl.BLEND`/`SRC_ALPHA, ONE_MINUS_SRC_ALPHA` globally
(`useCanvasRenderLoop/utils/setupRenderLoop.ts`), so no rendering-pipeline change was needed, only the
uniform value.

**Tangent-handle reveal** — §10's two-list visibility rule (`selectedVertexIds` for "directly touching",
`oneHopVertexIds` for the one-hop corridor case) gained a third, orthogonal check:
`selectedSegmentIds.includes(segment.id)` folded into the *same* "directly touching" boolean in both
`drawSegmentTangentHandles.ts` (rendering) and `getVectorHandleAtPoint.ts` (hit-testing) — a segment that
is itself selected reveals both its own tangent handles unconditionally, exactly like a segment touching a
selected vertex already did. This is the "kilka naraz w tym pointy tangesy" requirement: shift-selecting
several segments makes every one of their tangent handles visible *and* grabbable at once, with no need to
separately select their vertices first. `selectedSegmentIds` threads down as one more parameter alongside
the existing pair everywhere they already flowed (`drawVectorEditHandlesLayer.ts` already had it in scope
for the outline highlight; `armVectorHandleOnPointerDown.ts`/`resolveVectorTangentHandleHover.ts` read it
off `canvasRefs.selectedVectorSegmentIdsRef.current`, same as the other two).

**Drag-by-the-segment** — reuses the existing multi-drag mechanism (`armVectorMultiDrag`/
`continueVectorMultiDrag`, originally built for "click inside the bounding box of 2+ selected
vertices/handles to move them together," §"Vector Edit Mode" resolver notes) rather than inventing a
parallel drag state: a non-shift pointerdown on a segment computes the *union* of vertex ids from
`selectedVectorVertexIdsRef` plus every endpoint of every currently-selected segment
(`getVectorSegmentVertexIds.ts`, new, `utils/canvas/vectorNetwork/` — dedupes a segment id list down to
its vertex ids) and arms `armVectorMultiDrag` with that set, `selectedVectorHandlesRef.current` passed
through unchanged. No new translate math was needed — tangents are stored relative to their own vertex
(§1), so translating a segment's two endpoint vertices carries its tangent handles for free, the same
"for free" property vertex-dragging already relied on. Mirrors `armHitDrag.ts`'s collapse-vs-keep
decision (`selection-and-manipulation.md` §3): clicking a segment **already** in the multi-selection keeps
the whole selection and drags everything in it; clicking one that **isn't** first collapses the selection
down to just that segment (clearing vertex/handle refs, same as the existing plain-click branch), then
drags only its own two vertices. **This "keep the whole selection" behavior is now deferred to release,
not decided at pointerdown** — see §21, a same-day follow-up correction.

## 21. Collapse-vs-keep for a multi-selected point is resolved on release, not on press — and the three
per-kind click resolvers got their own folders

Landed as a direct correction to §20's first cut: clicking an already-multi-selected vertex/handle/segment
used to decide immediately, at `pointerdown`, whether the click would collapse the selection down to just
that one item — so a click-and-drag meant to move the whole group instead snapped down to a single item
the instant the button went down, before any drag could happen. Reported directly ("jak mamy multi i
klikam point to odznacza wszystkie... jak klikne w punkt i nie ruszę myszką to wtedy faktycznie powinno
resztę odznaczyć" — collapsing must wait for a release with no movement, exactly `armHitDrag.ts`'s
existing collapse-vs-keep contract for whole-node multi-selections, which this vector-level version was
supposed to mirror from the start but didn't).

**The fix**: `TVectorMultiDragState` (`types/design/selectionTool/types.ts`) gained `hasMoved: boolean`
and `pendingClickAction: TVectorPendingClickAction | null` — the same two fields `TDragState` already
carries for the node-level version, `TVectorPendingClickAction` a `{ kind: 'vertex' | 'handle' | 'segment',
...id }` discriminated union naming which single item to collapse to. `armVectorMultiDrag.ts` takes an
optional `pendingClickAction` (default `null`) and seeds `hasMoved: false`; `continueVectorMultiDrag.ts`
sets `dragState.hasMoved = true` on the first real move, mirroring `continueDrag.ts`. Resolution moved
into `disarmVectorMultiDrag.ts` (now takes `canvasRefs` too, wired through `handlePointerUp.ts`): only when
`!hasMoved` does it apply the pending action, writing straight into `canvasRefs.selectedVector*Ref` (no
Redux dispatch — vector selection has always lived in refs, §6/§7) via a `switch` on `pendingClickAction.
kind` (`// no default` — the union is exhaustive by construction, so a runtime default branch would be
permanently dead code and break 100% coverage).

**The three per-category "is this click ambiguous" checks were pulled into two shared files** (asked for
directly — the union-computation and arm-call had been copy-pasted three times across the vertex/handle/
segment resolvers): `isPartOfVectorMultiSelection.ts` (`totalSelected > 1 && isHitItemSelected`, `handlePointerDown/`,
shared) and `armVectorGroupDrag.ts` (computes the vertex-id union — selected vertices plus every selected
segment's own endpoints, via `getVectorSegmentVertexIds.ts` — and calls `armVectorMultiDrag` with the
caller's `TVectorPendingClickAction`, `handlePointerDown/`, shared). Both live at the shared
`handlePointerDown/` level, not nested under any one resolver, since all three click resolvers call them.

**Each `armVector*OnPointerDown.ts` was promoted to its own same-named folder, its own private utils moving
in alongside it** — asked for directly, mirroring this codebase's established "ifologia" folder-promotion
convention (`drawVectorEditOutline/`, §3/§9) rather than leaving a flat file's growing branch logic inline:
- `armResolvers/armVectorVertexOnPointerDown/` — `armVectorVertexOnPointerDown.ts` (hit-test only, now a
  thin orchestrator), `armVectorVertexClick.ts` (the shift/multi/plain `switch (true)` — moved out to its
  own file on top of the folder promotion, since the switch itself was still enough logic to be its own
  concern), `selectAndArmVectorVertexDrag.ts` (the plain-click "replace selection + arm a single-vertex
  drag" branch, its own function since it's more than a one-line delegate), and `armVectorVertexDrag.ts`
  itself (moved in from the old shared `handlePointerDown/` location once nothing else referenced it
  directly anymore — only ever called from `selectAndArmVectorVertexDrag.ts`).
- `armResolvers/armVectorHandleOnPointerDown/` — same shape: `armVectorHandleOnPointerDown.ts` (hit-test),
  `armVectorHandleClick.ts` (the switch), `selectAndArmVectorHandleDrag.ts` (plain-click branch). Unlike
  the vertex case, `armVectorHandleDrag.ts` **stayed** at the shared `handlePointerDown/` level — it's also
  called directly by `armVectorCornerHandleOnPointerDown.ts` (§9), a different resolver entirely, so moving
  it into this folder would have misrepresented it as handle-resolver-private.
- `armResolvers/armVectorSegmentOnPointerDown/` — same shape again: `armVectorSegmentOnPointerDown.ts`,
  `armVectorSegmentClick.ts`, `selectAndArmVectorSegmentDrag.ts`. `armVectorMultiDrag.ts` similarly stayed
  shared (also called by `armVectorGroupDrag.ts` and `armVectorMultiSelectBoxOnPointerDown.ts`).
- The `switch (true) { case <boolean-expr>: ...; default: ... }` idiom used in every `armVector*Click.ts`
  mirrors `continueDrag.ts`'s `getOriginChanges`/`continueRotateDrag`'s `getRotatedNodeChanges`/
  `resizeNode.ts` — the established shape in this codebase for "3+ branches that aren't a plain
  `switch(x)` over one value, but *are* mutually exclusive boolean conditions," per `[[xigma-switch-over-if]]`.
- Test coverage stayed where it already was — `armResolvers/test/armResolvers.spec.ts`'s three `describe`
  blocks (unchanged in shape, just their imports repointed into the new nested paths) still exercise all
  three resolvers' full contracts end to end, since none of this reorganization changed behavior, only
  where the same logic lives. `armVectorVertexDrag.spec.ts` moved together with its implementation, into
  `armVectorVertexOnPointerDown/test/`.

## 22. Selecting a handle now reveals tangents as if its own vertex were selected — but must not make
that vertex's own dot render as selected

A direct reversal of part of §10's original spec: §10's "handle itself selected" exception was
deliberately narrow — selecting a handle only revealed *that one handle*, never its neighbors, even
though selecting the handle's own *vertex* already reveals every touching segment's both ends (§10 rule
1) plus the one-hop corridor (rule 2). Asked to change directly: "zaznaczając osobno tangen powinno być
takie zachowanie jakbyśmy point zaznaczyli... A obecnie się chowają dlatego że ja tak pisałem że ma być
ale trzeba to zmienić" (selecting a handle should behave as if its point were selected — it currently
hides them because I asked for it that way, but that needs to change now).

**First attempt folded the handle's parent vertex straight into `getVisualSelectedVectorVertexIds.ts`**
(the one shared merge already used for the Pen active vertex, §4/§10) — correct for tangent-visibility
purposes, but that same merged array is *also* what `drawVectorVertexDots.ts` reads to decide which
vertex dot renders in the enlarged/blue "selected" style. Since a handle's own vertex was never actually
*vertex-selected* (`selectedVectorVertexIdsRef` untouched — only `selectedVectorHandlesRef` holds the
click), folding it into the same array made that vertex's dot incorrectly render as selected too.
Reported immediately from a live screenshot ("pointy nie powinien być zaznaczony... wygląda jakby był
nadal zaznaczony" — the point shouldn't be selected, it looks like it still is).

**Fix: kept two separate arrays instead of one.** `getVisualSelectedVectorVertexIds.ts` reverted to its
original two-argument shape (`selectedVertexIds`, `penActiveVertexId`/`dragOriginVertexId`) — unchanged,
still the one `drawVectorVertexDots.ts` and `drawVectorMultiSelectBox.ts` read for dot/box styling. A new
`getTangentVisibilityVertexIds.ts` (`utils/canvas/vectorNetwork/`) takes that narrow result plus
`selectedHandles` and widens it *only* with each selected handle's own parent vertex (`end === 'start' ?
segment.startId : segment.endId`) — this wider result feeds `getOneHopVectorVertexIds` and is the
`selectedVertexIds` argument `drawSegmentTangentHandles.ts`/`getVectorHandleAtPoint.ts` actually receive.
All three call sites (`drawVectorEditHandlesLayer.ts`, `armVectorHandleOnPointerDown/
armVectorHandleOnPointerDown.ts`, `resolveVectorTangentHandleHover.ts`) now compute both arrays and are
careful about which one goes where — the narrow one to vertex-dot/box rendering, the wide one to
one-hop/tangent-visibility — rather than the one-array shortcut the first attempt took.

## 23. Marquee-select widened to handles and segments, with a Figma-parity "first catch locks the
gesture" rule

Before this, `continueVectorMarqueeDrag.ts` only ever computed `getVectorPointsInRect.ts` (vertices) —
tangent handles and segments could never be marquee-selected at all, only clicked individually. Asked for
directly, describing Figma's own behavior: "Jak zaznaczy jeden point to pozwala tylko pointy zaznaczać.
Jak zaznaczy tangen albo segment to pozwala wtedy wszystko zaznaczać" (catching one point only allows
catching points; catching a tangent or a segment then allows catching everything) — clarified further
once the first cut only looked at each frame's rect contents in isolation: "jak wybierzemy tangen albo
segment i potem point to mają być wszystkie zaznaczone... Chodzi o to że jeśli point będzie pierwszy...
To blokuje resztę" (select a tangent/segment and then a point — everything should end up selected; the
exclusivity only kicks in when the *point* is first, which then blocks the rest).

**Two new hit-test utilities, mirroring `getVectorPointsInRect.ts`'s shape** (`utils/canvas/vectorNetwork/`):
- `getVectorHandlesInRect.ts` — tests every segment's **effective** tangent position (`getEffectiveTangentStart`/
  `getEffectiveTangentEnd`, §9's default-preview construction) against the rect, point-in-rect, same as a
  vertex — so a still-default (never-dragged) preview handle is just as catchable as a real one, consistent
  with it already being click-grabbable.
- `getVectorSegmentsInRect.ts` — **bounding-box overlap**, not "any flattened sample point falls in the
  rect": a first version tested individual `flattenSegment` sample points, which is fine for a densely-
  sampled curve but silently missed a marquee dropped over the *middle* of a plain straight segment, since
  `flattenSegment` short-circuits a tangent-less segment to just its two endpoints (`start`, `end` — see §1)
  with no interior samples at all. Bounding-box overlap (same "touch" semantics `getCollidedNodes.ts`
  already uses for the scene-level marquee) fixes this for free and is cheaper besides.

**The "first catch locks the gesture" rule** — `TVectorMarqueeMode = 'points' | 'everything'`
(`types/design/selectionTool/types.ts`), tracked in a new ref (`vectorMarqueeModeRef`, `TSelectionToolRefs`,
reset to `null` by `armVectorMarqueeOnPointerDown.ts` at arm time and again by `disarmVectorMarqueeDrag.ts`
on release). `resolveVectorMarqueeMode.ts` (`handlePointerMove/`, its own file/tests for the pure decision)
is the whole rule: return the existing mode unchanged if already resolved; otherwise resolve to `'points'`
the first time any vertex is caught, `'everything'` the first time a handle or segment is caught with no
vertex caught, or stay `null` if nothing's caught yet. `continueVectorMarqueeDrag.ts` computes all three
hit-lists every frame regardless (cheap, and needed either way once resolved), calls
`resolveVectorMarqueeMode` to (maybe) lock in the mode, then a `switch` on the resolved mode decides what
actually lands in the three `selectedVector*Ref`s: `'points'` keeps handles/segments forced empty even once
the growing box also covers them; `'everything'` includes all three live, so a point that enters the box
*after* the lock already happened gets added alongside whatever handle/segment triggered it — the drag
never reverts to points-only once unlocked, mirroring the "handle first, point added later" case from the
direct clarification above. `null` (nothing caught by either the current frame or any earlier one) clears
all three, same as before this feature existed.

## 24. Marquee catch precedence — handles beat points beat segments, each exclusive of the rest

§23's "first catch locks the gesture" rule has since been replaced by a strict, three-way priority order,
arrived at over several rounds of direct feedback. `TVectorMarqueeMode` is now `'handles' | 'points' |
'everything'` (`types/design/selectionTool/types.ts`) — `'everything'` is a legacy name kept to avoid a
wider rename; it is reached only via a segments-only catch and no longer means "combine everything caught".

**The rule, `resolveVectorMarqueeMode.ts`, as a single `switch (true)`** (no `if`, per direct request —
each `case` is a boolean expression, first match wins, and two cases can share one `return` via
fall-through):
1. A handle caught this frame (`handleHits.length > 0`), or the gesture is already locked to `'handles'` →
   `'handles'`. This is the top priority and can *promote* an already-locked `'points'` or `'everything'`
   mode straight to `'handles'` mid-gesture — the only case where the mode moves to a different exclusive
   category after locking. Direct ask, verbatim: "Jak zaznaczamy tangeny to nic innego nie może wtedy być w
   tej liście, nawet pointy" (when we're catching tangents, nothing else may be in that list, not even
   points).
2. Already locked to `'points'` → stays `'points'` (permanent, like `'handles'`, but only while no handle
   ever joins in).
3. A vertex caught this frame (`vertexIds.length > 0`) → `'points'`, unconditionally — segments never
   survive alongside a point, regardless of how many are involved. Direct ask, verbatim: "Jak zaznaczymy
   segmenty ale trafimy na pointy to wywalamy segmenty z listy i zaznaczymy tylko pointy... Niezależnie od
   liczby segmentów" (regardless of segment count) — this superseded an intermediate version of the rule
   that kept segments combined with a point once 2+ were already selected.
4. Already locked to `'everything'` → stays `'everything'` (only reachable here since a live handle/vertex
   catch would have already returned above).
5. A segment caught this frame (`segmentHits.length > 0`) → `'everything'`, segments-only, nothing above it
   to lose to.
6. Otherwise → `currentMode` unchanged (still `null` if nothing has ever been caught).

`continueVectorMarqueeDrag.ts`'s `switch` on the resolved mode mirrors this exclusivity directly in what it
writes to the three `selectedVector*Ref`s — each case populates exactly one of vertex/handle/segment and
force-empties the other two, there is no longer a case that combines more than one category.

## 25. Pre-marquee snapshot refs — keeping a deselected point/segment's tangents catchable through a fresh marquee gesture

`armVectorMarqueeOnPointerDown.ts` clears the live vertex/handle/segment selection synchronously at
pointer-down, before the first `pointermove` frame. Tangent-handle *visibility* (§10's reveal rule) is
gated on that same live selection (`isVectorHandleVisible.ts`: touching a selected vertex or segment, or
one-hopped to one, reveals a handle) — so a point or segment that was selected (and had its tangents
visible) right before the user starts a marquee specifically to drag a box onto those tangents would have
them vanish on frame 0, before the box ever reaches them. Direct bug report: "jak zaznaczym point i mamy
widoczne tangeny to próbując złapać tangeny boxem odklikuje się point przez co chowają się tangent[y]" — the
point should still end up deselected, but its tangents must stay visible/catchable until pointer-up.

**Fix**: two new `TCanvasRefs` (`useCanvasRefs.ts`/`createCanvasRefs.ts`, both real-hook and test-helper
constructors) — `preVectorMarqueeVertexIdsRef` and `preVectorMarqueeSegmentIdsRef`. `armVectorMarqueeOnPointerDown.ts`
snapshots the live selection into them *before* clearing it. For the rest of the gesture:
- `continueVectorMarqueeDrag.ts` feeds the vertex snapshot into `getVisualSelectedVectorVertexIds` (instead
  of a hardcoded `[]`) when computing `tangentVisibilityVertexIds` for hit-testing, and passes the segment
  snapshot directly as `getVectorHandlesInRect`'s `selectedSegmentIds` param (instead of a hardcoded `[]`) —
  so a handle revealed only by the pre-drag selection is catchable by the box.
- `drawVectorEditHandlesLayer.ts` takes both snapshots as extra params and merges them in *only* for the
  tangent-visibility computation fed to `drawVectorTangentHandles` — never into the `visualSelectedVertexIds`
  used for vertex-dot rendering or the plain `selectedSegmentIds` used for the segment highlight in
  `drawVectorEditOutline`. This is what keeps the deselected point/segment itself looking deselected while
  its tangents stay drawn.
- `disarmVectorMarqueeDrag.ts` clears both snapshots back to `[]` on release, so the effect is scoped to a
  single gesture.

The snapshot is deliberately *not* fed into `resolveVectorMarqueeMode`'s `vertexIds`/`segmentHits` — it only
widens what's visible/catchable, it never counts as something the current frame "caught" for §24's priority
resolution.

## 26. Fresh-tangent gestures mark the vertex `'symmetric'`, not `'smooth'` — both handles mirror length, not just angle

`getMirroredVectorSegments.ts` (§9/§20) already distinguished `'smooth'` (mirrors angle only; the *other*
handle keeps its own existing length) from `'symmetric'` (mirrors angle *and* length) — see `TVertexHandleMode`
(`types/design/types.ts`). The two gestures that create a vertex's first real tangent by dragging —
`updateVectorHandleDrag.ts` (Pen tool click-drag, §15) and `armVectorCornerHandleOnPointerDown.ts`
(Ctrl/Cmd-drag pulling a handle out of a plain corner, §9) — both used to tag the vertex `'smooth'`. Direct
reports against both: dragging one side out left the *opposite* handle's length untouched — it rotated to
stay collinear but stayed short/stubby instead of extending or retracting together with the one being
dragged ("Zmienia się jego położenie po osi obrotowej [kąt owszem]... ale nie rozciąga się wzdłuż" — its
angle changes, but it doesn't stretch along its length). Both now tag the vertex `'symmetric'` instead —
`getMirroredVectorSegments.ts` itself is unchanged, only which mode gets *written* at creation time. A
vertex only ends up `'corner'` (fully independent handles) or `'smooth'` (angle-only) through some other,
currently nonexistent, write path — there is presently no UI to set either explicitly once a tangent-drag
gesture has touched a vertex.

## 27. Click-dragging onto an existing edge while extending now arms a drag, same as closing onto a vertex

§15/§20's `closeLoopOntoEdge.ts` (attaching an in-progress Pen line to an existing segment by splitting it,
mirroring `closeLoopOntoVertex.ts`'s "close onto an existing point" case) used to dispatch
`endHistoryGesture()` immediately and never touch `dragOriginRef`/`dragStartRef` — so a click-*drag* onto
the split point behaved exactly like a plain click: the connecting segment always came out straight, the
drag silently discarded. Direct report, very specific by design ("scenariusz jest bardzo specific"):
dragging from the split point B to shape a new curve there, mid-extension, did nothing. Fixed to match
`closeLoopOntoVertex.ts` exactly: `closeLoopOntoEdge.ts` now takes `point`/`dragOriginRef`/`dragStartRef`
too, arms `dragOriginRef.current = { nodeId, segmentId: connectingSegmentId, vertexId: newVertexId }` and
`dragStartRef.current = point` instead of ending the gesture, and no longer dispatches
`endHistoryGesture()` itself — `handlePointerUp.ts` already does that unconditionally on release for every
Pen gesture (§ arm/continue/disarm trio), so the premature call was both redundant and exactly what
prevented the drag from ever being observed. A plain click (no movement past `MIN_DRAG_DISTANCE_PX`) is
unaffected — arming then immediately releasing produces no visible change, same as `closeLoopOntoVertex.ts`
always did for a plain closing click.

## 28. Deleting a segment or a vertex now prunes any *other* endpoint it leaves with zero remaining segments

`handleDeleteSelection.ts`'s vertex-selection branch already recomputed both `vertices` and `segments`
together (`getRemainingSegments`). Its sibling segment-selection branch didn't: it only ever filtered
`node.segments`, so a vertex whose only segment(s) got deleted stayed behind in `node.vertices` forever —
a floating, unselectable-by-normal-means dot with nothing attached (screenshot: an orphaned point sitting
apart from an otherwise-normal two-segment path). Fixed with a new `getRemainingVertices(vertices,
segments)` helper (same reachability check `deleteDanglingActiveVertex.ts` already used for the Pen tool's
single active vertex on Escape, generalized here to every vertex against an arbitrary post-delete
`segments` map) — this section originally said the fix was applied only to the segment-selection branch,
deliberately not the vertex-selection one, on the reasoning that deleting a vertex already has its own
separate bridge/reconnect question. That reasoning didn't survive contact with a concrete repro: deleting
the **shared vertex of a "V" shape** (the bottom point, touching both arms) removed both incident
segments, which left *both remaining arm-tip vertices* orphaned — the exact same dangling-dot bug, just
reached by deleting the middle point instead of an end one. `getRemainingVertices` is now applied in
**both** branches (vertex-selection and segment-selection) — deleting a vertex prunes every *other*
vertex the deletion happens to orphan, not just accounts for the one explicitly selected.

**Consequence — an isolated single vertex with zero segments is no longer reachable by deleting
anything**, only by undo (which restores a raw pre-gesture snapshot, bypassing this cleanup entirely) or
by a fresh network's very first vertex before a second point is ever placed. `pen.spec.ts`'s undo
regression test used to reconstruct that exact state as an independent reference by drawing two vertices
and deleting the second one — that stopped working the moment this fix landed, since deleting v2 now
orphans-and-removes v1 too (both endpoints of the one segment being removed lose their only segment
simultaneously). Fixed by reconstructing the reference via undo instead of deletion (draw v1+v2, Escape,
one `Ctrl+Z`) — the pre-gesture snapshot `Ctrl+Z` restores there is provably the same one a longer
3-vertex session's second `Ctrl+Z` would land on, since neither drawing a v3 afterward nor Escape (it
never touches `nodes`/`rootOrder`/`selectedIds`, §8) can change what was already snapshotted before v2's
own gesture ran.

## 29. Move tool can now split a segment too — but only by clicking its own fixed midpoint dot, not anywhere along it

§20's edge-splitting was Pen-only (§27's history: it used to be a Move-tool arm-resolver, got removed to
match Figma). Direct ask to bring a version of it back to the Move tool, refined over several rounds of
"no, not quite" feedback into its final shape:

1. **The hover affordance is two-tier, not one.** A visible insertion dot appears anywhere the pointer is
   within the *existing*, wide `getVectorEdgeAtPoint.ts` edge tolerance (same test the blue hover-highlight
   already uses) — but it's always drawn at the segment's own fixed geometric midpoint
   (`getSegmentMidpoint.ts`), never at the cursor's own position along the curve. A first cut tracked the
   cursor; corrected directly: "ma być tylko ten który się pojawia na środku, nie ruchomy" (only the one
   that appears in the middle, not movable) and "dlaczego zrobiłeś na całym odcinku to?" (why did you make
   it track the whole segment?). The `pen-extend` cursor className, by contrast, only switches on once the
   pointer is precisely over that dot — a *separate*, narrow hit-test
   (`getVectorSegmentMidpointAtPoint.ts`, a `VECTOR_VERTEX_HIT_RADIUS_PX`-radius check mirroring
   `getVectorVertexAtPoint.ts`), not the wide edge tolerance: "Kursor się tylko zmienia jak najadę na
   point, nie na cały segment." Implemented in `resolveVectorSegmentHoverInNode.ts`
   (`useSelectionTool/utils/handlePointerMove/resolveVectorSegmentHover/`, itself promoted to its own
   folder with `clearVectorSegmentHover.ts` as the sibling "no node" branch) — a new `hoveredVectorEdgeInsertPointRef`
   (`TCanvasRefs`) feeds `drawVectorEdgeInsertPreview.ts` (a hover-sized dot, `drawVertexDot.ts` reused from
   `drawVectorVertexDots/`, itself promoted to its own folder for the same reason).
2. **The click affordance matches the narrow hit-test, not the wide one.** "Plus muszę kliknąć w ten point
   konkretnie, a nie że klikam w segment i mi się robi środkowy point" (I have to click specifically on
   that point, not that clicking anywhere on the segment creates the middle point). `armVectorSegmentOnPointerDown.ts`
   still claims the pointerdown via the *wide* edge hit-test (so drag-to-select-and-move from anywhere on
   the segment, rows 200/201, keeps working unchanged), but separately checks
   `getVectorSegmentMidpointAtPoint.ts` for that *same* segment; only when both agree does the click carry
   split potential.
3. **Split-vs-select is resolved on release, exactly like §21's vertex/handle/segment collapse-on-release
   pattern, via a new `TVectorPendingClickAction` variant.** `selectAndArmVectorSegmentDrag.ts` still
   eagerly selects the segment at press time either way (so it *looks* selected mid-drag exactly as
   before) and arms `armVectorMultiDrag` with `pendingClickAction: { kind: 'split-segment', segmentId, t:
   VECTOR_SEGMENT_INSERT_T }` when the midpoint hit-test matched, or `null` otherwise. `disarmVectorMultiDrag.ts`
   (promoted to its own folder — `applyPendingClickAction.ts` now itself delegates the `'split-segment'`
   case to `applySplitSegmentClickAction.ts`, and every case funnels through a shared
   `setExclusiveVectorSelection.ts` instead of the same three-ref-assignment block repeated per case) only
   applies it when `!hasMoved`: calls `splitVectorSegment.ts` (the same De Casteljau split the Pen tool
   uses, at the fixed `t = VECTOR_SEGMENT_INSERT_T = 0.5`, `constant/canvas.ts`) and selects the new vertex
   exclusively — the old segment id is never left selected, split or not ("Co ważne jeśli segment był
   zaznaczony trzeba go odznaczyć"). A real drag (`hasMoved`) never applies the pending action at all, so
   dragging from the midpoint still just translates the segment like grabbing it anywhere else would.

## 30. Ctrl/Cmd+drag bends a straight segment — a second Ctrl gesture alongside §9's corner-pull, disambiguated by hover cursor

Figma parity: holding Ctrl/Cmd and dragging a segment's own interior (not a vertex) bends it into a
curve, distinct from §9's Ctrl/Cmd+drag-out-of-a-corner-vertex gesture. `armVectorBendSegmentOnPointerDown.ts`
(`ARM_RESOLVERS`, between `armVectorCornerHandleOnPointerDown` and `armVectorVertexOnPointerDown` —
so an exact vertex hit still wins the corner-pull gesture; this one only fires on a genuine
`getVectorEdgeAtPoint.ts` mid-segment hit, whose own `nearEndpoint` check already excludes the
near-vertex zone) fires on pointerdown, before any drag distance is checked:

1. Writes straight-line-equivalent default tangents onto the segment if it doesn't already have real
   ones (`getStraightTangent`: `(to - from) / 3`, the standard "collinear control points render as a
   straight line" cubic-bezier construction — visually identical to the un-tangented straight segment,
   confirmed by the curve-tessellation adaptive count still just retracing the same line), and marks
   both endpoints `'symmetric'`.
2. Arms `vectorSegmentBendDragRef` (`TVectorSegmentBendDragState` — `dragStart`, the segment's id, the
   just-written `tangentStart`/`tangentEnd`, and the *original* `tangentStart`/`tangentEnd` for an
   Escape-revert).
3. **Selects the segment** (`selectedVectorSegmentIdsRef.current = [hit.segmentId]`) — same
   `selectAndArmVectorSegmentDrag.ts` pattern §20 already established for plain segment selection,
   not a no-op or a full deselect. **Regression, shipped and fixed in the same round**: an earlier
   version cleared all three vector selection refs to `[]` here instead (mirroring §9's
   `armVectorCornerHandleOnPointerDown.ts`, which *does* clear everything since it selects a *handle*,
   not a *vertex/segment*). That looked identical in a quick manual check because the segment's own
   endpoint often still carried the Pen tool's leftover `penActiveVertexId` (also counted as
   "selected" by §10's tangent-visibility rule) — but with that carried-over selection absent (e.g.
   after an explicit Escape, or on a segment neither endpoint was ever the active Pen vertex for),
   §10's `drawSegmentTangentHandles.ts` visibility gate (`isSegmentDirectlyTouchingSelection ||
   oneHopVertexIds.includes(...) || isHandleSelected(...)`) had nothing to key off, so the tangent
   diamonds §1 above had just written into the store never actually rendered — reported directly
   ("Prawie wszystko jest ale tangeny nie są widoczne"). Fixed by selecting the segment instead of
   clearing, which is also the *correct* Figma-parity selection state regardless (the segment is what
   the gesture is acting on) — not a special-cased workaround.

`continueVectorSegmentBendDrag.ts` only starts reshaping the curve once the drag clears
`MIN_DRAG_DISTANCE_PX` — offsets both tangents by the same `(dx, dy) * BEND_OFFSET_SCALE` (`4/3`,
i.e. the drag vector maps to a proportional tangent-length change, mirroring how a fresh click-drag
handle is shaped elsewhere in this feature) and sets the `'bend'` cursor className. `cancelVectorSegmentBendDrag.ts`
(a `keydown` listener in `useSelectionTool.ts`, alongside the existing pointer listeners) reverts to
the *original* tangents on Escape mid-drag, distinct from a plain Escape with no bend in progress
(§5's staged exit, unaffected). `disarmVectorSegmentBendDrag.ts` on pointerup just clears the drag ref
and releases pointer capture — the selection made at arm time (step 3 above) deliberately survives the
gesture, so the handles stay visible/grabbable afterward exactly like any other segment selection.

**Hover cursor, added as a follow-up in the same round**: before this, holding Ctrl/Cmd and hovering
*exactly* over an existing vertex (the corner-pull target, §9) showed no distinct cursor feedback —
`resolveVectorSegmentHoverInNode.ts`'s Ctrl-branch only ever checked the bend-eligible edge hit
(`hit ? 'bend' : null`), and `getVectorEdgeAtPoint.ts` returns `null` right where a vertex actually
sits (the same `nearEndpoint` exclusion used above), so hovering a point showed the plain default
cursor instead of any hint that a different Ctrl gesture applies there. Fixed by checking
`getVectorCornerHandleAtPoint.ts` (the exact hit-test `armVectorCornerHandleOnPointerDown.ts` itself
arms on) first: `setClassName(vertexHit ? 'segment' : hit ? 'bend' : null)`. The `'segment'` cursor
className/asset (`canvas.module.scss`, `assets/icons/cursors/segment.png`) already existed structurally
alongside `'bend'` before this — this wiring is what actually makes it switch on hover.

Covered by `e2e/design/vector/vector-edit.spec.ts` (rows 213-215, `TEST_CASES.md`): a differential
regression test for the visibility fix (Ctrl-click's own screenshot must already match a known-good
plain-reselect of the same segment, not just "some pixel changed" — a plain before/after diff turned
out to pass even against the buggy clear-selection version, since writing the tangents alone already
perturbs the curve's flattened-polyline antialiasing regardless of whether the handles render), a
bent-vs-moved comparison against a non-Ctrl drag on the same point, and a cursor-className comparison
between hovering the vertex vs. the segment's interior under Ctrl.

## 31. Multi-select box excludes tangent handles entirely — Figma doesn't have a bounding box for them either

Landed as a follow-up correction to the (separately in-progress) vector multi-select resize/rotate box
feature: the box's eligibility gate was `selectedVertexIds.length + selectedHandles.length > 1`,
meaning 2+ selected tangent handles (with zero vertices) drew a bounding box and could arm resize/rotate
drags on them — reported directly as unwanted ("Jak zaznaczamy tangeny to nie powinien się pojawić box.
To jest zbyt złożona sprawa. Nawet figma tego nie ma" — when we select tangents the box shouldn't
appear, it's too complex a case, even Figma doesn't have this). Fixed by extracting the shared predicate
`isVectorMultiSelectBoxEligible.ts` (`Canvas/utils/`) — `selectedHandles.length === 0 &&
selectedVertexIds.length > 1` — and swapping it in at all six call sites that previously repeated the
inline arithmetic: `drawVectorMultiSelectBox.ts` (render gate, wraps the resize-drag/rotate-drag/static
branches alike), `resolveToolHover.ts` (hover-context box computation), and the four pointerdown arm
resolvers (`armVectorGroupDrag.ts`, `armVectorMultiSelectBoxOnPointerDown.ts`,
`armVectorMultiSelectResizeOnPointerDown.ts`, `armVectorMultiSelectRotateOnPointerDown.ts`). Any tangent
handle in the selection now unconditionally kills box eligibility, even mixed with 2+ selected vertices —
not just a pure-handle selection.

**A real bug surfaced while verifying the "handles should just translate with the mouse, ignoring the
box" follow-up request** ("One powinny się poruszać zgodnie z ruchem myszki tak jakby ignorując boxa" /
"Teraz to wygląda jakby były w boxie" — they should move with the mouse as if ignoring the box / now it
looks like they're in a box — user-observed live, reproduced with a plain multi-select of 2+ tangent
handles via marquee/shift-click, no bend gesture involved). Root cause: `getVectorMultiSelectOrigins.ts`
snapshot each selected handle's drag-origin via `handle.end === 'start' ? getEffectiveTangentStart(...) :
segment.tangentEnd` — the `'end'` branch read the segment's **raw** `tangentEnd` instead of
`getEffectiveTangentEnd.ts` (§10's render-only preview fallback for a segment that only has a real
tangent on one side). A selected `'end'` handle whose `tangentEnd` was still `null` (only ever shown as
a derived preview position, never dragged for real yet) resolved to no origin at all, so
`continueVectorMultiDrag.ts`'s `translateVectorHandles` — which only iterates the origins it was given —
silently left that handle frozen in place every frame while any other selected handle/vertex moved by
the pointer delta as normal. With one point of a 2-handle selection stuck and the other tracking the
cursor, the drag visually reads exactly like resizing a box from one corner. Fixed by mirroring the
`'start'` branch: `getEffectiveTangentEnd(node.vertices, segment)` for the `'end'` case, matching the
established pattern `drawSegmentTangentHandles.ts`/`getVectorHandleAtPoint.ts` already use for both
sides (§10) — a multi-drag on a preview-only handle now commits it to a real `tangentEnd` on first
movement, same "drag a preview for real" semantics as the single-handle drag path.

**The exact same raw-`tangentEnd` bug existed a third time**, in `getVectorMultiSelectBounds.ts`
(`utils/canvas/vectorNetwork/`) — found while writing the e2e regression test for the fix above, where
a "no box renders" check kept passing even with `isVectorMultiSelectBoxEligible` deliberately reverted,
because this function's own `getSelectedHandlePoints` also read raw `segment.tangentEnd` instead of
`getEffectiveTangentEnd`, silently dropping a preview-only `'end'` handle from the bounds computation
and collapsing it to a degenerate zero-size rect no `drawRect` call would visibly render — masking the
eligibility bug rather than proving it fixed. Fixed the same way, mirroring the `'start'` branch. Note
this call site is presently unreachable with a non-empty `selectedHandles` in practice (every caller of
`getVectorMultiSelectBox`/`getVectorMultiSelectBounds` already goes through the
`isVectorMultiSelectBoxEligible` gate above, which requires zero handles) — fixed anyway for consistency
and to not leave a second landmine for whenever box eligibility rules next change.

**`drawVectorMultiSelectBox.ts` was promoted to its own folder**, `drawVectorMultiSelectBox/`, following
the established "ifologia" split pattern (§`xigma-module-structure` skill) once its three render branches
(static box / live resize-drag box / live rotate-drag box) grew into their own concerns:
`drawVectorMultiSelectBox.ts` is now a thin orchestrator dispatching to flat siblings
`drawVectorMultiSelectStaticBox.ts`, `drawVectorMultiSelectResizeDragBox.ts`, and
`drawVectorMultiSelectRotateDragBox.ts`, each with its own `test/` spec (the orchestrator's own spec mocks
the three siblings and asserts dispatch, same as `drawVectorTangentHandles.spec.ts` mocks its own
siblings).

**The resize-drag box's rotation pivot needed no separate argument, but the tests still expected the old
one.** `TVectorMultiSelectResizeDragState` had grown `anchor`/`anchorWorld` fields (the (separately
in-progress) resize/rotate-box feature's own work) so that `continueVectorMultiSelectResizeDrag.ts`
repositions `liveBounds` every tick (`repositionRotatedVectorMultiSelectBounds`,
`getVectorMultiSelectResizeTransform.ts`) such that its own center is already the correct, anchor-stable
rotation pivot — matching the "every rotated shape spins around its own bounds' center" convention
elsewhere in this app, so `drawVectorMultiSelectResizeDragBox.ts` never needs to thread a separate pivot
through to `drawRect`. Several tests (`armVectorMultiSelectResizeDrag.spec.ts`, `armResolvers.spec.ts`,
`continueVectorMultiSelectResizeDrag.spec.ts`, `disarmVectorMultiSelectResizeDrag.spec.ts`,
`drawVectorMultiSelectResizeDragBox.spec.ts`) still had fixtures/expectations from before that type grew —
one of them (`continueVectorMultiSelectResizeDrag.spec.ts`'s rotated-box case) actually crashed at runtime
(`TypeError` reading `.x` of `undefined`) rather than just failing an assertion, since
`repositionRotatedVectorMultiSelectBounds` only skips touching `anchor`/`anchorWorld` when `rotation===0`.
Fixed by adding the missing fields (computed correctly, not just type-satisfying placeholders) and, for
the one test that still expected an explicit pivot argument, updating its expectation to match the current
(correct) no-separate-pivot contract instead. `getVectorMultiSelectResizeTransform.ts` and
`getVectorMultiSelectSelectionKey.ts` had no dedicated unit spec of their own at all up to this point
(only indirect coverage through the integration-level drag specs) — added
`getVectorMultiSelectResizeTransform.spec.ts`/`getVectorMultiSelectSelectionKey.spec.ts` directly
exercising every branch (both anchor sides null/non-null, both "min"/"max"-side handles, the zero-size
degenerate case) to close out the last coverage gaps this whole area had.

Covered by a new `vector-edit.spec.ts` scenario (`TEST_CASES.md` #216): multi-selecting two tangent
handles with zero vertices selected draws no box, and dragging the real one moves the preview-only one by
the exact same pixel delta — verified to actually catch both regressions above by deliberately reverting
each fix in turn and confirming the test fails (a naive "did the region change" assertion on the
preview-only handle does **not** catch the frozen-handle bug, since a preview handle's rendered position
is a function of its neighbor's tangent and visibly moves — just via the wrong, curve-derived formula —
even under the old broken code; the test instead checks the handle landed at the precise
delta-translated position, which the buggy formula misses by a wide margin).

## 32. §30's Ctrl/Cmd+drag bend picks the wrong segment near a branch point — fixed by deferring the choice to the first drag direction, Figma-style

Reported directly, with a precise repro and the fix's own shape already sketched by the user: draw a
square with one edge extended past its corner (a "diving board" sticking out past the join of two other
segments), so three segments meet at one vertex. Starting a Ctrl/Cmd+drag bend (§30) anywhere near that
vertex always bent the same segment — whichever was `Object.values(node.segments)`'s first entry, i.e.
whichever was drawn first — regardless of which segment the user actually meant to grab. Figma instead
picks the segment whose own direction from the vertex is closest to the direction the user's first real
mouse movement travels in.

Root cause was in `getVectorEdgeAtPoint.ts`: `nearEndpoint` only excludes a segment from matching when the
point is within `vertexTolerance` of one of *its own* two endpoints — it has no notion of a vertex being
shared by other segments. In the ring between `vertexTolerance` and `edgeTolerance` around a branch point,
every incident segment's flattened polyline can fall within `edgeTolerance` of the same click simultaneously,
and the old `matches[0] ?? null` just took whichever segment happened to iterate first.

Fixed without touching `getVectorEdgeAtPoint.ts` itself — it's shared by 6 call sites (hover, plain segment
click, two Pen-tool call sites, plus this one), so narrowing its tie-break would have risked all of them.
Instead, refactored it into `getAllVectorEdgeMatchesAtPoint` (returns every match, in the same iteration
order as before) with `getVectorEdgeAtPoint` now just `[0] ?? null` on top — so every other caller is
behaviorally unchanged, verified by `getVectorEdgeAtPoint.spec.ts`'s existing suite passing untouched.

The bend gesture alone now branches on `matches.length`:

- **Exactly one match** (the overwhelmingly common case, and the old down+up-with-no-movement path):
  commits immediately, unchanged from §30's original behavior.
- **Zero matches**: no-op, unchanged.
- **Two or more matches** (the ambiguous branch-point zone): `armVectorBendSegmentOnPointerDown.ts` no
  longer writes anything to the store on pointerdown. It computes a `TVectorBendDragCandidate` per match
  (`getVectorBendDragCandidates.ts` — for each candidate, whichever endpoint is nearer the click is the
  "shared" vertex, and the candidate's `angle` is the direction from that vertex toward the segment's
  *other* endpoint) and arms `vectorSegmentBendDragRef` in a new `status: 'pending'` state (just
  `candidates`, `dragStart`, `nodeId` — no tangents, no selection) instead of the old flat shape. Straight
  geometry only (`end - start`), not tangent-aware — a segment that's already curved meeting straight ones
  at a shared vertex mid-multi-bend is a deliberately unhandled rare compound case.

  `continueVectorSegmentBendDrag.ts` resolves `'pending'` to `'committed'` the first time the drag clears
  `MIN_DRAG_DISTANCE_PX` (same threshold §30 already used to gate the offset math, now doing double duty
  as the "first real direction is known" signal): `pickClosestAngleMatch.ts` (`utils/math/` — generic over
  any `{ angle: number }` candidate, later reused by §33's corner-handle fix too) picks whichever
  candidate's `angle` has the smallest angular distance (wrapped correctly across the 0°/360° seam) to
  `getAngleBetweenPoints(dragStart, point)`, the actual drag direction. This is exactly the sector-bisector
  partition the user described by hand (the reported example: a "right" segment's own zone would span
  ±45°/90° depending on its neighbors' angular spacing on each side) — nearest-angle selection is
  mathematically equivalent to bisector partitioning without having to compute the bisectors explicitly.

  `commitVectorBendSegment.ts` is the single place that does what §30's arm resolver used to do inline
  (default straight tangents if none exist, mark both endpoints `'symmetric'`, select the segment,
  dispatch, arm the ref as `'committed'`) — now shared by three call sites instead of duplicated: the
  unambiguous pointerdown case, the pending-drag resolution above, and `disarmVectorSegmentBendDrag.ts`'s
  fallback (pointerup with the drag still `'pending'`, i.e. released before any real movement — picks
  `candidates[0]`, preserving the exact old first-created-wins behavior for that specific case, since
  there's no direction to disambiguate from yet). Returns the committed state directly rather than
  requiring callers to re-read it back out of the ref afterward — `continueVectorSegmentBendDrag.ts` uses
  this to avoid an `Optional`-chained re-read that would've otherwise left an unreachable branch (`bendState
  == null` right after unconditionally setting it) for 100%-branch coverage to complain about.

  `cancelVectorSegmentBendDrag.ts`'s Escape handler now checks `status` first: a `'committed'` drag reverts
  tangents exactly as before; a `'pending'` one just clears the ref, since nothing was ever written to
  revert.

`TVectorSegmentBendDragState` became a discriminated union (`'pending' | 'committed'`) rather than adding
optional fields to the flat shape, so every reader is forced to handle both cases at the type level instead
of by convention.

Deliberately unit-only (`TEST_CASES.md` #217, not a new `vector-edit.spec.ts` scenario) — the candidate
selection is pure deterministic angle math with no rendering or event-timing stake, already asserted
precisely via `store.getState()` in `armResolvers.spec.ts` (the new pending-arm case) and
`continueVectorSegmentBendDrag/test/continueVectorSegmentBendDrag.spec.ts` (the angle-based resolution
itself, plus the below-threshold-stays-pending case), mirroring this doc's own stated rationale for why
most scenarios in `TEST_CASES.md` skip e2e.

## 33. §9's corner-pull has the exact same first-created-wins bug as §32 — fixed the same way, plus a real-world discovery about coincident vertices

Same class of bug as §32, one gesture over: `getVectorCornerHandleAtPoint.ts` finds the nearest vertex to
a Ctrl/Cmd click, then `armVectorCornerHandleOnPointerDown.ts` picked which touching segment to pull a
fresh handle from via `touchingSegments.find(...) ?? touchingSegments[0]` — a tangent-presence preference
with `Object.values(node.segments)` order (creation order) as the fallback, no notion of drag direction at
all. Reported with a live repro: a "+" cross (Ctrl+drag from dead center, dragging down bent the *top and
bottom* segments together regardless of direction; dragging toward the right segment still bent top+bottom,
never right).

Fixed with the same deferred-resolution shape as §32:

- `armVectorCornerHandleOnPointerDown.ts` branches on `touchingSegments.length` instead of the old
  find-with-fallback: **one** touching segment commits immediately (unchanged from before); **zero**
  no-ops (an isolated vertex, e.g. a stray Pen click never connected to anything); **two or more** arms
  `pendingVectorCornerHandleDragRef` (`status`-free this time — `TVectorHandleDragState` itself stays a
  flat shape since it's shared with the *other*, already-unambiguous handle-drag entry point in
  `armVectorHandleOnPointerDown/selectAndArmVectorHandleDrag.ts`, dragging a handle you clicked precisely
  on — turning it into a union would have forced that unrelated caller to handle a `'pending'` case it can
  never produce; the pending state lives in its own separate ref instead).
- `getVectorCornerHandleDragCandidates.ts` builds one `{ angle, end, segmentId }` per touching segment —
  `end`/`angle` computed structurally from which of the segment's two ids equals the vertex, not by
  distance, so no ambiguity about which side of the segment is "near" (unlike §32, where the click point
  could be anywhere along the segment's own length).
- `resolveVectorCornerHandleDrag.ts` (new — sits in `handlePointerMove.ts` right before the pre-existing
  `continueVectorHandleDrag.ts`, which was already shared by *both* handle-drag entry points and needed no
  changes itself) resolves `'pending'` to a live `vectorHandleDragRef` the first time the drag clears
  `MIN_DRAG_DISTANCE_PX`, via the same `pickClosestAngleMatch.ts` §32 introduced — reused verbatim, not
  reimplemented, since the angular-distance math is identical.
- `commitVectorCornerHandleDrag.ts` is the shared write (mark the vertex `'symmetric'`, select only the new
  handle, arm `vectorHandleDragRef`) — same three-call-site shape as §32's `commitVectorBendSegment.ts`:
  the unambiguous pointerdown case, the pending-drag resolution above, and `disarmVectorHandleDrag.ts`'s
  pointerup fallback (`candidates[0]`, for a click released with no movement at all).
- `getMirroredVectorSegments.ts` (pre-existing, untouched) still only mirrors the dragged handle onto a
  sibling when the vertex has *exactly one* other touching handle — a true 3+-way branch point never
  triggers it regardless of which candidate the angle-match picks, so this fix doesn't change §9's
  mirroring behavior at all, only which segment gets selected in the first place.

**A real-world wrinkle surfaced while verifying the reported cross**, not from picking the wrong segment
among genuine candidates at one vertex, but from there being *two* vertices at (visually) the same spot:
the Pen tool only reuses an existing vertex when a click lands within `VECTOR_VERTEX_HIT_RADIUS_PX` of it
(`startVectorFragment.ts`, `continueVectorNetwork.ts`) — anything further creates an independent one, and
nothing in the codebase ever merges coincident vertices after the fact. Drawing a horizontal line and then
a vertical one "by eye" through what looks like the same center point can easily produce two separate,
overlapping vertices — one touched by only the left/right segments, the other by only top/bottom — rather
than one shared vertex touched by all four. `getVectorCornerHandleAtPoint`'s nearest-vertex pick, being
stable-sorted, then always resolves to the same one of the two regardless of click position or drag
direction, which is exactly what the reported repro showed (always top+bottom, never left/right). A
grouping fix (treating every vertex within tolerance as one candidate pool, each candidate keyed to
whichever of the grouped vertex ids it actually touches so `commitVectorCornerHandleDrag`'s later
`vertexHandleModes`/mirroring still target the real vertex) was prototyped and works, but deliberately
**not shipped** — confirmed against Figma, which has the same gap (it doesn't merge near-coincident points
from separately-drawn paths either). Precision of the original draw is what determines whether a crossing
shape gets one shared vertex or two independent ones; this fix only guarantees correct direction-based
selection once a real shared vertex exists.

`resolveVectorCornerHandleDrag.ts` and `disarmVectorHandleDrag.ts` both take the whole `selectionRefs`
object rather than picking out `pendingVectorCornerHandleDragRef`/`vectorHandleDragRef` as separate
positional params — the only two functions in this feature that ever need two different selection refs at
once, so passing the container instead of an ever-growing positional list was the more legible call.

Deliberately unit-only (`TEST_CASES.md` #218), for the same reason as §32: pure angle math, no
rendering/timing stake, already precisely asserted via `store.getState()` in `armResolvers.spec.ts`,
`resolveVectorCornerHandleDrag.spec.ts`, and `disarmVectorHandleDrag.spec.ts`.

## 34. §15's active-vertex drag had silently drifted to unconditional mirroring — regated behind Ctrl/Cmd

§15's own text is explicit that the "pressing down back on the vertex you're currently extending
from" case should arm with `segmentId: null`, "no mirroring — same reasoning: no single unambiguous
'incoming' segment to pick if the active vertex is a branch point". At some point after that section
was written, `continueVectorNetwork.ts`'s `isPointNearVertex` branch drifted away from that: it started
calling `getIncomingSegmentId(node, activeVertexId)` unconditionally whenever an incoming segment
existed, mirroring the drag into it every time — with its own dedicated (and passing) unit test
asserting exactly that mirroring as the intended behavior. The doc was never updated to match, so §15's
prose and the actual code disagreed with each other by the time this was reported.

Reported directly, in concrete A→B terms: placing A, placing B with a plain click (straight A-B), then
a fresh press-drag-release gesture starting exactly on B (the active vertex) was bending the
already-committed A-B segment — described as "tworzy tanges na punkcie A" (creates a tangent at point
A) — even though nothing about that gesture should touch A at all. The confusion took a few rounds to
pin down precisely, since the same drag *also* stages a real, always-visible pending-tangent preview
diamond at B for whatever gets drawn next (§18) — a screenshot diff between "dragged from B" and "never
dragged" always differs for that reason alone, regardless of whether A-B itself bent, which is why an
early attempt at an e2e regression test for this (comparing the no-Ctrl case against an all-straight
reference) failed even after the fix — it was accidentally asserting the pending-tangent preview away
too, not just the A-B mirroring. The two renders that actually isolate the fix are "no-Ctrl drag from B"
vs. "Ctrl+drag from B", compared directly against each other — both show the same pending-tangent
diamond at B, so the only remaining difference between them is whether A-B bent.

**The fix, confirmed directly**: the symmetric "both sides bend together" mirroring the user was
describing does belong in this codebase — but as the *Ctrl/Cmd-gated* mechanism (matching §9's
corner-pull and §30's segment-bend, both already Ctrl-gated), not as this gesture's unconditional
default. `continueVectorNetwork.ts` now takes an `isCtrlPressed: boolean` parameter
(`event.ctrlKey || event.metaKey`, threaded down from `startOrContinueVectorNetwork.ts`, the same
plain-OR check §9's `armVectorCornerHandleOnPointerDown.ts`/§9's own note explains is deliberate here
rather than the keyboard-shortcut system's `primaryKeys` machinery):
```ts
const segmentId = isCtrlPressed ? getIncomingSegmentId(node, activeVertexId) : null;
```
Plain drag from the active vertex → `segmentId: null`, same as `startVectorFragment.ts`'s resume-hover
branch and `startNewVectorNetwork.ts`'s first vertex — only the vertex's own pending outgoing tangent
gets staged (§4/§18), the incoming segment stays exactly as committed. Ctrl/Cmd+drag from the active
vertex → mirrors into the incoming segment's `tangentEnd`, restoring §15's originally-drifted-away-from
behavior, now reachable only deliberately. Placing an actual new vertex (`extendWithNewVertex.ts`) is
untouched either way — dragging while creating a genuinely new point still shapes both the new segment's
`tangentStart` and (via the render-only mirrored-preview diamond, §9) the outgoing side, exactly as
before; this section is specifically about re-grabbing the vertex you already placed.

`continueVectorNetwork.spec.ts` gained a fourth branch pair for this exact vertex-with-existing-incoming-
segment case: plain drag → `segmentId: null` (was previously asserted as the mirroring case before this
fix), Ctrl+drag → `segmentId` resolves to the real incoming segment (this is the assertion that used to
run unconditionally). A fifth case closes the one remaining branch `getIncomingSegmentId`'s own
`?? null` fallback needs: Ctrl held but the active vertex has no incoming segment at all (the very first
vertex of a fresh network) — still resolves to `null`, since there's nothing to mirror into regardless of
the modifier. `TEST_CASES.md` #208 was reworded to describe the now-gated behavior; #219 is the new e2e
capture (`pen.spec.ts`) comparing the two renders directly, per the isolation note above.

## 35. §21/§31's multi-select box now hides itself for the duration of a group-translate drag

Asked for directly: while dragging 2+ selected vertices around by grabbing inside their bounding box
(§21's plain group-move mechanism, `armVectorMultiDrag`/`continueVectorMultiDrag`/`disarmVectorMultiDrag`
— distinct from §31's later resize/rotate box, which has its own drag refs), the box itself used to keep
rendering, recomputed fresh from the vertices' live positions every frame — visually just floating along
with the group, adding no information during the move itself (unlike the resize/rotate boxes, which stay
visible on purpose since their own shape *is* the feedback for that gesture). Fixed by hiding the box
specifically for the group-translate case: `drawVectorMultiSelectBox.ts`'s existing three-way branch
(resize-drag box / rotate-drag box / static box) gained a fourth condition on the static branch —
`else if (!isVectorMultiDragMoving)` — so the box renders at rest and during resize/rotate exactly as
before, but not for the one gesture this was asked about.

**Getting `isVectorMultiDragMoving` to the render loop required lifting `vectorMultiDragRef` itself**,
the same "hook-private ref the render loop also needs to see" problem `canvas-rendering-pipeline.md` §1/
§2 and this doc's §13/§19 (corner-radius, ellipse-arc) already solved the same way: the ref moved out of
`TSelectionToolRefs` (previously created privately inside `useSelectionToolRefs.ts`, invisible to the
render loop) into `TCanvasRefs` (`useCanvasRefs.ts`/`createCanvasRefs.ts`), so `Canvas.tsx`'s one shared
`refs` object now owns it, and `useSelectionTool` reads/writes it off that same object like every other
lifted drag-state ref. `drawScene.ts` derives `isVectorMultiDragMoving = Boolean(refs.vectorMultiDragRef
.current?.hasMoved)` once per frame (mirroring `hasCornerRadiusDragMoved.ts`'s own `hasMoved`-keyed
gate, §13) and threads it through `drawVectorEditHandlesLayer.ts` into `drawVectorMultiSelectBox.ts`.

**Every `armVectorMultiDrag`/`continueVectorMultiDrag`/`disarmVectorMultiDrag` call site needed
repointing from `selectionRefs.vectorMultiDragRef` to `canvasRefs.vectorMultiDragRef`**, since the three
functions themselves already took the ref as a plain explicit parameter (not tied to which container
type it came from) — no changes needed inside `armVectorMultiDrag.ts`/`continueVectorMultiDrag.ts`/
`disarmVectorMultiDrag.ts` at all, only their callers. This cascaded to removing the now-fully-unused
`selectionRefs: TSelectionToolRefs` parameter from `armVectorGroupDrag.ts` and
`selectAndArmVectorSegmentDrag.ts` (both only ever used it for this one ref), which in turn simplified
`armVectorSegmentClick.ts` and `armVectorSegmentOnPointerDown.ts` down to not needing `selectionRefs`
at all either — `armVectorVertexClick.ts`/`armVectorHandleClick.ts` kept it, since they still need it for
`selectAndArmVectorVertexDrag`/`selectAndArmVectorHandleDrag`'s own, non-lifted drag refs
(`vectorVertexDragRef`/`vectorHandleDragRef`).

Covered by a new `vector-edit.spec.ts` scenario (`TEST_CASES.md` #220): captures a known-empty baseline
region at the box's own top-edge position (a real, non-degenerate triangle so that edge never coincides
with an actual drawn segment), confirms the box renders there at rest, confirms the same region matches
the empty baseline again mid-drag (pressed and moved past the threshold, not yet released), then confirms
it reappears once released.

## 36. Stroke join geometry — `getThickPolylineVertices.ts`/`getThickVectorPathVertices/`, and a branch-vertex flat-chamfer bug

§3's rendering summary above describes `drawVectorStroke.ts` as "one quad per consecutive flattened
point pair, no joins between them" — that was true when written but has since drifted: every vertex
where two or more of these quads meet now gets an explicit join fill, added because the plain
per-segment quads alone leave a visible triangular notch at any non-collinear corner once stroke width
and zoom are large enough to see it (`VECTOR_STROKE_WIDTH` is 1 world unit — invisible at zoom 1,
obvious at zoom 30+, which is why this class of bug only ever gets caught/reported at high zoom).

**`getPolylineJoinVertices.ts`** is the core primitive: given a vertex point plus the perpendicular
offsets of the segment arriving and the segment leaving, it computes a proper sharp **miter** join
(the two offset lines extended until they meet), falling back to a flat **bevel** quad only when the
turn is collinear (`cross === 0`), a dead 180° reversal (`bisectorLength === 0`), or the miter would
shoot out past `MITER_LIMIT` (4× half-width) on a near-total-reversal turn — same fallback conditions
browsers use for Canvas/SVG `lineJoin: miter`. `getThickPolylineVertices.ts` calls it for every
interior point of a single flattened segment's own point array (relevant once a curve's flattened
into several sub-points, or a closed shape's own middle vertices).

**Network-level joins** (where a Pen-drawn vertex connects *separate* segment objects, the common case
for a straight polyline corner) go through `getThickVectorPathVertices/`: `collectVectorPathVertexEndpoints.ts`
groups every segment-endpoint by shared vertex id, and `getVectorPathJoinVertices.ts` branches on how
many segment-ends land on that vertex — exactly 2 with one incoming/one outgoing reuses
`getPolylineJoinVertices` directly (a plain corner); anything else (a branch vertex touched by 3+
segments, or 2 segments that are both outgoing with no natural incoming side) goes through
`getBranchJoinVertices`.

**The bug, reported directly with a screenshot**: a Pen-tool arrowhead (one shaft segment plus two
segments Ctrl/Cmd-extended from the same vertex, per §32/§33) rendered with a flat chamfer cut into
the tip instead of a sharp point — background visible right where the two diagonal arms should meet.
`getBranchJoinVertices` sorted the vertex's endpoints by angle and, for every angularly-adjacent pair,
filled the wedge between them with a single flat bevel triangle — never attempting a miter, regardless
of the angle. That's correct-looking for the two *narrow* wedges of a 3-arm branch (each ~90° here,
already solid-filled by the segments' own overlapping quads, so a bevel there is redundant but
harmless) — but the *third* wedge, the wide one that wraps around through the branch's actual visible
tip, needs the same sharp miter a plain 2-segment corner gets, and never got one.

**First fix attempt, and why it wasn't enough**: calling `getPolylineJoinVertices` — the same "previous
offset = negated current-arm away-offset, next offset = following-arm away-offset" reconstruction
described above — for *every* angularly-adjacent pair uniformly did produce a sharp tip on the one
wedge that needed it. But it also made the two already-solid wedges each compute their *own*
independent miter, and those two spurious miters project further out than the true tip (`1 + sqrt(2)`
vs the correct `sqrt(2)`, in half-width units) — visibly pulling the whole tip into an asymmetric
"flag" shape, off-axis toward whichever arm's spurious miter reached furthest. Caught live, against a
running build, immediately after the first fix looked plausible in isolation.

**Actual fix**: only the *single widest* gap between angularly-adjacent arms gets the full
`getPolylineJoinVertices` treatment, and only if it's reflex (> 180°) — every other wedge gets the
plain flat `getBevelVertices` quad (now exported from `getPolylineJoinVertices.ts`) with no outward
extension at all. A branch vertex's gaps always sum to exactly 360°, so at most one can be reflex;
when one is, it's provably the one wedge no other arm's quad already covers, and it's the only one
that should ever project a point. The T-branch case above has no reflex gap at all (its widest is the
exact-180° collinear pass-through) — every wedge there gets a bevel, correctly, since none of its
wedges needs a tip. Regression test: `getThickVectorPathVertices.spec.ts`'s "widest wedge is the
exterior one" case asserts the *entire* fan, not just the tip coordinate, specifically to catch the
spurious-extra-miter shape the first attempt produced.

**Verification note**: this class of bug is essentially invisible at default zoom (§ above) — reproducing
and confirming the fix required actually drawing the shape with the Pen tool and zooming in ~30-40x in
a live browser (Playwright MCP), not just reading the vertex math. Both the original flat-notch bug and
the first fix attempt's off-axis spike were only conclusively told apart this way — sign/pairing errors
in this kind of per-wedge offset reconstruction are easy to get subtly wrong in a way that still passes
a plausible-looking manual derivation, and only show up as a visibly wrong tip shape, not a type error
or a failing pre-existing test.

## 37. Angle snap — Pen drawing attracts to horizontal/vertical, colored orange, zoom-aware tolerance

Asked for directly: while extending a network with the Pen tool, a segment aimed close to horizontal
or vertical should snap onto that exact axis (Figma/Illustrator-style "constrain to axis" assist,
always-on rather than modifier-gated) and recolor to orange — reusing the existing edge-hover orange
(`VECTOR_EDGE_HOVER_STROKE`, §4) rather than a new color — while it's snapped.

**Core math — `getAngleSnappedVectorPoint.ts` (`utils/canvas/vectorNetwork/`).** Given `from` (the
active vertex) and `to` (the raw pointer position), it computes the angle via `getAngleBetweenPoints`,
picks the nearest of the four cardinal candidates (`[0, 90, 180, -90]`) via `pickClosestAngleMatch.ts`
(already used by §32/§33's bend/corner-handle candidate resolution — `getAngularDistance` was exported
from that file rather than duplicated, the first cross-feature reuse of that helper), and snaps only if
the angular distance to that candidate is within `VECTOR_ANGLE_SNAP_TOLERANCE_DEGREES` (`constant/canvas.ts`,
`5`, zoom-adjusted — see below).

**Snapping locks the perpendicular axis to `from`, it does not preserve the raw drawn distance** — a
first version re-projected `to` via `distance * cos/sin(snapAngle)`, preserving the exact pointer
distance and rotating it onto the axis. That looked reasonable in isolation but failed its own e2e
regression test: a near-horizontal hover (`to` a couple of px off axis) and a hover exactly on the axis
have slightly different `hypot(dx, dy)`, so the trig reprojection landed the near-horizontal case a
fraction of a world unit away from the exactly-on-axis case — invisible to the eye but enough to fail a
pixel-equality screenshot diff, and not how axis-constrain actually behaves in Figma/Illustrator anyway
(constraining to horizontal keeps the cursor's own x, it doesn't preserve the diagonal drag distance).
Fixed to the simpler, correct shape: `isHorizontal = snapAngle === 0 || snapAngle === 180`, then
`point = isHorizontal ? { x: to.x, y: from.y } : { x: from.x, y: to.y }` — no trig, and a near-axis hover
now resolves to the byte-identical point a dead-on-axis hover would, by construction.

**Tolerance shrinks past 100% zoom, floored — asked for directly mid-implementation ("zoom im bliżej
tym te przyciąganie nie powinno być tak mocne").** `getAngleSnapToleranceDegrees(zoom)` =
`max(VECTOR_ANGLE_SNAP_MIN_TOLERANCE_DEGREES, VECTOR_ANGLE_SNAP_TOLERANCE_DEGREES / max(zoom, 1))` —
at/below 100% zoom the tolerance stays at the flat 5° base (deliberately not made *more* forgiving
zoomed out, only less forgiving zoomed in, since a raw angle in world space is already zoom-invariant on
its own — the tolerance change is a pure feel adjustment, not a geometric correction), and past 100% it
shrinks proportionally to `1/zoom` so a precise, zoomed-in placement doesn't keep getting yanked onto an
axis the way a coarse, zoomed-out one benefits from. `VECTOR_ANGLE_SNAP_MIN_TOLERANCE_DEGREES` (`0.5`)
stops it from shrinking to an unusable sliver at extreme zoom.

**Two call sites, both already had `activeVertex`/`viewport` in scope — no new plumbing needed:**
- **Live preview** — `updateVectorPenPreview.ts`'s existing "no resolver matched" fallback branch (blank
  canvas, mid-fragment) was extracted into its own file, `applyAngleSnapToPenPreview.ts` (flat sibling in
  `handlePointerMove/`, same "named helper over inline branch body" convention `[[xigma-function-style]]`
  calls for), which calls `getAngleSnappedVectorPoint` and writes the result into `penPreviewRef` alongside
  a new `isSnapped: boolean` field. Vertex/edge-hover resolver hits (§4) are untouched and always write
  `isSnapped: false` — angle-snap is strictly the blank-canvas fallback, snapping onto an existing
  point/edge always wins.
- **Commit** — `continueVectorNetwork.ts`'s own blank-canvas branch (the one that calls
  `extendWithNewVertex.ts`) runs the same `getAngleSnappedVectorPoint` call on the point before passing it
  through, then re-applies `roundVectorPoint.ts` (§13) — the trig-free snap already lands on `from`'s own
  y/x (already grid-aligned), so the re-round is a no-op in practice but keeps the "every committed vector
  point is grid-rounded" invariant intact regardless of what a future snap mechanism computes.

**`TPenPreview.isSnapped`** (`types/design/canvas/types.ts`) is the new field threading the flag from
computation through to rendering. `drawPenSegmentPreview.ts` reads it to pick the stroke color:
`preview.isSnapped ? VECTOR_EDGE_HOVER_STROKE : DRAFT_FRAME_STROKE` — the *only* rendering change; the
dot/tangent-handle drawing underneath is untouched.

**Scope note**: angle-snap only ever applies relative to the active vertex being extended *from* — it
has no concept of the previous segment's own direction (absolute screen horizontal/vertical only, asked
for directly over relative-to-last-segment), and it never applies to `startNewVectorNetwork.ts`'s first
point or `startVectorFragment.ts`'s fresh-disconnected-vertex blank-canvas case, since neither has a
`from` vertex to snap relative to.

## 38. §37's angle snap extended to tangent handles — both drag mechanisms, same math, its own two refs

Follow-up ask, immediate: "teraz ten snap dodaj do tangesów wektora" (now add that snap to the vector's
tangents too). Same core math (`getAngleSnappedVectorPoint.ts`, unchanged) and same orange
(`VECTOR_EDGE_HOVER_STROKE`) recolor convention as §37, applied to the two places a tangent handle
itself gets dragged — deliberately **not** the segment-drawing gesture §37 already covers, a
structurally different mechanism (dragging a handle reshapes an existing/staged tangent, it doesn't aim
a new segment).

**Snap origin is always the handle's own vertex, not the handle's current position** — matching §37's
"relative to the vertex you're extending from" convention exactly, just applied to whichever vertex owns
the tangent being dragged instead of the Pen's active vertex.

**Two call sites, both already had the vertex/viewport in scope:**
- **Pen tool click-drag** — `updateVectorHandleDrag.ts` (shapes the just-placed/just-grabbed vertex's
  tangent, §4/§9/§15) now calls `getAngleSnappedVectorPoint(dragStart, point, viewport.zoom)` — `dragStart`
  is always the tangent's own vertex position (armed as such by every call site that sets
  `dragOriginRef`/`dragStartRef`, §4/§9/§15/§17/§27), so no new parameter was needed. The mirrored
  `tangentEnd` written onto the incoming segment (`{ x: -dx, y: -dy }`) picks up the snapped `dx`/`dy`
  for free. A new `penDraggedHandleIsSnappedRef` (`TCanvasRefs`, parent-owned like
  `penDraggedHandlePositionRef` itself — the render loop needs to read it every frame, same reasoning as
  that ref's own §9 addition) carries the flag through to `drawPenDragHandlePreview.ts`, which forwards
  it to `drawTangentHandle.ts`.
- **Vector Edit Mode drag** — `continueVectorHandleDrag.ts` (the `useSelectionTool` resolver dragging an
  already-committed handle, §6/§20) computes `getAngleSnappedVectorPoint(vertex, point, viewport.zoom)`
  before deriving the tangent offset, same shape. A new `snappedVectorHandleRef`
  (`TCanvasRefs['snappedVectorHandleRef']`, `TVectorHandleHover | null` — reusing the existing
  `{end, segmentId}` shape `hoveredVectorHandleRef`/`selectedVectorHandlesRef` already use, rather than a
  bare boolean) records *which* handle is currently snapped, since (unlike the Pen tool's single live
  drag) any of a segment's two ends could be the one being dragged. Set on every `continueVectorHandleDrag`
  tick (`isSnapped ? { end: dragState.end, segmentId: dragState.segmentId } : null`), cleared in
  `disarmVectorHandleDrag.ts` alongside the drag ref itself and in `useSelectionTool.ts`'s tool-switch
  cleanup effect (same place `selectedVectorHandlesRef`/`selectedVectorVertexIdsRef` already reset,
  §21).

**`drawTangentHandle.ts` gained a third `isSnapped` boolean parameter, checked first in its
line-color `switch`** — asked to use a `switch` explicitly rather than the nested `if`s a first pass
used ("switch użyj"): `isSnapped → VECTOR_EDGE_HOVER_STROKE`, `isSelected → VECTOR_HANDLE_FILL`,
`isHovered → VECTOR_HANDLE_HOVER_STROKE`, `default → VECTOR_EDIT_OUTLINE_STROKE` — snapped overrides
both hover and selected, since a handle can legitimately be all three at once mid-drag (armed via a
selected segment's endpoint, per §20's segment-drag-selects-first behavior) and the snap feedback is
the more specific, momentary signal. Every call site threading a boolean down to this function
(`drawSegmentTangentHandles.ts` via a new `snappedHandle: TVectorHandleHover | null` parameter compared
per-end the same way `isHandleSelected` already compares `selectedHandles`; `drawPenDragHandlePreview.ts`
via the new ref's value directly; `drawPenSegmentPreview.ts`'s own tangent-handle draw, §9's persistent
staged-tangent diamond — always `false`, since that one only ever shows a *committed* `tangentStart`
offset, never a live drag) had to add the new positional argument, cascading up through
`drawVectorTangentHandles.ts` → `drawVectorEditHandlesLayer.ts` → `drawScene.ts` the same way
`isDragArmable`/`penDraggedHandlePosition` already do for sibling flags.

**Gotcha, caught before it shipped — negating an axis-locked zero tangent component produces `-0`,**
which fails a plain `toEqual({ x: -20, y: 0 })` Jest/Vitest assertion (`-0` and `0` are `===` but not
`Object.is`-equal, and `toEqual` uses the latter). `updateVectorHandleDrag.ts`'s `tangentEnd: { x: -dx,
y: -dy }` construction now reads `{ x: -dx || 0, y: -dy || 0 }` — `||` coalesces `-0` (falsy) back to
`+0` without disturbing any genuinely non-zero value. Purely a normalization for predictable equality
checks (and consistent serialized JSON, since `-0` round-trips through `JSON.stringify` as `"0"` but
still trips exact-value comparisons before that point) — `-0 === 0` is `true` everywhere else
(arithmetic, rendering, hit-testing), so this was never a visible/behavioral bug, only a latent testing
footgun that angle-snap made newly common (an exact-zero locked axis is now a routine case, not a rare
floating-point coincidence).

**Scope note, same as §37's**: only the two drag-a-handle mechanisms above snap — a handle's *rest*
position (an already-committed tangent, untouched) and the render-only default-preview construction
(§9's `getEffectiveTangentStart`/`getEffectiveTangentEnd`) are never snapped, since neither is a live
drag with a `from`/pointer pair to measure an angle between.

## 39. Shift hard-constrains the angle snap to every 15deg increment (Figma parity), and re-evaluates immediately on keydown/keyup with no pointer movement needed

Follow-up ask, direct: "chcę gdy user trzyma shift snap się dodatkowo robił w kątach... W figmie jest
tak od 0 do 90 stopni mozna dodatkowo zrobić pod kątem 5 snapów" (want the snap to additionally happen
at other angles while Shift is held — Figma allows 5 extra snap angles between 0 and 90). Confirmed
directly as a **hard constraint** (always snaps to the nearest 15° increment regardless of how far the
raw angle is, not a wider tolerance around more candidates) and as applying to **both** segments and
tangent handles, matching §37/§38's existing scope exactly.

**`getAngleSnappedVectorPoint.ts` gained a fourth parameter, `isShiftPressed` (default `false`,
backward-compatible with every pre-existing call site).** When `true`, it takes a completely different
branch (`getShiftSnappedPoint`) instead of the tolerance-gated cardinal-only logic §37 already had:
```ts
const getShiftSnappedPoint = (from: TPoint, to: TPoint): TPoint => {
  const angle = getAngleBetweenPoints(from, to);
  const snapAngle = Math.round(angle / VECTOR_SHIFT_ANGLE_SNAP_INCREMENT_DEGREES) * VECTOR_SHIFT_ANGLE_SNAP_INCREMENT_DEGREES;

  return getPointOnSnapAngle(from, to, snapAngle);
};
```
`VECTOR_SHIFT_ANGLE_SNAP_INCREMENT_DEGREES` (`15`, `constant/canvas.ts`) — plain rounding to the
nearest multiple works correctly across the full `atan2` range `(-180°, 180°]` with no candidate-list/
wraparound logic needed (unlike §37's `pickClosestAngleMatch`), since 15 evenly divides 360 and
`Math.round` already handles the ties. Shift mode is checked **before** the zoom-tolerance check and
short-circuits past it entirely — `isSnapped` is unconditionally `true` whenever Shift is held (except
the pre-existing zero-distance guard), since a hard constraint has no "close enough" concept to fail.

**`getPointOnSnapAngle` generalizes §37's axis-lock trick to arbitrary angles, extracted as its own
function reused by both modes.** The cardinal-only default snap always resolved to exactly `{x:
to.x, y: from.y}` or `{x: from.x, y: to.y}` — no trig, hence byte-identical near-axis-vs-exact-axis
results (§37's own fix, still true and still exercised: the default mode's candidates are still only
`[0, 90, 180, -90]`, so it can never reach the third branch below). Shift's 15° increments need a
real construction for the 8 non-cardinal angles (15°, 30°, 45°, 60°, 120°, 135°, 150°, 165° — mirrored
across all four quadrants), built as a vector projection:
```ts
const getPointOnSnapAngle = (from: TPoint, to: TPoint, snapAngleDegrees: number): TPoint => {
  if (snapAngleDegrees === 0 || snapAngleDegrees === 180 || snapAngleDegrees === -180) {
    return { x: to.x, y: from.y };
  }
  if (snapAngleDegrees === 90 || snapAngleDegrees === -90) {
    return { x: from.x, y: to.y };
  }

  const radians = (snapAngleDegrees * Math.PI) / 180;
  const directionX = Math.cos(radians);
  const directionY = Math.sin(radians);
  const projectedDistance = (to.x - from.x) * directionX + (to.y - from.y) * directionY;

  return { x: from.x + projectedDistance * directionX, y: from.y + projectedDistance * directionY };
};
```
This is the dot product of the raw cursor vector onto the snapped direction's unit vector — the same
"drop the perpendicular component, keep the along-ray component" construction Figma's own shift-
constrain uses (confirmed against its behavior directly), which is *why* it correctly generalizes the
cardinal case rather than needing a separate formula: at exactly 0°/90°/180°/270° the projection would
algebraically reduce to the same axis-lock result, but those three angles are special-cased anyway to
avoid `Math.cos`/`Math.sin` floating-point noise on values that used to be — and still must remain —
exact.

**A first version tried unifying all four candidates through the trig projection formula uniformly
(no special-casing), and it broke an already-passing e2e pixel-equality test.** `from.x + (to.x -
from.x) * 1.0` is not always bit-identical to `to.x` in floating point for arbitrary values, even
though it's algebraically the same number — this reintroduced exactly the kind of near-axis-vs-
exact-axis discrepancy §37's *own* "why the first trig attempt failed" story already worked through
and fixed once. Keeping the three cardinal branches as plain coordinate copies (no arithmetic at all)
is what preserves that already-hard-won byte-identical guarantee; only genuinely non-cardinal angles
go through the projection math, where no such pre-existing exact-equality test could ever have existed
in the first place (§37 never covered 15°/30°/etc.).

**Threaded through the same four call sites §37/§38 established, all backward-compatible defaults:**
`applyAngleSnapToPenPreview.ts` → `updateVectorPenPreview.ts` → Pen's `handlePointerMove.ts` (reads
`event.shiftKey`) for the live rubber-band preview; `updateVectorHandleDrag.ts` (Pen tangent
click-drag) also reads `event.shiftKey` from the same `handlePointerMove.ts`; `continueVectorNetwork.ts`
gained the parameter for the **commit** point (blank-canvas branch, same as §37's own commit-time call),
threaded from `startOrContinueVectorNetwork.ts` reading `event.shiftKey` off the `pointerdown` event
(mirroring the existing `event.ctrlKey || event.metaKey` line right above it — Shift has no
platform-alternate key, so no `||` needed); `continueVectorHandleDrag.ts` (Vector Edit Mode) reads
`event.shiftKey` directly off its own `pointermove` event, same call site §38 modified for the
tolerance-based mode.

**Second follow-up, immediate: "jak wciśnie się shift podczas rysowania to od razu robi snapa nawet
jeśli user nie ruszy myszką" (pressing Shift while drawing should snap right away even if the user
doesn't move the mouse) — Figma's own behavior.** Every one of the four call sites above only runs
inside a `pointermove` handler, so pressing/releasing Shift while the cursor is stationary previously
changed nothing until the next real mouse movement — a real, live-feel gap this ask closed.

**Fix: track the last known screen pointer position, and replay it as a synthetic `pointermove` on
every Shift `keydown`/`keyup`.** Both `useDrawPenTool.ts` and `useSelectionTool.ts` gained a
`lastPointerClientPositionRef` (`useRef<TPoint | null>`, hook-local — not lifted to `TCanvasRefs`,
since nothing outside either hook's own `onShiftKeyChange` closure ever needs it), written at the top
of **both** `onPointerDown` and `onPointerMove` (not `onPointerMove` alone — a Shift press immediately
after the very first `pointerdown` of a drag, before any `pointermove` has fired yet, needs a known
position too; this was caught by a first draft of the Pen-tool test that pressed Shift right after
`pointerdown` with zero `pointermove`s and got no effect, before the fix moved the position-recording
call up into `onPointerDown` as well):
```ts
const onShiftKeyChange = (canvas: HTMLCanvasElement, event: KeyboardEvent): void => {
  if (event.key === 'Shift' && lastPointerClientPositionRef.current) {
    const { x, y } = lastPointerClientPositionRef.current;

    onPointerMove(canvas, new PointerEvent('pointermove', { clientX: x, clientY: y, pointerId: -1, shiftKey: event.shiftKey }));
  }
};
```
A direct function call into the hook's own `onPointerMove`, not a real `canvas.dispatchEvent(...)` —
reuses the exact same preview/drag branching logic with zero duplication, and can't create a feedback
loop the way dispatching a real DOM event onto the listened-to element might. `pointerId: -1` is never
read by anything downstream (`getPointerPosition.ts` only reads `clientX`/`clientY`; nothing in either
call chain touches `event.pointerId` for a `pointermove`), so any placeholder value works.

**`useDrawPenTool.ts`**: window-level `keydown`/`keyup` listeners added alongside the existing
canvas-level pointer listeners, gated the same way (only attached while `activeTool === ToolName.pen`).
Calling the existing `onPointerMove` unconditionally is safe here regardless of session state — with no
active vertex and no drag in progress it just falls through to the idle `updateNewVertexPreview` branch,
which doesn't read Shift at all (§37's scope note: angle-snap never applies with no `from` vertex), so a
Shift press before ever clicking anything is a harmless no-op recompute of the same idle state.

**`useSelectionTool.ts`**: same shape, but gated on `selectRefs.vectorHandleDragRef.current` being
non-null before replaying the synthetic move — deliberately **not** unconditional the way the Pen
tool's version is. This hook's `handlePointerMove.ts` unconditionally runs all fourteen `continue*Drag`
functions every real `pointermove` (§ "selection-and-manipulation.md" §1), and most of them dispatch a
real `updateNode` on every call when their own ref is armed (resize, rotate, plain move, ...) — replaying
a synthetic move at the *same* screen position they already processed would just make them redundantly
re-dispatch identical values (harmless but wasteful, and arguably surprising to trigger from a keystroke
unrelated to whatever gesture is actually in progress). Gating on `vectorHandleDragRef` specifically —
the only one of the fourteen that reads `shiftKey` at all — keeps the synthetic replay scoped to exactly
the mechanism it exists for.

**Test coverage caught a genuine floating-point precision gap, not a logic bug.** A first unit test for
the Shift-hard-constrain preview case asserted `toMatchObject({ to: { x: 100, y: 100 } })` for a 45°
diagonal drag from the origin — algebraically exact (45° is already a 15°-multiple, so the "constrained"
point should equal the raw input), but the projection formula's `Math.cos(45°)`/`Math.sin(45°)`
round-trip landed at `100.00000000000001`, failing exact equality. Not a bug in the implementation —
the same floating-point reality any trig-based reconstruction has — fixed by asserting with
`toBeCloseTo` instead of exact equality for that one non-cardinal case, consistent with how the rest of
this feature's non-cardinal-angle tests were already written.

Covered by 8 new e2e scenarios (`TEST_CASES.md` #229-234) across `pen.spec.ts`/`vector-edit.spec.ts`:
Shift-commit and Shift-drag hard-constraint for both segments and tangent handles (asserting the
Shift-held render *differs* from the identical no-Shift gesture, the same robustness-over-exact-pixel-
match approach used throughout this feature for trig-path cases — see §37's own note on why exact
pixel equality is reserved for the trig-free cardinal path), plus three immediate-re-evaluation-on-
keydown scenarios (rubber-band preview, Pen click-drag, and Vector Edit Mode drag) that assert a
screenshot taken right after `page.keyboard.down('Shift')` — with **zero** intervening pointer
movement — already differs from the screenshot taken just before it. A new `shiftDragVectorPoint`
helper was added to `DesignPage.ts`, mirroring the existing `ctrlDragVectorPoint` shape exactly.

## 40. Smart alignment guides — Figma-style row/column snapping against every vertex on the scene, for both Pen drawing and Vector Edit Mode dragging

Asked for directly, with two reference screenshots of Figma's own behavior: a thin orange/coral guide
line connecting the point currently being placed/dragged to another vertex elsewhere on the canvas —
possibly on a completely different shape — whenever the two line up on the same x (vertical guide) or y
(horizontal guide). Three scope questions were asked and answered up front: candidates are **every
vertex of every Vector node on the scene**, not just the current network (matching what the screenshots
showed — alignment to a vertex on an unrelated shape); the guide **actually snaps** the position, it
isn't just a visual hint; and it applies to **both** vertex placement/dragging and tangent-handle
dragging, mirroring §37/§38's own scope exactly.

**Core math — `getVectorAlignmentGuide.ts` (`utils/canvas/vectorNetwork/`), a per-point primitive
unrelated to `getAngleSnappedVectorPoint.ts`.** Given one `point` and a flat list of candidate
`TPoint`s, it independently finds the closest candidate sharing `point`'s x (within
`toleranceWorldUnits`) and the closest one sharing its y — a `reduce` accumulating a
`{distance, point}` pair per axis via a small `getClosestMatch` helper, replaced only if the new
candidate is both within tolerance and closer than the current best. Both axes resolve completely
independently, so a point can align vertically to one vertex and horizontally to a *different* one at
the same time — the exported result type is `TVectorPointAlignmentMatch = {horizontal: TPoint | null,
point: TPoint, vertical: TPoint | null}`, where `point` is the snapped position (the matched axis pulled
onto the candidate's coordinate, the untouched axis left alone).

**`getAllVectorVertexPositions.ts` (`components/Design/Canvas/utils/`) gathers the candidate pool —
first written in the wrong module layer, self-caught before it shipped.** It was initially placed in
the global `utils/canvas/vectorNetwork/` folder, importing `bakeVectorNodeRotation.ts` (feature-local)
to get world-space positions for rotated nodes. That's exactly the "global layer importing from
`components/`" violation this doc's own `getVectorPointsInRect.ts` story already worked through once
(that file had to reimplement `isPointInRect.ts` locally rather than import the feature-local version)
— caught on review, fixed by moving the file to `components/Design/Canvas/utils/` and switching to a
relative import. It flattens every `TVectorNode`'s vertices (via `bakeVectorNodeRotation`'s read-only
preview transform, same convention `drawVectorEditHandlesLayer.ts` already uses) across the *entire*
`nodes` record, filtering out any ids in an `excludeVertexIds: string[]` parameter — a point trivially
"aligns" with itself, and (added for the group-drag case below) with every other vertex currently being
dragged alongside it.

**`applyVectorPointSnapping.ts` (`components/Design/Canvas/utils/`) is the orchestrator merging §37's
angle-snap with this feature's alignment guide into one call, used by every single-point call site.**
Two independent mechanisms — `getAngleSnappedVectorPoint` (relative to `from`, the anchor vertex) and
`getVectorAlignmentGuide` (relative to every *other* scene vertex) — resolve separately, then merge
per axis: a matched alignment guide wins that axis over whatever the angle snap produced for it, since
lining up exactly with a real point elsewhere is a more specific signal than a directional preference;
the axis the guide didn't touch keeps the angle snap's own result. This is a deliberate priority rule,
not an arbitrary pick — it's what makes a diagonal drag that happens to also line up with another vertex
snap onto that vertex rather than the nearest 15°/cardinal direction.

**The guide's own rendering type, `TVectorAlignmentGuide`, carries a separate anchor per axis — not one
shared point — specifically to support the group-drag case below.** A single dragged point's guide has
one obvious anchor (its own position), but a *group* of several dragged vertices can have its vertical
guide anchored on one of them and its horizontal guide anchored on a completely different one (see the
group-alignment case). The type reflects that from the start:
```ts
export type TVectorAlignmentAxisGuide = { anchor: TPoint; match: TPoint };
export type TVectorAlignmentGuide = { horizontal: TVectorAlignmentAxisGuide | null; vertical: TVectorAlignmentAxisGuide | null };
```
For a single-point caller, `applyVectorPointSnapping.ts` builds both axes' `anchor` from the same final
merged `point` — visually identical to a single shared anchor, just expressed through the general shape.
`drawVectorAlignmentGuide.ts` (new file, called unconditionally every frame in `drawScene.ts` like every
other ref-gated preview layer) draws up to two independent 1px (zoom-scaled) lines, `guide.vertical.anchor
→ guide.vertical.match` and `guide.horizontal.anchor → guide.horizontal.match`, in a new
`VECTOR_ALIGNMENT_GUIDE_STROKE` (`#cd4422`, `constant/canvas.ts` — happens to reuse the same hex as
`VECTOR_EDGE_HOVER_STROKE`, unrelated coincidence, not a shared constant). `vectorAlignmentGuideRef`
(`TCanvasRefs`, parent-owned like every other per-frame render-loop input) is the ref threading the
current guide (or `null`) from whichever call site last computed one through to this draw call.

**A real, live-tested bug: the alignment tolerance shrank at zoom below 100%, unlike every other
pixel-tolerance conversion in this codebase.** First written as
`VECTOR_ALIGNMENT_SNAP_TOLERANCE_PX / Math.max(zoom, 1)` — copying §37's own `getAngleSnapToleranceDegrees`
clamp pattern by instinct. But that clamp exists there specifically because *degrees* are a
zoom-invariant unit already (§37's own doc: "a raw angle in world space is already zoom-invariant on its
own"), so the clamp is a deliberate *feel* choice, not a geometric necessity. A pixel-distance tolerance
is different: every other conversion in this codebase (`VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom`,
`VECTOR_EDGE_HIT_TOLERANCE_PX / viewport.zoom`, no clamp, throughout `useSelectionTool`/`useDrawPenTool`)
keeps the *screen-space* tolerance constant at every zoom level by dividing by the raw zoom with no
floor. The clamped version instead kept the *world-space* tolerance constant below 100% zoom, which
means the on-screen catch radius shrank the further out you zoomed (at 50% zoom, an intended ~4 screen
px tolerance collapsed to ~2). Reported live ("Ten guide póki co nie działa" — this guide doesn't work
yet) after the rest of the wiring had already been code-reviewed clean; found by comparing against the
established `CONST_PX / viewport.zoom` convention rather than by guessing, fixed to match it exactly
(`VECTOR_ALIGNMENT_SNAP_TOLERANCE_PX / zoom`, no clamp).

**Wired at six call sites — three single-point ones reusing `applyVectorPointSnapping.ts` directly,
three group ones needing a second, purpose-built aggregator:**

- **Pen rubber-band preview** — `applyAngleSnapToPenPreview.ts` (§37/§38's own file) gained a `nodes`
  parameter and now calls `applyVectorPointSnapping` instead of `getAngleSnappedVectorPoint` directly,
  writing `vectorAlignmentGuideRef.current` alongside the existing `isSnapped`/`to` fields.
  `updateVectorPenPreview.ts` clears the guide ref on every branch that *doesn't* reach this fallback
  (a resolver hit, or no active vertex at all) — the guide is strictly a blank-canvas-fallback concept,
  same scope note as angle-snap's own.
- **Pen commit** — `continueVectorNetwork.ts`'s blank-canvas branch (the one calling
  `extendWithNewVertex.ts`) runs the same `applyVectorPointSnapping` call before `roundVectorPoint.ts`,
  then unconditionally clears `vectorAlignmentGuideRef.current = null` right after the whole
  arm-a-drag-or-commit `if`/`else` — a live guide is a preview concept that shouldn't outlive the
  discrete action that follows it.
- **Pen tangent click-drag** — `updateVectorHandleDrag.ts` (§38's own file), same substitution.
- **Vector Edit Mode tangent drag** — `continueVectorHandleDrag.ts` (§38's own file) swapped its direct
  `getAngleSnappedVectorPoint` call for `applyVectorPointSnapping`, excluding the handle's own vertex id
  from candidates. Refactored in the same change to take whole `canvasRefs: TCanvasRefs` and
  `selectionRefs: TSelectionToolRefs` objects instead of the two individual refs it used to receive
  (`vectorHandleDragRef`, `snappedVectorHandleRef`) — asked for directly mid-review ("selectionRefs,
  canvasRefs przekazuj jako jeden argument w sensie cały obiekt ref"), matching the whole-object
  convention `resolveVectorCornerHandleDrag.ts`/`disarmVectorHandleDrag.ts` already established.
- **Vector Edit Mode single-vertex drag** — `continueVectorVertexDrag.ts`, previously a bare
  `deltaX`/`deltaY` translate with no snapping concept of any kind (not even angle-snap). Same
  refactor to whole-object params; computes a group-alignment result (below) over its one dragged
  vertex's raw projected position.
- **Vector Edit Mode multi-drag (box-drag of several selected vertices/handles at once)** —
  `continueVectorMultiDrag.ts`. This one was genuinely missed on the first pass: the single-vertex path
  (`continueVectorVertexDrag.ts`) got wired first and reported working live ("Na single point działa"),
  which surfaced the *real* gap by contrast ("jak boxem przesuwam kilka pointów to nie działa" — doesn't
  work when moving several points via the box) — a materially different drag mechanism
  (`TVectorMultiDragState`, its own `vertexOrigins`/`handleOrigins`/`boxOrigin`), not a variant of the
  single-vertex one.

**Group alignment needed a second aggregator, `getVectorGroupAlignmentGuide.ts` — asked for directly
("Musi być pod multi i kotwiczyć jesli któryś się zetknie jak w Figmie"): the whole group moves as one
rigid unit, but any single dragged vertex touching a guide should pull the entire group by that
correction.** Reuses the per-point `getVectorAlignmentGuide` primitive unchanged, called once per
dragged vertex's raw (pre-correction) projected position, then picks the single closest match across
*all* of them independently per axis — so a vertical match on one dragged vertex and a horizontal match
on a completely different one can both win at once, each keeping its own anchor. A `deltaCorrection:
TPoint` is derived from the winning match(es) (`match.x - point.x` for vertical, `match.y - point.y` for
horizontal) and added to the group's raw `deltaX`/`deltaY` *before* translating anything — vertices,
tangent handles (`handleOrigins`), and the canonical multi-select box (`boxOrigin`) all move by that
same corrected delta, keeping the whole selection rigid. `continueVectorVertexDrag.ts`'s single-vertex
case is just this same aggregator called with a one-element `draggedPoints` array — no separate code
path, the group case subsumes the single one exactly.

**A live-tested clarification shaped the anchor design: "guide dostosowuje się do pozycji myszki a nie
kropki" (the guide follows the mouse, not the dot) — correct during Pen drawing (no grab-offset concept,
the placed point *is* the cursor), wrong anywhere in Vector Edit Mode (dragging an existing
element must track that element's own — possibly grab-offset-preserved, possibly snapped — position, not
the raw cursor).** This is exactly why `TVectorAlignmentGuide`'s anchor is derived from each mechanism's
*final, corrected* position rather than the raw pointer: `continueVectorHandleDrag.ts`'s tangent handle
has no grab-offset (it tracks the cursor 1:1 by design, matching how handles always behaved), so its raw
`point` already *is* the right anchor once matched; `continueVectorVertexDrag.ts`/`continueVectorMultiDrag.ts`
preserve whatever offset existed between the click and the vertex's own position (`origin + delta`, not
the raw cursor), and the group aggregator's anchors are built from the *post-correction* position
specifically so the rendered guide line always touches the dot's true landing spot, never wherever the
mouse happens to be mid-drag.

**Redundant ref-passing cleanup, caught mid-review on the multi-drag wiring specifically:**
`continueVectorMultiDrag.ts`/`disarmVectorMultiDrag.ts` had each gained a `canvasRefs: TCanvasRefs`
parameter for the alignment-guide ref while *also* still receiving `vectorMultiDragRef`/
`vectorMultiSelectBoxRef` as separate parameters — both of which are themselves just fields on that same
`canvasRefs` object, spotted directly in the call site diff ("Co to ma być?"). Both files now take only
`canvasRefs` and read `canvasRefs.vectorMultiDragRef`/`canvasRefs.vectorMultiSelectBoxRef` internally,
matching the same whole-object convention applied to the other four call sites above.

Every ref that carries a live guide is cleared in the matching disarm/cleanup path, mirroring how
`snappedVectorHandleRef`/`penDraggedHandleIsSnappedRef` are already handled: `useDrawPenTool.ts`'s
`onPointerUp`/`onPointerCancel`/unmount cleanup; `disarmVectorHandleDrag.ts`, `disarmVectorVertexDrag.ts`,
and `disarmVectorMultiDrag.ts` on release; `useSelectionTool.ts`'s tool-switch unmount cleanup.

Covered by 4 new e2e scenarios (`TEST_CASES.md` #235-238) — Pen-tool commit, Vector Edit Mode tangent
drag, single-vertex drag, and box-drag of a multi-selected group — each following §37's own
pixel-equality-over-exact-pattern approach: a scenario with the raw drag landing a couple of px off
another shape's vertex row/column, compared against an independent reference run landing exactly on it,
asserting the two screenshots are byte-identical.

## 41. `VectorEditToolbar` — the floating Move/Lasso/Paint/Bend/Cut panel shown only in Vector Edit Mode

A new floating UI panel, not a new interaction mechanism — asked for directly with two Figma reference
screenshots and exact SCSS values (spacing/radius/elevation tokens, panel/button styles). Lives at
`components/Design/Toolbar/VectorEditToolbar/`, nested under the main `Toolbar` (not a
`DesignPage.tsx`-level sibling) specifically so it can render `bottom: calc(100% + 10px)` — anchored
10px above `Toolbar`'s own box and horizontally centered against it, rather than hardcoding a pixel
offset from the viewport bottom that would silently drift if `Toolbar`'s own height/position ever
changed. Mounted unconditionally by `Toolbar.tsx` as a sibling of `MouseModes`; renders `null` itself
whenever `selectVectorEditingNodeId` is `null`.

**Global design tokens introduced for this, in a new `src/styles/_variables.scss`** (asked for
directly — "Najlepiej plik variables.scss" — kept separate from `_theme.scss`, which is specifically
the dark/light color-map generator, not a home for spacing/radius/shadow constants): `--spacer-2`
(`8px`), `--radius-medium` (`8px`, not explicitly specified — picked as a reasonable middle value
between `MouseModes`' hardcoded `5px` button radius and this feature's own `--radius-large` `13px`),
`--radius-large` (`13px`), `--elevation-200-canvas` (the exact multi-layer shadow value given). No new
`--color-bg`/`--color-bg-toolbar-selected` color tokens, even though the original ask's CSS pasted
those names directly — added once, then explicitly removed ("Usunąłem zmienne pod kolor nie ma sensu
duplikować"): they'd have been pure aliases of the already-existing `--color-neutral-5`/`--color-blue-1`
(matching `Toolbar`'s own background and the existing blue selected-state color), so the component's
SCSS references those two directly instead.

**Every button is built from one static config, `TOOLS` (`VectorEditToolbar/constants.ts`), not
individually hand-written JSX** — asked for directly, twice (first "z const z budować tą listę", then
"tools do constants.ts i TOOLS" once the const existed but still lived inline in the component):
```ts
export type TVectorEditTool = { icon: keyof typeof Icons; labelKey: string; toolName?: ToolName };
export const TOOLS: TVectorEditTool[] = [
  { icon: 'MoveVectorTool', labelKey: 'design.toolbar.tool.default', toolName: ToolName.default },
  { icon: 'LassoTool', labelKey: `${translationNameSpace}.tool.lasso` },
  { icon: 'PaintTool', labelKey: `${translationNameSpace}.tool.paint` },
  { icon: 'BendTool', labelKey: `${translationNameSpace}.tool.bend` },
  { icon: 'CutTool', labelKey: `${translationNameSpace}.tool.cut` },
];
```
The optional `toolName` field is the load-bearing bit: only Move carries one (`ToolName.default`, the
one real, pre-existing tool this whole panel reduces to right now), so it's the only entry rendered as
clickable/highlightable — Lasso/Paint/Bend/Cut render through the exact same `renderTool` path but come
out inert (no `onClick`, `aria-pressed` always `false`), since none of them has a `ToolName` to drive
yet ("narazie niektóre narzędzie nie mamy więc dodamy później"). Adding a real tool later is just
filling in that field — no branching to add. `More` and `Close` are deliberately **not** in `TOOLS` and
stay hand-written in the component ("tutaj jest close wiec pewnie będzie indywidualny case") — `More`
has no dropdown menu yet (nothing to populate it with) and reverses icon/label order from every other
button; `Close` has real behavior (see below) but no label/active-state concept at all. Icon size is a
flat `24px` across every `TOOLS`-driven button, asked for directly ("Icon size 24px dla kazdej").

**Active/inactive derivation, asked for directly: "Generalnie jeśli jest aktywny pen to żadne narzędzie
nie jest aktywne. Jeśli przerwiemy pen domyślnie opcja move... która już jest [aktywna]."** Move's
`isActive` is `tool.toolName !== undefined && activeTool !== ToolName.pen` — deliberately phrased as
"not Pen" rather than "equals default", since Move is the *only* tool with a `toolName` today and is
meant to read as active for literally every non-Pen state, matching "Move is already the implicit
default the moment Pen stops being active" rather than requiring an exact `ToolName.default` match that
would need revisiting the instant a second real tool joins `TOOLS`.

**All the dispatch/selector logic — `renderTool`, `handleClose`, exposing `vectorEditingNodeId` —
lives in a dedicated hook, `hooks/useVectorEditToolbar.tsx`, not inline in the component** (asked for
directly, twice: first `renderTool` into `useCallback` to stop it being redefined every render with no
memoization, then the whole `handleClose` + `renderTool` pair "do hooka" for full separation).
`VectorEditToolbar.tsx` itself is now pure JSX consuming the hook's return value — no `useAppDispatch`/
`useAppSelector` calls of its own. One Rules-of-Hooks gotcha from the extraction: the component's own
early-return (`if (!vectorEditingNodeId) return null`) has to come **after** the `useVectorEditToolbar()`
call, not before — hooks can never run conditionally, and the hook call was originally interleaved with
the early-return during the incremental `useCallback` step, which briefly violated that.

**`Close` (X) is a hard, unconditional exit — not the 3-stage Escape from §"Pen/vector" in
`ROADMAP.md`'s Etap 6.** `handleClose` dispatches both `setActiveTool(ToolName.default)` and
`setVectorEditingNodeId(null)` in one go, regardless of whatever stage Escape would currently be on —
clicking the panel's own close button is an explicit single action, so it collapses what Escape does
over up to three separate presses into one.

**Icon assets already existed on disk** (`move-vector-tool.svg`, `lasso-tool.svg`, `paint-tool.svg`,
`bend-tool.svg`, `cut-tool.svg`) but weren't registered in the shared icon barrel yet — added to
`assets/svg.ts`'s import list and `Icons` export object, both alphabetically sorted per that file's own
convention. New i18n keys added to both `en.json`/`pl.json`: `design.toolbar.vectorEditToolbar.*`
(nested under `design.toolbar.*`, matching the component's physical nesting under `Toolbar/` — nudged
into place after the component itself got moved there, see below) for Lasso/Paint/Bend/Cut/More, plus a
new standalone `common.close` reused by any future icon-only close button elsewhere. Move's own label
reuses the *existing* `design.toolbar.tool.default` key rather than adding a duplicate — same tool,
same name, no reason for two keys.

**Landed mid-refactor: a separate, concurrent cleanup removed a redundant `components/` folder segment
throughout `Canvas/` (`Canvas/components/Comment/...` → `Canvas/Comment/...`,
`Canvas/components/TextEditOverlay/...` → `Canvas/TextEditOverlay/...`), and moved this feature's own
folder from a `DesignPage.tsx`-level `components/Design/VectorEditToolbar/` to its final
`components/Design/Toolbar/VectorEditToolbar/` nested location — both **not** self-contained to this
feature ("Nigdy nie twórz components folder to trochę przesada" / "Takie zagnieżdżanie" was a
repo-wide instruction, not scoped to this one component).** The moves briefly broke several relative
imports that hadn't been updated for the new depth — two TS import paths (`CommentDraftInput.tsx`'s
import of `CommentDraftFooter`, `CommentDraftFooter.tsx`'s import of `useSubmitCommentDraft`) and two
SCSS `@use` paths (`comment-pin.module.scss`, `comment-draft-input.module.scss`, both pointing at
`styles/mixins/`) — each simply had one-to-two extra `../` segments left over from the deeper
pre-cleanup structure. Fixed by recounting the actual directory depth from each file's new location
rather than guessing; a repo-wide scan (both a clean `tsc -p tsconfig.app.json --noEmit` run and a
Python script resolving every `@use`/`@import '../...'` path in every `.scss` file against what
actually exists on disk) confirmed no other file was left with a stale relative path. `VectorEditToolbar`'s
own `translationNameSpace` computation (`` `${toolbarNamespace}.vectorEditToolbar` ``, importing
`Toolbar/constants.ts`'s own namespace rather than `Design/constants.ts`'s root one) had to be adjusted
in the same move, since the relative import that used to reach the `design`-root namespace directly
now resolves one level shallower.

## 42. The Lasso tool — freeform vertex-only selection, its own arm resolver precedence, and a real transparency bug it surfaced in `drawVectorFill.ts`

A new dedicated Vector Edit Mode tool (`ToolName.lasso`, shortcut `Q`) — not a modifier on the
existing rectangular marquee (§21/§31), a genuinely separate tool with its own icon/cursor/keyboard
shortcut, activated from `VectorEditToolbar` (§41) or the "Q" key. Two screenshots of Figma's own
lasso were the spec: a freeform, hand-drawn contour whose interior fills translucent and whose border
renders dashed, snapping the selection to whatever vertices land inside it as it's drawn.

**Scope, confirmed directly rather than assumed**: candidates are **vertices only** — no
handles/segments mode-switching the way the box marquee's `resolveVectorMarqueeMode.ts`
(points/handles/everything) does. This was asked and answered explicitly up front, deliberately
simpler than parity with the existing marquee.

**A dedicated tool needs to intercept the click before any vertex/handle/segment resolver gets a
chance — the existing resolvers in `ARM_RESOLVERS` (`useSelectionTool/utils/handlePointerDown/
constants.ts`) never check `activeTool` at all, they only gate on `vectorEditingNodeId` and
hit-testing.** That's correct for Move (the *implicit default* interaction while in Vector Edit Mode
with no dedicated tool selected), but wrong for Lasso: starting a lasso stroke directly on top of an
existing vertex must never arm a vertex-drag. `armVectorLassoOnPointerDown.ts` is inserted as the
very **first** entry in `ARM_RESOLVERS`, checking `activeTool === ToolName.lasso &&
vectorEditingNodeId` and unconditionally consuming the event (returning `true`) whenever that holds,
regardless of what's under the cursor. This required adding `activeTool: ToolName` to `TArmContext`
(`handlePointerDown/types.ts`), populated once in `handlePointerDown.ts` via `selectActiveTool(state)`
— the first field any resolver needed that wasn't already computed per-pointerdown. Covered directly
by a live e2e test (`TEST_CASES.md`, new): a lasso drag starting exactly on an existing vertex and
ending far away leaves that vertex's own pixel region completely unchanged, proving no drag armed.

**The drawn path is a single ref, not split between selection-tool bookkeeping and canvas-render
mirroring** — `canvasRefs.vectorLassoPathRef: RefObject<TPoint[] | null>` (new `TCanvasRefs` field,
threaded through `useCanvasRefs.ts`/`createCanvasRefs.ts` the same as every other canvas ref) holds
the live, growing point array used for *both* the running hit-test on every `pointermove`
(`continueVectorLassoDrag.ts`) *and* the render loop's own read of it every frame
(`drawScene.ts` → `drawVectorLasso.ts`) — matching `canvasRefs.marqueeRef`'s own precedent of one ref
serving both roles for the rectangular marquee, rather than splitting drag-arithmetic state
(`selectionRefs`) from a separate render-mirror the way some earlier features do.

**Hit-testing reuses the ray-casting algorithm already living in `components/Design/Canvas/utils/
isPointInPolygonVertices.ts`, but doesn't import it** — the new `getVectorPointsInPolygon.ts`
(`utils/canvas/vectorNetwork/`, a **global**-layer file) reimplements the same point-in-polygon math
locally, exactly the layering rule this doc's own §"module-structure" story already established for
`getVectorPointsInRect.ts` (which similarly reimplements a trivial `isPointInRect` rather than
importing the feature-local version) — the global vector-network utils layer never imports from
`components/`. The path is always treated as an **implicitly closed** loop (wraparound via modulo,
last point connects back to the first), matching what the two reference screenshots showed even
mid-drag: a just-started lasso stroke (still mostly a straight out-and-back line) renders as a thin
sliver, which is exactly what a closed loop of a near-straight path looks like.

**Rendering reuses two existing primitives rather than inventing new ones, both extended with small,
backward-compatible additions:**
- **Fill** — `drawVectorFill.ts` (the same even-odd stencil-buffer technique real Vector node fills
  already use, §3) gained a trailing `alpha = 1` parameter (default preserves every existing opaque
  call site untouched), called as `drawVectorFill(gl, program, buffer, [path], DRAFT_FRAME_STROKE, ...,
  MARQUEE_FILL_ALPHA)` — the same translucent-blue-over-scene look the box marquee already has,
  reusing its exact color/alpha constants rather than inventing new ones.
- **Outline** — a new `drawDashedPolylineOutline/` folder (not a flat file — asked for directly, along
  with splitting its internals: "do osbnego folderu i jego funkcje rozbij do pliku. pointAtDistance"
  then, once that landed, "[the dashVertices block] to też osobna funkcja w innym pliku"), generalizing
  `drawDashedRectOutline.ts`'s perimeter-parameterized dash walk from a rect's four fixed edges to an
  arbitrary point sequence:
  - `getPointAtDistance.ts` — walks a `TPolylineSegment[]` (`readonly [TPoint, TPoint]` pairs) to the
    point sitting a given arc-length distance along the closed loop, wrapping via modulo for
    out-of-range distances.
  - `getDashVertices.ts` — resolves the dash count from the path's total perimeter and the zoom-scaled
    dash+gap pattern length (identical `Math.max(1, Math.round(perimeter / patternLength))` formula as
    `drawDashedRectOutline.ts`), then samples `getPointAtDistance` twice per dash (start/end) to
    produce the flat `[x1,y1,x2,y2,...]` vertex array.
  - `drawDashedPolylineOutline.ts` itself is left as pure GL plumbing (uniform/attribute wiring,
    `gl.drawArrays(gl.LINES, ...)`) once the math moved out — mirrors how `drawVectorFill.ts` sits
    beside its own sibling `getVectorFillCoveringQuad.ts`.
  - A genuine dead-code trap surfaced while extracting `getPointAtDistance`: a `for`-loop version
    needs a trailing `return` after the loop to satisfy TypeScript's "not all code paths return"
    check, even though that line is mathematically unreachable (the walk is guaranteed to resolve
    within the segments, since `perimeter` and each segment's length come from the identical
    `Math.hypot` formula evaluated twice) — an unreachable statement that a 100%-branch-coverage gate
    can never satisfy. Fixed by restructuring as `segments.reduce(...)` with a `{ found, point,
    remaining }` accumulator instead: the seed value is *always* evaluated (every `reduce` call
    evaluates its initial value unconditionally, whether or not it ends up being the final result), so
    there's no longer a genuinely-dead line — every branch is legitimately reachable through ordinary
    multi-segment test paths.
  - `VECTOR_LASSO_DASH_LENGTH_PX`/`VECTOR_LASSO_DASH_GAP_PX` (`constant/canvas.ts`) started at `8`/`6`
    (matching `SLICE_BOUNDING_BOX_DASH_LENGTH_PX`/`_GAP_PX`'s existing proportions), then both scaled
    by 0.75 (`6`/`4.5`) on a direct "make the outline 25% denser" ask — keeping the dash:gap ratio
    fixed, just shortening the whole repeating cycle.

**A real, live-caught bug: the lasso fill visibly showed the page's own checker texture bleeding
through the canvas while actively drawing.** Root cause: `drawVectorFill.ts`'s stencil-composite pass
called `gl.colorMask(true, true, true, true)` before drawing the translucent covering quad — harmless
for every *pre-existing* caller (real Vector node fills are always fully opaque, so writing `alpha=1`
into a framebuffer that's already `alpha=1` from the frame's own background pass is a no-op), but this
was the *first* caller to ever pass `alpha < 1` through this path. `drawSceneBackground.ts` — the very
first draw call every frame — deliberately does `gl.colorMask(true, true, true, false)` right after
painting the opaque background specifically so the canvas element's *own* alpha channel stays locked
at fully opaque for the rest of the frame (`WEBGL_CONTEXT_ATTRIBUTES` has no explicit `alpha: false`,
so the `<canvas>` really does composite against the DOM behind it, `premultipliedAlpha: false`).
`drawVectorFill.ts`'s own `colorMask(true,true,true,true)` re-enabled alpha writes for its composite
pass, letting the lasso's `alpha=0.2` actually punch a translucent hole in the canvas's own alpha
channel — and with nothing running afterward to re-lock it, that hole let the checker texture div
(`Canvas__texture`, sitting behind the canvas as its idle-state background) show straight through.
Fixed by changing that one `colorMask` call to `(true, true, true, false)`, matching
`drawSceneBackground.ts`'s own convention — RGB channels still composite normally against whatever's
already drawn (correct translucency), alpha is simply never touched again after the background pass
locks it.

**The regression is only observable for a single live frame, not after release — this shaped how the
e2e test had to be written.** `drawSceneBackground.ts` repaints the whole canvas opaque at the start of
*every* frame, so a torn alpha channel self-heals on the very next tick regardless of the bug; a
screenshot taken after `pointerUp()` (the natural place to assert from) would never have caught it,
which is exactly why the first attempt at this regression test passed even with the bug deliberately
reintroduced. Fixed by asserting **mid-drag**, holding the pointer down across the screenshot instead
of releasing first — confirmed both ways (reverting the `colorMask` fix locally to prove the test fails
without it, then restoring the fix to confirm it passes) before trusting the test as a real guard.

**Scope note**: shift/handles-mode/additive-selection (holding Shift to extend an existing selection,
the way the box marquee behaves via `preVectorMarqueeVertexIdsRef`) is deliberately **not**
implemented for Lasso yet — every stroke replaces the current vertex selection outright, matching the
"simpler than the marquee" scope decision above.

Covered by 3 new e2e scenarios in `vector-edit.spec.ts` (freeform enclosure selecting the right
vertices; starting a drag on an existing vertex intercepting instead of dragging it; the mid-drag
transparency regression guard) plus unit coverage for every new file
(`armVectorLassoOnPointerDown.ts`, `continueVectorLassoDrag.ts`, `disarmVectorLassoDrag.ts`,
`getVectorPointsInPolygon.ts`, `drawVectorLasso.ts`, and the whole `drawDashedPolylineOutline/` folder)
at 100%.

## 43. The Paint tool — per-face fill toggling, `filledFaceKeys`, and a live add/remove hover preview

A new dedicated Vector Edit Mode tool (`ToolName.paint`, shortcut `Shift+B`) that fills or unfills one
`deriveVectorFaces` region at a time with the node's own `fillColor`, instead of the previous
all-or-nothing "the whole shape is filled or it isn't". Wired into `VectorEditToolbar` (§41) exactly like
Lasso — `TOOLS`' Paint entry gained `toolName: ToolName.paint`, which is the only thing that made its
button dispatch `setActiveTool` (the button/icon/label already existed as an inert placeholder).

**`TVectorNode.filledFaceKeys: string[]` is the one new piece of state**, and `deriveVectorFaces.ts`
changed shape to support it: it now returns `TVectorFace[]` (`{key: string; points: TPoint[]}[]`) instead
of the old bare `TPoint[][]`, promoting a key that already existed internally (the sorted, comma-joined
segment-id set used for its own dedupe pass, §2) to a real return value. `drawVectorNode.ts` filters
`deriveVectorFaces(node)` down to the faces whose `key` is in `filledFaceKeys` before calling
`drawVectorFill.ts` (only calling it at all when at least one face matched — an empty `filledFaceKeys`
with a non-null `fillColor` now legitimately draws no fill, unlike the old single-fillColor-implies-fill
model). Every other caller of the old `TPoint[][]` shape (`isPointInVectorRegions.ts`) updated to read
`.points`; the new `getVectorFaceAtPoint.ts` (`Canvas/utils/`) is the hit-test this tool actually needs —
`deriveVectorFaces(node).find((face) => isPointInPolygonVertices(point, face.points))?.key ?? null`, one
face can ever match since planar faces from a half-edge walk never overlap.

**Later fix — `isPointInVectorRegions.ts` originally kept testing every `deriveVectorFaces` region
regardless of `filledFaceKeys`**, so the outer Selection tool's plain-click hit-test (`getNodeAtPoint.ts`)
still collided across a whole *unpainted* face's interior, not just its contour — a real reported UX bug
(a bare, unfilled outline was fully clickable inside, not just on its stroke). Fixed by rewriting
`isPointInVectorRegions.ts` to reuse `getVectorFillLoopKeyAtPoint.ts` (the exact same "am I inside an
actually-painted loop" lookup the Paint tool itself uses) instead of `deriveVectorFaces` +
`isPointInPolygonVertices` directly — an unfilled region now only ever collides via
`isPointNearVectorPath.ts`'s contour tolerance test, never its interior. This one is deliberately **not**
extended to an already-selected vector: `armSelectedVectorBoundsOnPointerDown.ts`
(`useSelectionTool/utils/handlePointerDown/armResolvers/`, new) mirrors
`armSelectedTextBoundsOnPointerDown.ts` — once a single vector node is the current selection, its whole
AABB (`isPointInSelectedVectorBounds.ts`, rotation-aware the same way the text version is) stays
draggable, contour or not, exactly like a selected text node's fixed box (§10 of
`selection-and-manipulation.md`).

**New vector networks now default to `fillColor: VECTOR_FILL` instead of `null`**
(`startNewVectorNetwork.ts`) — a real, if minimal, scoping decision: there is still no fill-color-picker
UI anywhere in the app, so `filledFaceKeys` toggling would have had zero visible effect against a `null`
fillColor (`drawVectorNode.ts`'s `if (renderedNode.fillColor)` guard). `VECTOR_FILL` (`'#D9D9D9'`,
`Canvas/constants.ts`) already existed, unused, mirroring `ELLIPSE_FILL`/`RECTANGLE_FILL`'s role for
every other shape tool — this just actually wires it in.

**Click handling — `armVectorPaintOnPointerDown.ts`, no drag/continue machinery at all**, deliberately
simpler than Lasso: this tool's whole interaction is "click a face, toggle it", not a gesture that spans
`pointermove`/`pointerup`. Inserted into `ARM_RESOLVERS` (`handlePointerDown/constants.ts`) right after
`armBakeVectorRotationOnPointerDown` (so its own hit-test reads an already-rotation-baked node from the
store) and before every vertex/handle/segment resolver — same precedence reasoning as Lasso (§42): a
click on top of an existing vertex must never arm a vertex-drag while Paint is active. Gated on
`activeTool === ToolName.paint && node` (via `getVectorEditingNode`), it **always returns `true`** once
that gate passes, hit or miss — clicking empty space inside the vector network while Paint is active is a
deliberate no-op, not a fallthrough to any other resolver. On a hit, `filledFaceKeys` is updated with a
plain `array.includes` toggle, dispatched as one `updateNode({ changes: { filledFaceKeys }, id })` — the
same direct-dispatch shape every other single-click vector mutation already uses
(`armBakeVectorRotationOnPointerDown.ts`, `armVectorBendSegmentOnPointerDown.ts`).

**Segment deletion self-heals the fill with zero extra code.** `filledFaceKeys` only ever stores the
topological key, never geometry — deleting a segment that closed some face simply means that face's key
no longer appears in the next `deriveVectorFaces(node)` call, so `drawVectorNode.ts`'s `.filter(...)`
naturally drops it. No pruning/garbage-collection pass was written or is needed (confirmed directly by
the user's own framing of the requirement: "można usunąć segmenty więc fill znika" — this is exactly the
derived-not-duplicated architecture §2 already established, just exercised by a new code path).

**Hover preview — `resolveVectorPaintHover.ts` (pointermove) + `drawVectorPaintHoverPreview.ts`
(render loop), plus three new cursor states, all via the existing `setClassName` mechanism, not
`canvas.style.cursor`.** This codebase has two different cursor-update patterns in play
(`useSliceTool`'s `updateHoverCursor.ts` sets `canvas.style.cursor` directly to a generated data-URI for
continuously-varying rotation angles), but every Vector-Edit-Mode cursor — `resolveVectorSegmentHoverInNode.ts`'s
`'segment'`/`'bend'`/`'pen-extend'`, Lasso's `'lasso'` — goes through `setClassName(...)` toggling a BEM
modifier class in `canvas.module.scss`, so Paint follows that convention: three new classes,
`&--paint`/`&--paint-add`/`&--paint-remove`, each mapping to `drop.png`/`drop-add.png`/`drop-remove.png`
(pre-existing cursor assets, `assets/icons/cursors/`) at hotspot `16 16`. `getCursorClassName.ts` gained a
`case ToolName.paint: return 'paint';` so the idle drop cursor shows the instant the tool is selected
(unlike Lasso, which has no idle cursor class of its own and relies on the plain default cursor until a
drag actually starts) — Paint needed this because its own hover resolver only overrides the className
while the pointer is actually resting over the vector network's own bounding faces.

`resolveVectorPaintHover.ts` is appended **last** in `handlePointerMove.ts`'s call sequence, after
`resolveVectorSegmentHover` — every hover resolver in that file unconditionally calls `setClassName(...)`
based on its own local hit-test with no `activeTool` gating at all (the Ctrl+hover-to-bend affordance is
meant to work regardless of which Vector Edit tool is active), so whichever resolver runs last wins for
that frame. Paint's own resolver is the only one of the group that's actually gated on `activeTool ===
ToolName.paint` — everywhere else, it does nothing at all (no `setClassName` call), so it never clobbers
another tool's cursor. When it does apply (and the pointer isn't currently held, `event.buttons === 0`),
it resolves `getVectorFaceAtPoint` on the baked node and sets `canvasRefs.hoveredVectorPaintFaceKeyRef`
(new `TCanvasRefs` field, same four-file wiring as `vectorLassoPathRef`: `types/design/canvas/types.ts`,
`useCanvasRefs.ts`, `createCanvasRefs.ts`, plus a reset in `useSelectionTool.ts`'s tool-change cleanup) —
`'paint-add'` when the hovered face isn't filled yet, `'paint-remove'` when it already is, `'paint'` (the
idle cursor) when the pointer misses every face.

The same ref drives `drawVectorPaintHoverPreview.ts` (`useCanvasRenderLoop/utils/drawScene/`, called from
`drawScene.ts` right after `drawVectorLasso`), which draws a preview on the hovered face only. Colors are
reused, not invented: `DRAFT_FRAME_STROKE` (`#337ae1`, blue) for "hovering an unfilled face, click would
add", `VECTOR_EDGE_HOVER_STROKE` (`#cd4422`, orange) for "hovering an already-filled face, click would
remove" — asked for directly with two reference screenshots showing exactly this blue/orange
hover-preview distinction. Because this preview re-derives the face fresh every frame from the live node
(not a frozen snapshot taken at hover-start), it automatically flips from add-blue to remove-orange the
instant a click lands, with no extra invalidation needed — confirmed live in the e2e test below, which
has to explicitly move the pointer away before each screenshot specifically *because* this live-tracking
preview would otherwise still be rendering over the just-toggled face.

**Update: diagonal-hatch rendering instead of a solid translucent overlay** (asked for directly, again
with two Figma reference screenshots — a blue-hatched "add" face and an orange/red-hatched "remove"
face). `drawVectorPaintHoverPreview.ts` now calls a new `drawVectorHatchFill.ts`
(`utils/canvas/drawVectorNode/`) instead of `drawVectorFill.ts`, so `MARQUEE_FILL_ALPHA` no longer applies
here — the hatch lines themselves are drawn fully opaque, and the see-through gaps between them are what
reads as a translucent preview, matching Figma's own look. `drawVectorHatchFill.ts` duplicates
`drawVectorFill.ts`'s even-odd stencil-mask setup verbatim (same convention as
`drawDashedPolylineOutline.ts` vs. `drawVectorFill.ts` already duplicating shader/uniform boilerplate
rather than sharing an abstraction — this codebase's established pattern for these small WebGL draw
primitives) but swaps the final composite pass: instead of a covering quad drawn as two triangles, it
computes a 45°-diagonal line field via the new `getHatchLineVertices.ts` and composites it as `gl.LINES`,
still masked by the same stencil buffer built from the face's own triangle-fan — meaning the hatch lines
are automatically clipped to the exact face silhouette (self-intersecting/concave shapes included) with
no separate polygon-clipping code. `getHatchLineVertices.ts` is pure math: for a 45° hatch, every point on
a given line satisfies `x - y = offset`; it walks `offset` across the point set's own bounding-box
diagonal in fixed steps (`(spacingPx * Math.SQRT2) / zoom` — the `Math.SQRT2` factor converts a
screen-space perpendicular spacing into the right step along this diagonal parametrization) and clips
each line to the bounding box directly (`Math.max`/`Math.min` against the box edges) rather than
depending on the stencil pass to trim excess length — the two clips are independent: the bbox clip keeps
the vertex buffer small, the stencil clip is what actually shapes the fill. New constant
`VECTOR_PAINT_HATCH_SPACING_PX = 6` (`constant/canvas.ts`) controls line density in screen pixels,
dividing by `viewport.zoom` inside `getHatchLineVertices.ts` so the hatch stays visually constant-density
regardless of canvas zoom level, the same screen-space-constant convention `DASH_GAP_PX`/`DASH_LENGTH_PX`
already use for dashed outlines. `drawVectorFill.ts` itself is untouched — it still backs the real
persisted fill (`drawVectorNode.ts`) and the Lasso selection preview (`drawVectorLasso.ts`, §42), both of
which are meant to read as solid/translucent, not hatched.

**Self-intersecting single faces ("bowtie" shapes) — superseded, see §44.** This section originally
claimed a bowtie (two triangular lobes from one 4-segment loop crossing at a non-vertex point) resolved as
ONE face via `isPointInPolygonVertices.ts`'s even-odd ray-cast. That was true of the ORIGINAL, simpler
`deriveVectorFaces` (no branch-vertex or crossing support). §44 rewrote face derivation entirely — a
crossing like this now **splits into two independently paintable faces**, Figma parity, asked for
directly. `getVectorFaceAtPoint.spec.ts`'s own bowtie fixture was updated accordingly (two lobes now
resolve to two DIFFERENT keys, not the same one).

**Not implemented, deliberately out of scope for this pass**: drag-painting across multiple faces in one
gesture (Figma's paint bucket supports this; here every stroke is a single click-toggle, no
`continueVectorPaintDrag`/pointer-capture machinery exists) — the user's own framing of the requirement
never described a drag gesture, only per-face add/remove.

Covered by a real end-to-end e2e test (`vector-edit.spec.ts`): draws a closed square (one face), toggles
Paint on via `Shift+B`, clicks the face once (screenshot differs from the unfilled baseline) and again
(screenshot matches the baseline again) — genuine WebGL stencil-fill rendering that only a real browser
can catch. Unit coverage (100%) for every new file: `armVectorPaintOnPointerDown.ts` (added into the
combined `armResolvers.spec.ts`, matching that folder's existing one-file convention),
`resolveVectorPaintHover.ts`, `drawVectorPaintHoverPreview.ts`, `getVectorFaceAtPoint.ts`, plus the
`deriveVectorFaces.ts`/`drawVectorNode.ts` shape-migration fallout across roughly 80 existing test
fixtures (mechanical `filledFaceKeys: []` backfill, since it's a new required field).

## 44. Face derivation, rewritten — angle-sorted half-edge traversal (DCEL), general planarization, and the tail-tangent-scaling bug

§43 shipped Paint against the ORIGINAL `deriveVectorFaces` (§2): a simple "walk forward while every
vertex has exactly one unvisited way onward" algorithm, correct only for degree-2 simple loops. Real usage
immediately surfaced it as too narrow — three live bug reports, in order: two closed regions sharing a
full edge (a triangle glued onto a square along one side) couldn't be filled at all; a dangling tail off a
shape's own vertex broke fill entirely; a T-junction with a branch pointing into a shape's own interior did
too. All three are **branch vertices** (degree 3+) — a case the "exactly one way onward" rule aborts on
by design. Fixing this meant rewriting face-finding as a proper planar-graph half-edge structure (DCEL,
confirmed against literature as the standard technique for this exact problem — see below), not patching
the old algorithm.

**`buildVectorHalfEdgeAdjacency.ts` now angle-sorts each vertex's outgoing half-edges** (`atan2` of the
segment's own tangent at that vertex, or the straight-line direction if untangented) instead of leaving
them in arbitrary segment-iteration order. **`getNextVectorHalfEdge.ts`** (new) resolves a face's next
boundary edge as *the edge immediately clockwise from the arriving edge's own twin* in that sorted list —
well-defined for any degree: a degree-2 vertex has exactly one other option (matches the old algorithm's
behavior), a degree-1 dead end resolves to the twin itself (the walk backtracks along it, no longer an
abort), and a degree-3+ branch vertex resolves deterministically by rotational order instead of aborting.
**Angle ties break by distance** (nearer vertex wins) — necessary because this app's own smart alignment
guides (§40) actively produce exact angle ties whenever a dragged point lands on another edge's row/column,
which is common, not a rare coincidence; without the tie-break, `Array.sort`'s undefined ordering on equal
keys could non-deterministically collapse an entire shape's face derivation to zero faces mid-drag —
a real, live-caught regression ("od tej pory nie można już malować" — painting stops working entirely).

**`walkVectorFace.ts` rewritten to match**: closure is now "the walk would repeat its own exact starting
half-edge" (not "arrived back at the starting VERTEX", which closes branch-vertex loops too early and
hands the rest of the cycle to whichever other walk tries it next) — this switched a chain of sequential
early-return `if`s into a `switch (true)` (matching this repo's existing `switch(true)` idiom, e.g.
`updateHoverCursor.ts`), since the three checks (`!next`, closing, already-visited-elsewhere) are guard
conditions on different values, not a discriminant switch on one variable. The `visited` Set is shared
across every `walkVectorFace` call within one `deriveVectorFaces` pass (mirroring the original design),
so a mid-walk "already visited" hit means a *different, earlier* walk already claimed that half-edge —
this is the one branch that's genuinely reachable in normal use (verified by a dedicated unit test seeding
`visited` before the call), unlike deriveVectorFaces' own `seenFaceKeys` dedup (next paragraph).

**Distinguishing a real bounded face from the walk's other output — the outer/unbounded face, and a
lone dangling edge's own degenerate "there and back" — is now purely mathematical, via
`getVectorFaceSignedArea.ts` (shoelace formula) plus one narrow exception:**
- **Signed area `>= 0`** keeps genuine bounded regions and rejects the outer face (always traces the
  opposite rotational sense, negative area) — including the not-quite-intuitive case of a dangling
  antenna poking *into* a real bounded face's own interior, which the walk legitimately traverses twice
  (out and back) as part of that face's boundary: the antenna's own forward+backward pass cancels to ~0
  net area in the shoelace sum, so the REAL face's own positive area still wins. An earlier version of
  this filter used a `hasRepeatedSegment` heuristic instead ("any face whose steps repeat a segment id is
  the outer face") — **wrong**, and a real live bug: it discarded the antenna-into-interior face
  entirely (a rectangle with a branch pointing inward became completely unpaintable), since that face's
  own steps legitimately repeat the antenna's segment id too. Replaced by the area-only test.
- **The one thing area alone can't distinguish**: a lone dangling segment's own trivial "face" (walked
  there-and-back over itself) is *also* exactly zero area — same as a perfectly symmetric bowtie's own
  two-lobe cancellation. `isSelfBacktrack` (`steps.length === 2 && steps[0].segmentId ===
  steps[1].segmentId`) is the one narrow, purely topological exception: a walk backtracking over the
  *same physical segment* encloses nothing, while two *different* segments joining the same two vertices
  (e.g. a straight edge and a curved one forming a lens — see `deriveVectorFaces.spec.ts`) is a real
  2-edge loop that happens to enclose actual area, and must not be excluded by the same check.
- **`deriveVectorFaces.ts`'s own `seenFaceKeys` dedup guard is now empirically confirmed unreachable**,
  not just assumed safe — the shared `visited` Set already prevents a second walk from ever re-tracing a
  half-edge another walk claimed, and the one scenario that used to reach it (a perfectly-zero-area
  bowtie, found via both windings) now gets planarized apart into distinct keys before this point.
  Verified by temporarily replacing the guard with a `throw` and re-running the full Design/Canvas unit
  suite (2265 tests) plus a dedicated e2e case reproducing the live-reported "egg crossed by a triangle"
  shape (two crossings on the same curve — the exact topology that surfaced the tangent-scaling bug
  below) — never triggered. Marked `/* v8 ignore if */` rather than removed, since a future change to the
  walk/planarization logic could reopen a path to it, and the guard costs nothing to keep.

**Planarization (`planarizeVectorNetwork/`, new folder) — Figma parity, asked for directly: "jak mamy to
przecięcie to tworzy w tym miejscu nowy fill".** Two segments that geometrically cross without sharing a
vertex now become their own new, independently paintable region — straight/straight, straight/curved, and
curved/curved alike (an earlier pass handled only straight/straight, explicitly documented as a known gap;
extending it to curves was asked for directly once a real curve-crossing-a-triangle case was shown live).
Structure (each concern its own file, the promoted-function-folder pattern from
[[xigma-module-structure]] applied one level up from a single function to a whole cluster):
- **`findAllNetworkCrossings.ts`** — the O(segments²) pairwise search: every segment is first flattened
  to a polyline (`flattenForCrossingSearch.ts`, reusing `flattenSegment.ts` at rendering density — cheap,
  runs once per segment) and crossings are found via ordinary straight-sub-edge intersection
  (`findSegmentCrossings.ts` → `getStraightSegmentIntersection.ts`, Cramer's rule) between every pair of
  polylines. A found crossing's polyline-local position converts back to a t on the ORIGINAL segment
  (`(subEdgeIndex + localT) / (polylinePointCount - 1)`).
- **`refineCrossing.ts`** — the coarse polyline search only localizes a crossing to within one sub-edge's
  width, fine for a clean X but visibly off for a near-tangent/glancing crossing (two curves grazing each
  other at a shallow angle — a real live case: a triangle's own rounded apex barely touching a "petal"
  curve). Since the fill boundary is built from this point while the STROKE is still drawn from the
  untouched original curve, any error here is directly visible as the fill missing or overshooting the
  stroke right at that point. Refined via 4 rounds of re-sampling a shrinking window (16 points/round,
  via `getSubArcPoints.ts` — an exact sub-arc extracted through two chained `splitCubicBezier` cuts, not
  an approximation) and re-intersecting — cheap specifically because it only runs on the handful of
  crossings the coarse pass actually found, not on every pair it checked.
- **`splitSegmentAtCrossings.ts`** — splits one segment into pieces at every crossing along it via
  sequential De Casteljau subdivision (`splitCubicBezier.ts`, pre-existing, already used for T-junction
  inserts). **The live-caught bug, and the mathematical crux of this whole section**: De Casteljau
  scales a split's own tail-end tangent by `(1 - t)` on *every* cut — a tail's own control point isn't
  simply "the original tangent, trimmed", it's genuinely repositioned by the subdivision math. Reusing
  the ORIGINAL, un-scaled `segment.tangentEnd` on a segment's *second* (or later) crossing — instead of
  the *previous* split's own `secondTangentEnd` — feeds the next `splitCubicBezier` call a tangent
  magnitude that belongs to a longer arc than the one actually being split, corrupting the curve's shape
  from that point on. Visually: a filled region's own boundary bulging past its stroke by a wide, visible
  margin, confirmed against a live screenshot ("wybrzuszone jajko"). Fixed by threading a
  `remainderTangentEnd` through the split loop exactly like `remainderTangentStart` already was.
  Regression-locked in `splitSegmentAtCrossings.spec.ts`: a curve with two crossings, checked two ways —
  the middle piece evaluated at its own local midpoint must land exactly where the *original* unsplit
  curve sits at the same global t, and the last piece's own tangentEnd must match splitting the original
  curve directly at the last crossing in one step (`splitCubicBezier`'s own output used as ground truth),
  NOT the raw original tangentEnd.
- **`buildPlanarSegments.ts`** — thin: pass a segment through unchanged if it has no recorded crossings,
  otherwise replace it with `splitSegmentAtCrossings`'s pieces (sorted by t first, regardless of the
  input array's own order).
- **`planarizeVectorNetwork.ts`** — the orchestrator, reduced to two calls once the above split out
  (`findAllNetworkCrossings` then `buildPlanarSegments`), asked for directly after the first version grew
  too much inline logic ("planarizeVectorNetwork też sporo logiki spróbuj to jakoś scalić a funkcje do
  osobnych plików").

**Virtual crossing vertex ids are deterministic and collision-safe for multiple crossings on the same
segment pair**: `` `x:${firstId}:${secondId}:${tA.toFixed(6)}` `` (sorted original segment ids + the
crossing's own t, not just the segment pair) — a curve can cross another curve at more than one point,
unlike two straight lines, so the pair alone isn't a unique key.

**Face key stability under a vertex drag is deliberately asymmetric, confirmed against a live report of
the opposite expectation.** A genuine topology change (a crossing appears, disappears, or a branch vertex
gets dragged into/out of another face's interior) legitimately produces new face keys — there's no
"lineage" tracking a face's identity across such a change at the `deriveVectorFaces` level itself (none
exists here, and none should — see §51 for how a painted face's fill survives such a change anyway, via
piece identity kept one layer up rather than any lineage tracked here). What must NOT change a key is
incidental recomputation — the same physical crossing, on the same two segments, at
(near enough) the same point, must always re-derive the same split-piece ids. Verified directly: a drag
that briefly creates then resolves a crossing must never leave `deriveVectorFaces` returning zero faces
(the literal live bug — a filled shape stopped being paintable at all mid-drag, traced to the angle-tie
issue above, not to key instability).

Regression-locked in a combined ~35 new unit tests across `walkVectorFace.spec.ts`,
`buildVectorHalfEdgeAdjacency.spec.ts`, `getNextVectorHalfEdge.spec.ts`, `getVectorFaceSignedArea.spec.ts`,
`getVectorHalfEdgeAngle.spec.ts`, `deriveVectorFaces.spec.ts`, and one file per function under
`planarizeVectorNetwork/test/` — plus a dedicated e2e case (`vector-edit.spec.ts`, TEST_CASES.md #243)
reproducing the exact live "egg crossed by a triangle" shape end-to-end. 100% branch coverage across the
whole `vectorNetwork/` tree except the two `/* v8 ignore */`-marked, empirically-confirmed-unreachable
branches described above.

## 45. Toolbar tool switching now differs by input method: keyboard shortcuts block leaving Vector Edit Mode, mouse toolbar clicks exit it instead

- `Canvas/hooks/useKeyboardShortcuts/utils/dispatchTool.ts` — keyboard shortcuts route through this
  instead of `dispatch(setActiveTool(tool))` directly. While `vectorEditingNodeId !== null`, a
  shortcut for any tool outside its own local `VECTOR_EDIT_ALLOWED_TOOLS` (`pen`, `pencil`, `lasso`,
  `paint`, `move`, `bend`, `cut`, `shapeBuilder`, `variableWidth` — the last two added for the
  VectorEditToolbar "More" menu, §58 below) is swallowed entirely — the keypress does nothing,
  Vector Edit Mode stays open on whatever tool was already active. Reads `store.getState()` fresh
  each call, same convention as `handleLeave.ts` (§5) — state is looked up inside the util, not
  passed in.
- `components/Design/Toolbar/utils/selectToolbarTool.ts` — the main `MouseModes`/`ToolDropdown`
  toolbar routes through this instead, via two new handler-hooks, `MouseModes/hooks/useSelectTool.ts`
  (the `ToggleGroupPrimitive.Root`'s `onValueChange`) and
  `ToolDropdown/hooks/useSelectGroupTool.ts` (each dropdown `PopoverItem`'s `onClick`, curried per
  `groupTool` since it's built inside a `.map`). Opposite behavior from the keyboard path: it always
  sets the tool, and additionally clears `vectorEditingNodeId` (the same `setVectorEditingNodeId(null)`
  as §5 stage 3) whenever the picked tool isn't `pen`/`pencil` — its own local `PEN_GROUP_TOOLS`
  array, deliberately not read from `TOOL_GROUP_ITEMS[ToolName.pen]` (that field is
  `Partial<Record<...>>`, so reading it needs an `undefined` fallback that can never actually be hit
  here — a local literal array avoids asserting away a dead branch just to satisfy coverage).
- The asymmetry is deliberate, asked for directly: a keyboard shortcut fired while deep in Vector Edit
  Mode is easy to trigger by accident, so anything outside the whitelist is blocked outright and
  Vector Edit Mode never closes underneath you; a toolbar click is a deliberate, visible action, so
  it's always honored — and now exits Vector Edit Mode rather than being blocked (an earlier version
  of this same change disabled/greyed out the toolbar buttons instead, which was wrong — mouse
  switching must always work) or silently leaving `vectorEditingNodeId` stale, matching Escape's own
  stage-3 exit (§5).
- This makes `design-tool-architecture.md`'s §3 claim — "you should never need to edit either
  component file" — no longer quite true for *this* concern: `MouseModes.tsx`/`ToolDropdown.tsx` both
  now call a handler-hook instead of dispatching `setActiveTool` inline. Still true for wiring an
  ordinary new tool (icon/label/group stay entirely in `constants.ts`); only relevant if the new tool
  needs its own Vector-Edit-Mode membership decision on either path above.

## 46. Dragging one vertex onto another merges them — same shape or two entirely different ones

Landed as a follow-up asked for directly ("nie można je łączyć kiedy pointem najadę na point przyda się
taka opcja... snap do tego punktu i zmiana kursora"), closing the gap §33 documented ("nothing in the
codebase ever merges coincident vertices after the fact") for the one gesture where it matters most:
dragging an existing vertex, in Vector Edit Mode, onto another existing vertex. Deliberately broader than
§7's Pen-tool scope trim — this also merges across two *different* vector nodes (confirmed directly,
including after the added complexity of absorbing another node's rotation/graph was spelled out).

**Convention: the dragged vertex always survives; the vertex it's dropped onto is always the one absorbed
and removed.** This single rule is what makes the same-shape and cross-shape cases collapse into one
algorithm — `vectorEditingNodeId` never has to change (the node currently open for editing is never the
one deleted), and the post-merge selection is always just `[draggedVertexId]`, no branching needed.

- **Cross-node hit-test** — `Canvas/utils/getVectorVertexAtPointAcrossNodes.ts` scans *every*
  `NodeType.vector` node on the canvas (not just the one being edited), baking each one's rotation first
  (`bakeVectorNodeRotation.ts`, same as `getAllVectorVertexPositions.ts`'s existing alignment-guide scan)
  so a not-currently-baked shape elsewhere is still hit-tested in true world coordinates. Returns the
  resolved absolute point alongside the ids, so the caller never needs to re-fetch/re-bake just to read a
  position. Tolerance reuses `VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom` — the same constant plain
  vertex-hover hit-testing already uses, for a consistent affordance size, not
  `VECTOR_ALIGNMENT_SNAP_TOLERANCE_PX` (that one drives the separate, weaker axis-alignment guide, §40).
  **Update:** originally hand-duplicated the single-node hit-test's distance/filter/sort chain inline
  instead of calling `getVectorVertexAtPoint.ts` (flagged by a `/code-review` pass — two copies of the
  same tie-breaking logic that could silently drift). Now maps each vector node through
  `getVectorVertexAtPoint` (baked first, same as before) to get that node's own closest candidate, then
  re-derives just that one candidate's distance to pick the closest *across* nodes — a second, outer
  sort, since `getVectorVertexAtPoint`'s return value doesn't carry distance out. Behavior-preserving
  (existing tests passed unchanged); the one new test added — two different nodes each contributing a
  valid candidate — exists purely because coverage caught that the outer sort's comparator had never
  actually run with 2+ elements before (every prior test either excluded one node's only vertex or put
  both candidates in the same node, where the *inner* sort inside `getVectorVertexAtPoint` was doing the
  comparing instead).
- **`handlePointerMove/continueVectorVertexDrag/`** (promoted from a flat file to its own folder, same
  "ifologia" split rule as §9/§32/§42, once the merge-detection block grew into its own concern) — the
  main file still computes the drag's post-alignment-corrected position exactly as before, then, only when
  exactly one vertex is being dragged (`vectorVertexDragRef` never actually holds more than one — group
  drag is a different ref/mechanism, `armVectorGroupDrag`/multi-select), hands off to
  `resolveVectorVertexMerge.ts`: if `getVectorVertexAtPointAcrossNodes` finds a hit, it overwrites the
  dragged vertex's position with the hit's exact point (a full coincidence snap, stronger than and
  overriding the axis-alignment guide — nulls `vectorAlignmentGuideRef` instead of showing both), records
  `{ nodeId, vertexId }` on the drag state's own `mergeTarget` field, and switches the cursor to `'point'`;
  no hit clears `mergeTarget` back to `null` and falls back to the ordinary `'move'`/alignment-guide path.
- **Why `mergeTarget` lives on `TVectorVertexDragState` itself (mutated in place), not a separate ref** —
  this ref has exactly one producer and one other consumer (`disarmVectorVertexDrag.ts`); nothing else
  ever needs to reason about the field's absence, unlike §32/§33's precedent where a genuinely *shared*
  ref forced a separate "pending" ref onto an unrelated caller.
- **Why the merge target is recorded live during the drag, not re-derived from scratch at disarm time** —
  if the pointer never actually moves between down and up, `continueVectorVertexDrag` never runs at all;
  re-deriving purely from the vertex's final (unmoved) position at disarm would risk auto-merging two
  vertices that only *happen* to sit within tolerance from earlier imprecise drawing (the exact, deliberately
  unfixed gap §33 documents) even though nothing was actually dragged onto anything.
- **`utils/canvas/vectorNetwork/mergeVectorVertices.ts`** — the pure merge algorithm, taking two lightweight
  `Pick<TVectorNode, 'segments' | 'vertexHandleModes' | 'vertices'>` slices (not full nodes, so tests don't
  need full fixtures) rather than one node plus an id, since the cross-node case has no single "the node"
  to mutate in place: unions both sides' `segments`, retargets every `startId`/`endId` equal to the
  absorbed vertex onto the surviving one (tangents are untouched — they're offsets relative to their own
  vertex, §1, so retargeting the anchor id alone reshapes correctly), drops any segment that became a
  self-loop this way (the direct edge between two vertices that were already adjacent collapses instead of
  surviving as a zero-length segment — parallel/multi-edges from any other overlap are deliberately left
  alone, not deduped, since face derivation's half-edge walk already tolerates those), then unions and
  prunes `vertices`/`vertexHandleModes` the same way. Returns a plain patch; never deletes a node itself.
- **`disarmVectorVertexDrag.ts`** reads the live (already-snapped, by the last `continueVectorVertexDrag`
  write) node fresh from the store, decides `isSameNode` from whether the merge target's `nodeId` matches
  the node actually being edited, bakes the *other* node's rotation only when it's a genuinely different,
  never-entered-for-editing node (`bakeVectorNodeRotation` is a documented no-op when `rotation` is already
  `0`, so reusing it unconditionally there is harmless), dispatches the merge patch onto the surviving
  node, and — only for the cross-node case — dispatches an ordinary `deleteNode` for the absorbed one.
  Both land inside the same drag's history gesture (§8) as one undo step. `dispatch` had to be threaded
  into this disarm function for the first time (mirroring the sibling disarms on the same line in
  `handlePointerUp.ts` that already receive it) — every earlier version of this function was a pure ref/DOM
  cleanup with nothing to dispatch.
- **Cursor asset** — `assets/icons/cursors/point.png` already existed in the repo, unused by anything, until
  this feature gave it a `&--point` class in `canvas.module.scss` (identical shape to the existing
  `&--pen-snap`/`&--pen-extend` blocks, hotspot `4 4` per direct request).
- Verified live via the Playwright MCP browser against the actual dev server (dragging one square's corner
  onto an adjacent corner of the same square collapses that edge into a triangle; dragging one square's
  corner onto a second, entirely separate square absorbs the whole second square and deletes it) before
  the permanent regression tests were written — see `TEST_CASES.md` #245/#246, `vector-edit.spec.ts`.

**Update: two ref/state gaps fixed, both flagged by a `/code-review` pass and confirmed live (one from an
actual browser crash the user hit).**

- **Stale `mergeTarget` no longer crashes `disarmVectorVertexDrag.ts` at pointerup.** The target node id
  recorded live by `resolveVectorVertexMerge.ts` mid-drag (§ above — "recorded live during the drag, not
  re-derived at disarm time") can go stale if that node is deleted before the pointer is released (a
  concurrent edit from another session is the realistic trigger, given this codebase's multi-session
  editing pattern — not reproducible by a single browser's own pointer-capture-driven interaction). The
  disarm handler used to force-cast the looked-up target node (`as TVectorNode`) with no existence check;
  now `targetNode` is only built when the lookup actually resolves, and a missing target silently abandons
  the merge (same "no hit → fall back to ordinary move" shape §above already uses mid-drag) instead of
  throwing on `bakeVectorNodeRotation`'s `undefined.rotation` read.
- **`selectedVectorHandlesRef`/`selectedVectorSegmentIdsRef` are now cleared whenever a merge actually
  lands**, same as every other selection-changing vector interaction (`armVectorVertexOnPointerDown`,
  `armVectorSegmentOnPointerDown`, marquee/lasso disarm, …) already does. Without this, a tangent handle or
  segment selected *before* the drag could reference a segment that the merge's self-loop pruning (§above)
  had just deleted — the next `pointermove` (`resolveVectorTangentHandleHover` →
  `getTangentVisibilityVertexIds`) would then read `node.segments[handle.segmentId]` on an id no longer in
  `segments` and crash on `undefined.endId`. Root-caused from a live-reported browser stack trace, not
  found by static review alone.
- **`mergeVectorVertices.ts` now also merges `filledFaceKeys`**, unioned via `Set` and filtered to keep
  only keys whose every referenced segment id (face keys are comma-joined segment id lists, §43) still
  exists in the merged `segments` — covering both the cross-node case (the absorbed node's painted faces
  used to just vanish when `deleteNode` removed it, since nothing carried its `filledFaceKeys` over) and,
  as a side effect of the same filter, the same-node collapse case (a face key that depended on a now-
  pruned self-loop segment is dropped instead of surviving as a dangling id nothing can resolve).
  `disarmVectorVertexDrag.ts`'s cross-node `targetNode` construction now includes
  `filledFaceKeys: rawTargetNode.filledFaceKeys` alongside the rotation-baked `segments`/`vertices` and the
  existing `vertexHandleModes` passthrough — `TVectorNetworkData`'s `Pick` grew to include it too. Verified
  live via the Playwright MCP browser directly against `store.getState()` (not just a screenshot — a
  first before/after screenshot pair with the fix already applied looked identical either way, since
  nothing is *supposed* to visibly change; only a stashed-vs-fixed comparison of the same repro made the
  bug and the fix visible) before the permanent regression test was written — see `TEST_CASES.md` #249,
  `vector-edit.spec.ts`.

## 47. Bend becomes a real, persistent tool — plus a Ctrl-held visual preview in `VectorEditToolbar`

Until now, "Bend" (the segment-interior-curving gesture from §32-33) only ever existed as a Ctrl/Cmd
modifier on top of the Move tool — `VectorEditToolbar`'s own Bend button (§41) was purely decorative,
its `TOOLS` entry carrying no `toolName`, so clicking it dispatched nothing. Two things were asked for
directly, and are genuinely different mechanisms: (1) clicking Bend in the toolbar should make it a real,
*persistent* active tool — plain (no-Ctrl) segment drags bend from then on, until the user switches away
— and (2) merely *holding* Ctrl/Cmd while Move is the real active tool should *visually* flip the
toolbar's highlighted button to Bend, with **no** Redux dispatch, reverting the instant Ctrl/Cmd is
released.

**One rule unifies both**: `ToolName.bend` is a real enum value now (added alphabetically between
`arrow` and `comment`), wired through every place `ToolName.move` already was (`useSelectionTool.ts`'s
pointer-handler mount-gate, `dispatchTool.ts`'s `VECTOR_EDIT_ALLOWED_TOOLS` whitelist,
`VectorEditToolbar/constants.ts`'s `TOOLS` entry, `Toolbar/constants.ts`'s exhaustive `TOOL_ICON`/
`TOOL_LABEL` maps — adding the enum value and running `tsc` immediately surfaced exactly which
`Record<ToolName, ...>` maps needed a new entry, rather than hunting for them by hand). `handleLeave.ts`'s
Escape-staging needed **no change** — it already reads `activeTool !== ToolName.move` generically (not
a hardcoded tool list), so Escape from Bend already staged back to Move correctly by construction.

`useVectorEditToolbar.tsx`'s `renderTool` swaps its old one-line `isActive` check for a switch-shaped
helper, `getIsVectorEditToolActive(toolName, activeTool, isBendModifierHeld)` (xigma-switch-over-if: 3+
branches on the same value), the only place either scenario's logic lives:
- any tool with no `toolName` → never active (unchanged).
- Move → active only when it's the real `activeTool` **and** Ctrl/Cmd isn't currently held.
- Bend → active when it's the real `activeTool`, **or** when Move is the real `activeTool` and Ctrl/Cmd
  *is* held.
- every other tool → the original plain `activeTool === toolName` check, untouched.

Neither branch ever touches Redux — the toolbar's own highlight is the only thing that moves when Ctrl
is held; `activeTool` itself only changes on an actual click, via the already-generic `handleClick`.

**`isBendModifierHeld` — a genuinely new mechanism, `VectorEditToolbar/hooks/useIsBendModifierHeld.ts`.**
Confirmed via a repo-wide grep that nothing in this codebase tracks a modifier key *continuously* before
this — every existing Ctrl/Cmd check (§32's bend-drag arm, §9's corner-handle-pull) reads `event.ctrlKey`
off one specific pointer event; the closest precedent for continuous tracking is `useSelectionTool.ts`'s
Shift listener, which doesn't store any state at all, it just re-synthesizes a `pointermove` to refresh
an *already-in-progress* drag. This is the first place that needed the actual live boolean, since nothing
is being dragged — a toolbar button just needs to know if the key is down right now. A small hook with a
`useState` plus `window` `keydown`/`keyup`/`blur` listeners (the `blur` reset covers Alt-Tabbing away
mid-hold, where `keyup` would otherwise never fire and the flag would stick `true` forever) — no Context
or Redux needed, since per `xigma-provider-placement` this state is consumed by exactly one component
subtree (`VectorEditToolbar` itself), which doesn't even rise to needing a shared provider.

**Making the underlying drag/hover logic respect the persistent tool, not just the live modifier** —
`armVectorBendSegmentOnPointerDown.ts`'s gate became `event.ctrlKey || event.metaKey ||
selectActiveTool(store.getState()) === ToolName.bend`; `resolveVectorSegmentHoverInNode.ts`'s hover-cursor
branch got the identical addition, so hovering a segment with Bend persistently selected shows the same
`bend` cursor Ctrl-hover already does, instead of looking inert until the user *also* holds Ctrl. Verified
e2e (`TEST_CASES.md` #247) that a plain drag with Bend selected from the toolbar renders **pixel-identical**
to the existing Ctrl+drag gesture on the same two points — same underlying `commitVectorBendSegment`/
`continueVectorSegmentBendDrag` machinery either way, only the arm condition differs.

**Deliberately not touched**: `armVectorCornerHandleOnPointerDown.ts` (§9's Ctrl+drag-a-fresh-handle-
from-a-corner-vertex gesture) — it shares the same Ctrl/Cmd modifier by convention, but is a different
feature never called "Bend" anywhere in the code or the user's own request; left Ctrl-only.

## 48. Multi-vector editing — several nodes open at once, `vectorEditingNodeIds: string[]`

Landed after a direct feasibility question ("Powiedz mi czy multi edycja wektorów czy będzie bardzo
skomplikowana?"), with the scope pinned down up front: several `NodeType.vector` nodes can be open for
Vector Edit Mode simultaneously, but they **never structurally connect on their own** — you can position
points from one near another purely for visual coordinate-sharing, nothing functionally merges unless an
explicit gesture (drag-to-merge, §46, or a Pen click landing on another open node, below) does it. A new
segment that doesn't extend from any currently-open node's active vertex creates a genuinely independent
new vector ("vector C"), not a stray contour on whichever node happened to be first.

**State: `vectorEditingNodeId: string | null` → `vectorEditingNodeIds: string[]`** throughout —
`TDesignState`, the `setVectorEditingNodeId` reducer (renamed `setVectorEditingNodeIds`), its selector,
and `handleSetVectorEditingNodeIds.ts` (generalizing the old single-id "previous id emptied out → delete
it" empty-node cleanup into a set-difference over every id that dropped out of the array).
`handleSetSelection.ts`'s `exitVectorEditingIfNeeded` now exits only the ids that actually left the new
selection, not the whole open set — **deselecting one open node exits editing only for that node, the
others stay open**; `handleReplaceDesignSnapshot.ts` filters the array against post-undo `nodes` instead
of nulling a single id. `handleLeave.ts`'s Escape staging exits **every** open node in one press once
Move is already the active tool, not one at a time (a deliberate default, not asked for directly, but
cheap to change later — see below).

**Entry mechanism, explicitly temporary** ("na razie zróbmy tak tymczasowo... nie przejmuj się tym co
zaznaczamy to jest tymczasowe rozwiązanie"): select 2+ vector nodes with the ordinary canvas multi-select,
press **Enter**. `useKeyboardShortcuts/utils/handleEnterMultiVectorEdit.ts` filters `selectedIds` down to
`NodeType.vector` entries and only dispatches (`setVectorEditingNodeIds` + `setActiveTool(move)`) when 2+
survive the filter — one vector plus a frame, or just one vector alone, is a no-op; a mix of several
vectors and a frame opens only the vectors, order preserved. No UI entry point beyond Enter exists yet.

**Cross-open-set hit-testing — one generic core, five thin typed wrappers, all in `Canvas/utils/`.**
`pickClosestVectorHitAcrossNodes.ts` maps a node-id list through: bake rotation → run a caller-supplied
`hitTest`/`getDistance` pair → sort by distance → return the winner + its owning node — the same
map→hit→distance→sort shape §46's `getVectorVertexAtPointAcrossNodes.ts` already used for its *global*
scan, generalized with two callbacks instead of one hardcoded vertex lookup, and scoped by the caller to
whichever node-id list it's given (the currently-*open* set here, not every vector on the canvas). Built
on top: `getVectorVertexAtPointAcrossOpenNodes.ts`, `getVectorHandleAtPointAcrossOpenNodes.ts`,
`getVectorEdgeAtPointAcrossOpenNodes.ts`, `getVectorCornerHandleAtPointAcrossOpenNodes.ts`,
`getVectorFaceAtPointAcrossOpenNodes.ts` (Paint, below); the bend-segment case needs every ambiguous
match rather than one winner, so `getAllVectorEdgeMatchesAtPointAcrossOpenNodes.ts` stays a plain loop
instead of routing through the core helper. `findVectorEditingNodeForVertex.ts`/
`findVectorEditingNodeForSegment.ts` are the companion ownership lookups — given the open-node-id list and
a vertex/segment id, return whichever open node's own map actually contains it, or `null`. Safe by
construction: every vertex/segment id is `nanoid()`-generated and globally unique across the whole scene
(confirmed against `splitVectorSegment.ts`, `startNewVectorNetwork.ts`, `startVectorFragment.ts`), so the
existing flat selection/hover refs (`TCanvasRefs`) never needed to become node-scoped maps — only code
that must resolve an id back to its *owning* node needed a lookup at all.

**Arm resolvers, hover resolvers, rendering, marquee/lasso** all swapped their single-node
`getVectorEditingNode(nodes, selectVectorEditingNodeId(state))` for the open-set + the matching
across-open-nodes wrapper — mechanical, one node hit-tested is still one node hit-tested, just now chosen
from N candidates instead of assumed to be the one open node. Marquee/lasso are the one place that's a
**union, not a pick-one**: `continueVectorMarqueeDrag.ts`/`continueVectorLassoDrag.ts` `flatMap` the
existing single-node rect/polygon hit-test across every open node and concatenate — no dedup needed,
again because ids are globally unique. `drawVectorEditHandlesLayer.ts` wraps its per-node draw body in a
`vectorEditingNodeIds.forEach`; every ref/value the body reads is already flat and only ever matches ids
that exist in *that* node's own maps, so nothing inside the loop body itself needed to change.

**Delete groups by owning node, one history gesture when it spans more than one.**
`handleDeleteSelection.ts` — since this session also split it into its own folder (below) — resolves the
owning node(s) for whatever's selected via `getOwningVertexNodes`/`getOwningSegmentNodes`, dispatches one
`updateNode` per affected node, and wraps the whole batch in `beginHistoryGesture`/`endHistoryGesture`
**only** when `owningNodes.length > 1` (`dispatchAsOneGestureIfMultiNode.ts`) — a single-node delete stays
exactly as cheap as before, a delete spanning two open nodes still costs the user only one Undo.

**Pen tool dynamically targets whichever open node the current gesture actually touches, instead of a
hardcoded `vectorEditingNodeIds[0]`.** The original Phase-1 plan deliberately deferred this ("Pen tool
keeps targeting a single node... for now") — live testing immediately surfaced it as a real bug (clicking
to extend a segment onto a non-primary open node's vertex silently did nothing), so it was fixed in the
same session rather than left for a later phase. `resolvePenTargetNode.ts`
(`useDrawPenTool/utils/`) is the single source of truth every Pen entry point (`handlePointerDown.ts`,
`handlePointerMove.ts` via `updatePenPreview.ts`) now calls: if a vertex is already active, resolve its
*owning* node via `findVectorEditingNodeForVertex`; otherwise try a vertex hit across the open set, then
an edge hit across the open set; a genuinely blank hit returns `null` **only when `vectorEditingNodeIds.length
> 1`** — with 0 or 1 open nodes it still falls back to the primary/only one, preserving the original,
unrelated single-node "add a disconnected contour" Pen behavior untouched (an earlier version of this
function broke exactly that existing behavior/test by returning `null` unconditionally — fixed by scoping
the guard to the genuinely-multi-node case only).

**Paint has the identical bug and the identical fix shape**, found by the user directly ("Ale segmenty nie
działają oraz malowanie" — segments already worked via the generic across-open-nodes resolvers above;
Paint was the real, separate bug): `armVectorPaintOnPointerDown.ts`/`resolveVectorPaintHover.ts`/
`drawVectorPaintHoverPreview.ts` now route through `getVectorFaceAtPointAcrossOpenNodes.ts` and a new
`TVectorPaintFaceHover = {faceKey, nodeId}` shape (was a bare `faceKey` string, implicitly always the
primary node) — `hoveredVectorPaintFaceKeyRef`'s declared type and `CanvasRefsProvider.tsx` both updated
to match.

**Pen clicking onto another open node's vertex or segment now performs a real structural merge, reusing
§46's absorb-and-delete semantics — not just a coordinate coincidence.** Discovered live: drawing from
node A onto a coordinate that happened to sit on node B's own vertex *looked* connected but was two
unrelated points at the same spot, matching the original "position-sharing, not merging" spec exactly —
until the user found the same coincidence live and asked directly whether it should be a real merge
("może warto jedną to zostawić i dać możliwość łączenia z pena?"), then confirmed "Pełny merge jak przy
drag" when asked to choose. Two new files parallel `closeLoopOntoVertex.ts`/`closeLoopOntoEdge.ts` (§4)
but absorb a *second node's* whole graph instead of just adding one segment within the same node:
`closeLoopOntoAnotherNode.ts` (vertex-target — unions `vertices`/`segments`/`vertexHandleModes`/
`filledFaceKeys` from both nodes via plain object spread, no id retargeting needed given global
uniqueness, adds the new connecting segment, `deleteNode`s the absorbed target, prunes it from
`vectorEditingNodeIds`) and `closeLoopOntoAnotherNodeEdge.ts` (edge-target — same union, but starts from
`splitVectorSegment(targetNode, ...)` to get a fresh split vertex first, identical De Casteljau math to
§12's same-node split). Unlike §46's drag-merge, no vertex-id collapsing is needed here: the clicked
target vertex is already sitting at the exact click position, so nothing needs to move. `continueVectorNetwork.ts`
resolves which case applies via `resolveContinueVectorNetworkHit.ts`/`applyContinueVectorNetworkHit.ts` —
this pair (further split into `getCrossNodeVertexHover.ts`/`getCrossNodeEdgeHit.ts`/`getEdgeHit.ts` inside
`resolveContinueVectorNetworkHit/`) mirrors this doc's own established resolve-then-apply shape (§44's
DCEL traversal, §32/§33's angle-candidate disambiguation): the resolver returns a discriminated
`TContinueVectorNetworkHit` (`vertex` / `crossNodeVertex` / `edge` / `crossNodeEdge` / `extend`), the
applier switches on it — same-node cases delegate to the original §4 helpers unchanged, the two
cross-node cases delegate to the new ones above.

**No visual snap hint existed before the click landed** — found live immediately after confirming the
merge itself worked ("wiesz kumam można połączyć ale nie ma podpowiedzi w sensie snapa"). Fixed in
`updateVectorPenPreview.ts`: after the same-node hover resolvers (§16/§27) find nothing, a new
`resolveAcrossOtherOpenNodes` loop tries the identical `PEN_POINT_HOVER_RESOLVERS` chain against every
*other* open node in turn — a hit sets the rubber-band preview and cursor class exactly as a same-node
snap would (`pen-snap` on a vertex/edge-midpoint hit, `pen-extend` mid-segment, per
`getPenHoverCursorClassName.ts`), just never marks it drag-armable (`penHoveredDragArmableVertexRef` stays
`false` — nothing is being dragged, only clicked).

**A blank click with 2+ nodes open now creates a genuinely independent new vector, "vector C" — not a
stray contour on the first open node.** Live-discovered as the one remaining gap in the original spec's
own third clause ("jeśli w tym trybie ktoś zacznie budować nowy segment który nie wychodzi z żadnego
wektora a i b to tak jakby tworzył wektor C"): before this fix, a Pen click touching neither A nor B
silently fell back to extending A (the primary/first open node) with a disconnected contour — the
long-standing, unrelated single-node Pen behavior §7 already scopes out, just never previously exercised
with 2+ nodes open. `resolvePenTargetNode.ts`'s final fallback (above) returning `null` only in the
genuinely-multi-node case is half of the fix; the other half is `startNewVectorNetwork.ts`'s
`activateNewVertex`, which used to **replace** `selectedIds`/`vectorEditingNodeIds` with just the new
node — now it reads both fresh from the store and **appends** the new node instead
(`[...selectSelectedIds(state), newNodeId]` / `[...selectVectorEditingNodeIds(state), newNodeId]`), so A
and B stay open and selected alongside the freshly-created C rather than being silently dropped out of
edit mode the moment C is born.

**Internal-only refactors from the same session, no behavior change**: `handleDeleteSelection.ts` moved
into its own `handleDeleteSelection/` folder with every private helper (`getRemainingSegments`,
`getRemainingVertices`, `getOwningVertexNodes`, `getOwningSegmentNodes`, `deleteSelectedVertices`,
`deleteSelectedSegments`, `dispatchAsOneGestureIfMultiNode`) split into its own file plus its own
dedicated spec — matching the same one-function-per-file convention `resolveContinueVectorNetworkHit/`
above already follows. `handlePointerMove.ts`'s two `if` branches (drag-continuation vs. hover-preview)
now each live in their own function — the drag branch was already `continueVectorHandleDrag.ts`
unchanged, the preview branch is the new `updatePenPreview.ts`.

**e2e**: `e2e/design/vector/vector-edit-multi.spec.ts` (10 scenarios — Enter opens both nodes, cross-node
drag isolation, cross-node marquee union, grouped delete + single Undo, Escape closes both, Pen click-merge
onto a vertex, onto an edge, the pre-click snap cursor, blank-click vector-C creation, Paint on the
non-primary node), `TEST_CASES.md` rows 250-259. Full live-verified scenario log, including the
branch-logic paths already pinned down by the unit suite and not repeated as e2e, lives outside this repo
doc at `__test-cases__/multi-vector-edit.test.md`.

## 49. Multi-select box — segments, and full cross-node support

Two rounds landed back to back, both starting from live bugs the user found by testing directly in
the browser (auto-mode session, no plan-mode checkpoint — the fixes were verified live via Playwright
MCP as they went, per the established live-iteration workflow for feel-sensitive canvas math).

**Round 1 — three bugs in the single-node box** (`drawSelectionOutline.ts`, `getVectorMultiSelectBox.ts`,
`resolveVectorMultiSelectBoxHover.ts`, `resolveVectorIdleHover.ts`, all new/changed under
`Design/Canvas/utils/` and `useSelectionTool/utils/handlePointerMove/`):

1. **The node-level blue group-selection box no longer lingers after Enter opens multi-vector-edit.**
   `drawSelectionOutline.ts` filters `selectedNodes` against `vectorEditingNodeIds` before deciding
   group-vs-per-node rendering — previously only the single-node path (`drawVectorSelectionOutline.ts`,
   §46) skipped nodes already open for editing; `drawGroupSelectionOutline` (2+ plain-selected nodes)
   had no such guard at all, so the box from the ordinary multi-select never disappeared once Enter
   opened the same nodes for vector editing.
2. **The box now appears for a selected segment (or a point+segment mix), not just 2+ selected
   vertices.** A segment resolves to its two endpoint vertices via `getVectorSegmentVertexIds`
   (already used by the drag machinery, §46) — new `getVectorMultiSelectVertexIds.ts` wraps that and
   is threaded through eligibility, bounds, and every arm/render call site. Tangent handles still
   exclude the box entirely, confirmed directly with the user rather than assumed.
3. **Resize/rotate/move cursors, previously dead code, now actually work.**
   `resolveVectorMultiSelectResizeHover`/`RotateHover` lived in `useHoverHighlight`, which only
   activates for `activeTool === default/scale/comment` — never true during vector edit (`move`), so
   these resolvers never ran, on hover or during drag. New `resolveVectorMultiSelectBoxHover.ts` runs
   inside `useSelectionTool`'s own pointermove chain instead. It was extracted alongside the existing
   vertex/segment/paint hover resolvers into `resolveVectorIdleHover.ts` (per the user's own request,
   mid-review, to pull the inline guard out of `handlePointerMove.ts` into its own function) so all of
   them skip cleanly while a multi-select resize/rotate/move drag is active — otherwise they'd
   overwrite the drag's own cursor mid-gesture, a real bug caught live (cursor going stale/empty the
   moment the pointer left the box).

**Round 2 — full cross-node support**, prompted directly: *"Nie pojawia się box jak zaznaczymy A i B
wektor"* (inside edit mode, marquee/lasso-selecting the entirety of two separate open nodes). The box
and its three interactions were still fundamentally single-node: `getVectorMultiSelectOwningNode.ts`
(now deleted) required every selected id to belong to the *same* node, so a selection spanning two
open nodes resolved to `null` and the whole box silently disabled itself.

- **Every box-adjacent helper became node-set-aware.** `getVectorMultiSelectBox.ts`/
  `getVectorMultiSelectOrigins.ts`/`getVectorMultiSelectVertexIds.ts` now take
  `(nodes, vectorEditingNodeIds, ...)` instead of a single `TVectorNode`, resolving each vertex/handle
  to its own owning node via the existing `findVectorEditingNodeForVertex`/`ForSegment` (§48). New
  `getVectorMultiSelectPoints.ts` (`Design/Canvas/utils/`) replaces the point-resolution half of the
  old `getVectorMultiSelectBounds.ts`, which is now a pure `(points: TPoint[]) => TDraftRect | null` —
  geometry only, no node lookups, callable identically whether the points came from one node or five.
- **Drag continuation now dispatches per owning node, not one shared `nodeId`.** The three drag-state
  types (`TVectorMultiDragState`/`MultiSelectResizeDragState`/`MultiSelectRotateDragState`) dropped
  their `nodeId: string` field entirely — a cross-node drag has no single node to name. New
  `groupVectorMultiSelectOriginsByNode.ts` partitions a flat `vertexOrigins`/`handleOrigins` pair (ids
  are globally unique, so this is unambiguous, per the same invariant §48 already leans on) into one
  group per owning node; `continueVectorMultiDrag`/`MultiSelectResizeDrag`/`MultiSelectRotateDrag` each
  compute the shared transform (delta, scale, rotation) exactly once — the *math* doesn't change
  per-node, only *which vertices* it applies to — then loop the groups and `dispatch(updateNode(...))`
  once per node, wrapped in `dispatchAsOneGestureIfMultiNode` (moved from
  `useKeyboardShortcuts/utils/handleDeleteSelection/` to the shared `Design/Canvas/utils/`, since it's
  now needed by both delete and every multi-select drag) so a cross-node move/resize/rotate still costs
  the user one Undo.
- **`applyPendingClickAction`'s `split-segment` case moved its own `nodeId` onto the pending-action
  object itself** (`TVectorPendingClickAction`'s `split-segment` variant gained a `nodeId: string`
  field) rather than reading the drag state's now-removed one — that action was always about one
  specific clicked segment regardless of how the rest of the drag state evolved, so it needed its own
  answer to "which node," decoupled from the group-drag's node-agnostic `vertexOrigins`.
- **The render layer draws the box once, not once per open node.** `drawVectorEditHandlesLayer.ts`
  used to compute and draw the box *inside* its per-node `forEach` — harmless when only one node could
  ever be open, wrong once a selection could span several: the box would either duplicate-draw or only
  reflect whichever node's iteration happened to run last. New `getBakedVectorEditingNodes.ts` bakes
  every open node's rotation once up front (preserving the render path's existing rotation-aware
  behavior, §9), and the box draw call was hoisted out of the loop to run exactly once, over the full
  `vectorEditingNodeIds` set.

Verified live via Playwright MCP end to end: marquee-selecting all of two separately-drawn triangles
inside multi-vector-edit produces one box spanning both; dragging the box body moves both together
(confirmed via a `deltaX`/`deltaY` debug snapshot mid-drag, then visually); dragging a corner resizes
both from the shared anchor; dragging just outside a corner rotates both around the shared pivot,
box included. One live-testing false alarm worth recording: a single `page.mouse.move` teleport
without intermediate steps sometimes reads stale cursor/DOM state on the very next evaluate — real
interaction always has intermediate movement, so this is a test-harness artifact, not a product bug;
adding 3-10 `steps` to the approach move before `pointerdown` made every repro reliable.

## 50. Lasso tool no longer hijacks pointerdown on an already-selected/draggable element

Reported live by the user, in two precise conditions: with Lasso active and *nothing* selected,
Lasso should own every pointerdown (selecting only); with Lasso active and *something* already
selected, clicking that selection should move it, not restart a new lasso path. *"Co ważne to że
pointy są zaznaczone nie znaczy że lasso może nie działać, raczej kwestia co jest klikalne a co
nie"* — Lasso must keep being able to start fresh selections; only already-selected elements become
click-and-drag targets underneath it.

Root cause: `armVectorLassoOnPointerDown` fired unconditionally whenever `activeTool === lasso` and
any vector node was open, regardless of what was under the pointer.

**First attempt, tried and reverted mid-implementation**: reordering `ARM_RESOLVERS`
(`handlePointerDown/constants.ts`) to put the hit-test resolvers (vertex, handle, segment,
multi-select box — none of which check `activeTool`) ahead of Lasso, mirroring how
`armVectorMarqueeOnPointerDown` already sits after them for the `move` tool. This satisfied the
"already selected" condition but broke the "nothing selected" one: `armVectorVertexOnPointerDown`
selects-and-drags *any* vertex it hits, selected or not, so a click on an unselected vertex would
silently start a vertex drag instead of a lasso stroke — contradicted by an existing, still-accurate
e2e test (`vector-edit.spec.ts` row 240) asserting exactly that click still starts a lasso stroke.

**Final fix**: `ARM_RESOLVERS`'s order is unchanged; `armVectorLassoOnPointerDown` itself now hit-tests
whether the pointerdown lands on an element that's part of the *current* selection — a selected
vertex/handle/segment (via the same `get*AtPointAcrossOpenNodes` getters the real resolvers use, then
a membership check against the selected-id refs), or the interactive area (interior/resize
corner/rotate ring) of the multi-select box built from the current selection. Only then does it
`return undefined`, yielding to the normal resolver chain exactly as before reordering was ever
considered. Everything else — an unselected element, or blank canvas — still clears the selection and
starts a fresh lasso path, unchanged. New `isPointOnVectorMultiSelectBox.ts`
(`Design/Canvas/utils/`) bundles the box's three interactive-zone checks into one predicate for this.

Verified live via Playwright MCP: lasso-selecting two of a triangle's three vertices, then dragging
starting exactly on one of the now-selected vertices, moves both together (confirmed via
`store.getState()` before/after) while Lasso stays the active tool throughout; dragging from inside
the resulting multi-select box (not on a vertex) also group-moves; a drag starting on a vertex that
is *not* selected, or on genuinely empty canvas, still clears selection and starts a brand new lasso
path, unchanged. Unit: 8 new cases in `armResolvers.spec.ts`'s `armVectorLassoOnPointerDown` block
(selected/unselected × vertex/handle/segment, plus box-interior-in/out), 100% branch coverage. e2e:
`vector-edit.spec.ts` row 262 alongside the unmodified row 240. See
`__test-cases__/multi-vector-edit.test.md` §11 for the full scenario log.

## 51. A painted face survives a topology-changing gesture — stable piece identity, not derived-key lineage or geometric remap

Live-reported: painting a shape (§43), then dragging a vertex until the shape self-intersects, made the
fill vanish entirely — `deriveVectorFaces` (§44) legitimately derives new, different face keys for a
genuine crossing, but `node.filledFaceKeys` still held the old, now-stale key. §44's own note above
already explains why `deriveVectorFaces` itself will never track this ("no lineage... at that level",
by design) — the fix lives one layer up: `filledFaceKeys` no longer stores anything *derived* from a
current planarization at all, so there is nothing for a topology change to make stale in the first place.

**Two earlier designs were tried and superseded before this one, each for a concrete, reproduced
failure — worth knowing since they explain what this design deliberately avoids:**

- **First attempt: best-effort geometric-overlap remap**, run once at gesture-commit time
  (`beginHistoryGesture`/`endHistoryGesture` bracket every drag — see §48 for why that's the one
  reliable chokepoint, not any of the ~30 individual `dispatch(updateNode(...))` call sites). Snapshot
  every painted vector node before the gesture, and after it, swap any now-stale key for whichever new
  face's polygon overlaps the old one (`isPointInPolygonVertices`, centroid-in-polygon tested both
  directions to catch a split and a merge). Superseded: a self-intersecting drag's sliver region
  immediately touching the dragged vertex can have **zero** geometric overlap with the shape's own
  pre-drag polygon (confirmed by exhaustively sampling a live-reproduced bowtie drag — 0 of 182 sampled
  sliver points landed inside the pre-drag rectangle) — not a heuristic near-miss, a real absence of
  shared area, so the sliver stayed unfillable by construction.
- **Second attempt: a stable loop of real segment ids**, storing `filledFaceKeys` as the sorted, deduped
  real `node.segments` ids bounding a face (recovering a split piece's real id via `.split('#')[0]`),
  with rendering reconstructing the loop's current geometry from those ids directly instead of matching
  a derived key. This closed the sliver gap entirely (Figma parity — every fragment of a self-intersected
  shape keeps its fill, not just the majority lobe) for any face where no *single* real segment is
  crossed more than once. Superseded on a densely self-intersecting network (an {8/3} star: 8 segments,
  each crossing several others) — `.split('#')[0]` collapses e.g. `s1#0` and `s1#1` to the same bare
  `s1`, discarding *which* piece of a multiply-crossed segment actually bounded the painted face, so a
  face bounded by such a piece couldn't be resolved at all.

**Current mechanism — piece identity keyed by what a piece borders, not by its position:**
`splitSegmentAtCrossings.ts` (§44) already names each piece deterministically
(`` `${segment.id}#${index}` ``) and gives it a `startId`/`endId` that's either a real vertex or a
virtual crossing vertex id in the format `` `x:${sortedFirstSegmentId}:${sortedSecondSegmentId}:${t}` ``
(§44) — stable in *which two segments cross*, unstable only in the exact `t`. `getVectorPieceBoundaryKeys.ts`
(`utils/canvas/vectorNetwork/`) turns each of a real segment's current pieces into a boundary-key pair
that keeps the stable part and discards the drift-prone `t`: a real endpoint becomes `` `v:${vertexId}` ``;
a crossing becomes `` `x:${otherRealSegmentId}:${occurrence}` ``, where `occurrence` is a piece-index-order
tiebreaker (0, 1, ...) for the rare case of the same two segments crossing more than once (curves only).
`getVectorFillPieceKey.ts` formats one piece as `` `${realSegmentId}[${sortedBoundaryA}|${sortedBoundaryB}]` ``;
`getVectorFillLoopKey.ts` sorts/dedupes/joins a face's piece keys into the string stored in
`filledFaceKeys` — `deriveVectorFaces.ts` computes a face's `pieceKeys: string[]` this way, and
`armVectorPaintOnPointerDown.ts` stores `getVectorFillLoopKey(face.pieceKeys)` on click, same as before.

Rendering resolves a stored key back to points in `getVectorFillLoopPoints/` (own folder, per
[[xigma-module-structure]]'s function-promotion rule — `getVectorFillLoopPoints.ts` the orchestrator,
each concern a flat sibling): for each stored piece key, `resolvePieceKeyToUnit.ts` locates the piece's
two stored boundaries in the segment's **current** ordered vertex walk (`buildVertexSequence.ts`) and
resolves to a `TResolvedPieceUnit` spanning **every** current piece between them — not just one exact
match. This is the fix for the multiply-crossed case *and* stays correct for the original bowtie bug:
a stored whole-segment key's two boundaries are always that segment's own two real endpoints, which
still exist at the start and end of the current vertex walk regardless of how many *new* crossings a
drag has inserted in between, so a fresh self-intersection subdividing a previously-whole piece still
resolves to the (now several) current pieces spanning the same two endpoints. Units — not raw pieces —
are what gets chained back into a closed loop (`chainIntoSteps.ts`/`walkNextStep.ts`, unit-granularity
graph walk identical in shape to the original single-piece-per-key version): chaining at the unit level
means a crossing shared internally by two different units in the same loop (e.g. a bowtie's two
diagonals crossing each other, both part of the painted quad) never becomes an ambiguous shared vertex
at the outer chain's level — it stays purely internal to each unit's own `expandUnitStep.ts` expansion.
`getVectorFillLoopKeyAtPoint.ts` (unchanged shape) still finds which stored loop, if any, covers a
given point for the Paint tool's click-to-toggle and hover-preview cursor.

Two knock-on fixes landed alongside the piece-identity redesign:
- **Per-loop stencil pass, not one batched call**: `drawVectorNode.ts` calls `drawVectorFill` once per
  stored loop (each with its own `gl.clear(STENCIL_BUFFER_BIT)`) instead of batching every loop into one
  call — batching two independently-painted loops that come to overlap in screen space after a drag
  would XOR their stencil bits together and cancel the overlap region, found live on two adjacent
  painted triangles.
- **`mergeVectorVertices.ts`** (own folder too, one function per file —
  `getMergedSegments`/`getMergedVertices`/`getMergedVertexHandleModes`/`getMergedFilledFaceKeys`,
  `mergeVectorVertices.ts` the thin orchestrator) prunes a stale `filledFaceKeys` entry by checking
  `pieceKey.split('[')[0] in segments` per piece — the real-segment-id prefix of the new piece-key
  format, not the old bare-id format the pre-piece-identity version checked.

**Per-loop fill color, unrelated to the identity fix itself but landed the same session**: each painted
loop renders in its own color, deterministically derived from its own key (`getVectorFillColorForLoopKey.ts`
— a string hash → hue → HSL→hex, no randomness, no state) instead of every loop on a node sharing one
`fillColor` field — makes independently-painted regions visually distinguishable without adding any
schema/state (the now-unused `TVectorNode.fillColor` field itself was left in place rather than threading
its removal through every fixture that still sets it).

Unit: one file per function under `getVectorFillLoopPoints/test/` and `mergeVectorVertices/test/` (both
promoted folders), plus `getVectorPieceBoundaryKeys.spec.ts`, `getVectorFillPieceKey.spec.ts`,
`getVectorFillLoopKey.spec.ts`, `getVectorFillLoopKeyAtPoint.spec.ts`, `getVectorFillColorForLoopKey.spec.ts`,
`flattenVectorFaceSteps.spec.ts`, `getVectorFaceAtPointAcrossOpenNodes.spec.ts` — 100% branch coverage,
including the multiply-crossed-segment case (a segment crossed twice, piece resolved by which other
segments it borders) and the fresh-crossing-subdivides-a-whole-piece case (the bowtie regression, unit
count > original 4 pieces after the drag). e2e: `vector-edit.spec.ts` — TEST_CASES.md #263 (bowtie: the
stored key now resolves **unchanged**, not just non-empty and different, since it no longer needs to
change at all) and #264 (an {8/3} star's multiply-crossed-segment center region, the case that broke the
real-segment-id design entirely).

## 52. Generalized Vector Edit Mode entry, an unblocked duplicate-segment case, and multi-select box priority over a coincident vertex

Three independent fixes landed together, all asked for in one batch.

**`enterVectorEditMode.ts` (new, `Canvas/utils/`) replaces two separate inline dispatch sequences.**
Double-click (`useVectorEditOnDoubleClick.ts`'s `handleHit`) and Enter (`useKeyboardShortcuts/utils/
handleEnterVectorEdit.ts`, renamed from `handleEnterMultiVectorEdit.ts`) each used to inline their own
`dispatch(setVectorEditingNodeIds(ids)); dispatch(setActiveTool(ToolName.move))` pair. Extracted to one
shared, deliberately generic `(dispatch, vectorNodeIds: string[])` util — guarded by
`vectorNodeIds.length > 0` so it's a safe no-op for an empty list, which is what makes the callers below
safe by construction rather than by their own ad hoc checks. Selection itself (`setSelection`) stays
caller-specific: double-click still calls it first (the hit target may not be the current selection),
Enter never did (it operates on whatever's already selected).

**Enter now opens edit mode for a single selected vector too, not just 2+.** The old
`handleEnterMultiVectorEdit` hard-gated on `vectorIds.length >= 2` (documented in commit `ff46808` as a
"temporary entry mechanism"), leaving a 1-vector Enter a no-op — asymmetric with double-click, which
always worked for one. `handleEnterVectorEdit` still filters the current selection down to
`NodeType.vector` ids (so a mixed selection with e.g. a Frame just drops the non-vector ids, never
crashes or blocks), but the `>=2` gate is gone — `enterVectorEditMode`'s own `length > 0` guard is the
only threshold now, matching Figma (Enter opens 1 or more selected vectors alike).

**`closeLoopOntoVertex.ts`'s `isAlreadyConnected` duplicate-segment guard was removed** — see §17's
update note above for the full reasoning (it blocked a real case: closing a *second*, independent arc
back onto an already-connected vertex pair, e.g. two arcs forming a lens/circle). Direction-independent
duplicate detection was the wrong tool for a case that isn't actually a duplicate.

**Multi-select box resize/rotate handles now win over a coincident outline vertex point.** `ARM_RESOLVERS`
(`handlePointerDown/constants.ts`) had `armVectorVertexOnPointerDown` sitting *before*
`armVectorMultiSelectResizeOnPointerDown`/`armVectorMultiSelectRotateOnPointerDown` — and since a 2-vertex
selection's bounding-box corners are, by construction, exactly those two vertices' own positions, the
resize corner handle of the smallest (and most common) multi-select box was **never actually reachable**
through the real pointer pipeline: the vertex resolver claimed the click first every time. Fixed by moving
just those two resolvers ahead of `armVectorVertexOnPointerDown` (the box's *move*/interior-click resolver,
`armVectorMultiSelectBoxOnPointerDown`, stays where it was, right after vertex — an interior click and a
vertex click are mutually exclusive by construction, so there was never a coincidence problem there to
begin with). Both resize/rotate resolvers already position-check before claiming (`getVectorMultiSelectResizeHandle`/
`isInVectorMultiSelectRotateRing`), so this reorder only changes the outcome for the exact-coincidence
case; a plain click on a vertex elsewhere on the box's edge/interior still falls through to the vertex
resolver exactly as before. This is the same "priority via ordering, not an explicit tie-break" pattern
`selection-and-manipulation.md` §18 already documents for the polygon vertex-count-vs-resize case — see
that doc for the general principle; this is its Vector Edit Mode instance.

Unit: `enterVectorEditMode.spec.ts`, `handleEnterVectorEdit.spec.ts` (renamed/extended), the "Enter"
block in `useKeyboardShortcuts.spec.tsx` (now covers the 1-vector case), three
`closeLoopOntoVertex.spec.ts` cases flipped from "must not duplicate" to "must create the second
segment", and two new `ARM_RESOLVERS`-ordering regression tests in `armResolvers.spec.ts` that walk the
real resolver array (not just call one resolver function directly, which would pass regardless of order)
against a resize-corner and a rotate-ring coincidence.

**Update — the resize win-over-vertex rule above needed a carve-out for a degenerate box.** A pre-existing
e2e test (`vector-edit.spec.ts`, from `8077137`) proved dragging an already-lasso-selected vertex must
move the whole selection — but a lasso selection isn't restricted to diagonal pairs: two vertices sharing
an axis (e.g. both at the same `y`) produce a bounding box with zero width or height, whose corner handles
then coincide with a selected vertex the same way §52's diagonal 2-vertex case does. The reorder above made
`armVectorMultiSelectResizeOnPointerDown` claim that click too, but resizing a zero-size axis is a
mathematical no-op — `getAxisScale` (`getVectorMultiSelectResizeTransform.ts`) always returns `1` when
`boundsSize` is `0`, since its dragged/anchor corner coordinates collapse to the same value — so the drag
silently did nothing instead of moving the group, regressing the `8077137` guarantee. Fixed by requiring
`box.bounds.width > 0 && box.bounds.height > 0` before the resize resolver claims the click at all; a
genuinely diagonal (non-degenerate) 2-vertex box, §52's own case, is unaffected. Rotate was deliberately
left alone — rotating a collinear pair around their shared center is still a meaningful transform, so
there's no equivalent no-op to guard against. Unit: new case in `armResolvers.spec.ts`'s
`armVectorMultiSelectResizeOnPointerDown` block (same-row v1/v2, click on the degenerate "nw"/"sw" corner).

## 53. A Divide cut that doesn't disconnect the shape still cuts it — every crossing genuinely severs, with fill inherited only across an actual chord

Asked for directly, with Figma's own Cut/scissor tool as the reference: cutting a segment shouldn't
require the drag to fully separate the shape into independent pieces. Before this, `commitVectorDivide.ts`'s
`findVectorDivideResult` only ever committed when severing the crossings actually split the network into
`components.length > 1` — anything short of that (a single crossing where the drag ends inside the shape,
or a chord that fully crosses one face of a multi-face node without ever touching the outer boundary a
second time) was discarded outright: not just "no new node", but *nothing committed at all*.

**Three designs were tried in sequence; the first two were live-corrected by the user against a real
repro (a square + one internal chord, both faces painted) before landing on the shipped one.**

- **First: splice the line in as shared, non-disconnecting geometry** (reusing Paint's own
  `persistVectorNetworkCrossings`). Fill survived automatically (old loop keys still resolved, no remap
  needed), and it *looked* right in a screenshot — but the user rejected it outright once shown the actual
  vertex data: "cięcie miało ciąć, nie tworzyć point" (cutting was supposed to *cut*, not create a
  pass-through point) and "segmenty powinny być oderwane od siebie" (segments should come apart from each
  other) — confirmed against Figma's own behavior (a screenshot: dragging one resulting corner independently
  distorts only that piece, the other stays a clean rectangle). A shared vertex can never do that; Split's
  existing `severVectorSegmentAtPoint` already sets the real precedent (two disconnected points at the same
  coordinate, not one).
- **Second: always sever every crossing into two disconnected points** (matching Split), with a *duplicated*
  chord (two independent copies, one per new sub-face, geometrically coincident but never sharing a vertex)
  for the interior stretch between two adjacent crossings. This fixed the independence requirement — but a
  plain "leave `filledFaceKeys` alone" (Split's own approach) turned out to depend on an artifact:
  `deriveVectorFaces`'s general half-edge walk happily traces out to a now-dangling dead end and back as a
  zero-area spike, so it still finds a nominally "closed" face for a plain square with one isolated severed
  edge and *keeps* the stale key resolving — while the *same* isolated severing on a square-plus-chord node
  does *not* re-close (confirmed by direct comparison: identical single-edge cut, opposite outcome, purely
  because of what else the walk happens to hit). Un-Figma-like either way once actually tested live: the
  user's own repro showed the newly-cut pieces **losing** fill while an untouched-looking face kept it —
  backwards from Figma, which keeps fill on a clean split.
- **Shipped: sever every crossing (always two points), but compute `filledFaceKeys` explicitly instead of
  leaning on whatever `deriveVectorFaces` happens to still trace.** A face inherits fill only if it's
  geometrically found via `getPolygonCentroid` + `getVectorFaceAtPoint` to sit inside an *originally*
  filled face, **and** none of its `pieceKeys` reference a stub segment left over from an *isolated*
  crossing (`isolatedStubIds` — a crossing with no chord touching either of its two severed points).
  That second condition is the fix for the spike artifact: it doesn't matter whether the general walk can
  still trace a technically-closed loop through a dangling stub, that stub never legitimately closes
  anything, so any face touching it is excluded outright regardless.

**Net effect, matching the user's own corrected mental model:** a face a chord *cleanly* divides (two
adjacent crossings, both ends producing a real, filled interior stretch) gets its fill copied onto *both*
new independent pieces, Figma-style. A face touched by only an *isolated* crossing (no chord on either
side — the drag entered without ever crossing back out, or the crossed segment was collateral for a
*different* face's clean split) loses its fill outright, same as it would from a plain Split click — even
if that face's other boundary looks untouched at a glance, because the specific edge it needed to stay
closed is the one that got severed.

**Wiring**: `commitVectorDivide` (now its own folder, `commitVectorDivide/` — `findVectorDivideResult.ts`,
`findVectorConnectedCutResult.ts`, `applyDivideResults.ts`, `applyConnectedCutResults.ts`,
`finishDividedComponent.ts`, `commitVectorCutComponents.ts`, `types.ts`, one function per file per
[[xigma-module-structure]]) runs the existing severing-based `findVectorDivideResult` first, unchanged, for
every node — nodes it can't fully divide fall through to `findVectorConnectedCutResult`
(`materializeVectorNetworkCut`) instead of being dropped. Both result lists dispatch inside the same
`dispatchAsOneGestureIfMultiNode` bracket, so a drag that fully divides one open node and connected-cuts
another in the same gesture still lands as one Undo step. `applyConnectedCutResults` now explicitly sets
`filledFaceKeys` on the updated node (not left untouched like Split) — it's computed fresh by
`materializeVectorNetworkCut` itself, not merged/resolved by the caller.

Live-verified via Playwright MCP against the reported repro and the corrected one, both with screenshots:
a square with an internal chord, cut with a line crossing the top edge and the chord — both new top pieces
render filled (their own color each, matching §51's per-loop coloring), the bottom face renders unfilled.
Also verified the independence requirement directly against the real dispatch pipeline (not just pure
functions): the two new severed vertices at each crossing have different ids and nothing bridges them.

Unit: `materializeVectorNetworkCut.spec.ts` (5 cases, 100% branch: no crossings, an isolated single
crossing genuinely severs and drops that face's fill while an untouched face keeps its exact key, a clean
chord split keeps both new pieces filled while the severed-but-unchorded far face is excluded, synthetic
endpoints never leak into the result, a two-separate-contour node where the line passes through empty
space *between* them and that gap fragment is correctly dropped) plus matching `commitVectorDivide.spec.ts`
cases for the same three shapes end-to-end through the real dispatch. E2E: `cut.spec.ts` rows 278–281
(`TEST_CASES.md`) — the clean-chord-split case, the isolated-crossing-severs case, an isolated crossing
that leaves a genuinely untouched sibling face's key byte-identical, and a 3-band node proving an
untouched *third* face survives while only the one collaterally touched by the cut loses its fill.

## 54. A live hatch highlight on any filled face touched by an in-progress vertex/segment drag

Dragging a vertex (or a whole segment, i.e. its two endpoints together) in Vector Edit Mode already
dispatched `updateNode` on every `pointermove`, so the persisted fill itself always reshaped live —
but there was no dedicated visual cue calling out *which* filled face was about to change, beyond
the reshaping itself. Requested by the user: "Przesuwanie wektora — bardziej powiedziałbym segmentu
— w trybie edycji po fill jeśli jest" (dragging a vector, or more precisely a segment, in edit mode,
[should show] the fill if there is one), narrowed via a clarifying question to: highlight the
affected face as a visual cue during the drag, mirroring the Paint tool's own hover-highlight
(§43) rather than changing the drag mechanics themselves.

**Mechanism**: `getVectorFilledFacesTouchingVertexIds.ts` (new,
`utils/canvas/vectorNetwork/`) — given a node and a set of vertex ids, collects every segment
incident to those vertices, then filters `deriveVectorFaces(node)` to faces whose `pieceKeys`
include one of those segments *and* are currently filled (`node.filledFaceKeys.includes(getVectorFillLoopKey(face.pieceKeys))`).
Face membership is checked via piece-key prefix (`pieceKey.split('[')[0]` — see §51's
`${realSegmentId}[${boundaries}]` format), not raw segment ids, since a face's boundary is stored as
piece keys. `getVectorDraggedFillFaces.ts` (new,
`useSelectionTool/utils/handlePointerDown/`) wraps this for a multi-node vertex set — groups the
dragged vertex ids by their owning node (`findVectorEditingNodeForVertex`, same resolver
§48 already established for cross-node multi-select) and returns `Record<nodeId, faceKey[]> | null`.

**Wiring**: a new ref, `draggedVectorFillFacesRef` (`TCanvasRefs`, next to
`hoveredVectorPaintFaceKeyRef`) — set once when a drag is armed, not recomputed per `pointermove`,
since which faces are topologically touched (and whether they're filled) doesn't change mid-drag,
only their geometry does. `selectAndArmVectorVertexDrag.ts` sets it directly (single vertex, single
node, already has both `node` and `vertexId` in hand). `armVectorMultiDrag.ts` — the shared arm
function behind a segment drag (`selectAndArmVectorSegmentDrag.ts`), a multi-vertex-selection drag
(`armVectorGroupDrag.ts`), and a marquee-box drag (`armVectorMultiSelectBoxOnPointerDown.ts`) — now
takes the whole `canvasRefs` object (previously just `vectorMultiDragRef`, per
[[canvas-rendering-pipeline]]'s single-`refs`-object threading preference) and sets it via
`getVectorDraggedFillFaces`. Both `disarmVectorVertexDrag.ts` and `disarmVectorMultiDrag.ts` clear it
back to `null` on pointer-up. Render: `drawVectorDraggedFillPreview.ts` (new, `drawScene/`, called
right after `drawVectorPaintHoverPreview`) re-derives each touched node's faces fresh every frame
from the live (baked-rotation) node and hatch-fills all of them in one `drawVectorHatchFill` call
using the same `VECTOR_EDGE_HOVER_STROKE` orange the Paint tool's hover uses for an already-filled
face — deliberately reusing that color rather than inventing a new one, so the two "this fill is
about to change" cues read as the same visual language.

Live-verified via Playwright MCP: dragging a single vertex of a filled square shows the hatch
overlay reshaping with the face live, gone the instant the pointer is released (screenshot
pixel-sampled near `VECTOR_EDGE_HOVER_STROKE`, ~(196,94,68) after antialiasing/JPEG blending against
the loop-key-hashed debug fill color — see §44's `getVectorFillColorForLoopKey`); dragging a whole
top segment (both endpoints together) hatches the entire single-face square, confirming the
`armVectorMultiDrag` path independently of the single-vertex path.

Unit: `getVectorFilledFacesTouchingVertexIds.spec.ts` (4 cases — shared-divider vertex touches both
faces, a non-divider vertex touches only its own face, an unfilled touched face is excluded, a
vertex id with no incident segments), `getVectorDraggedFillFaces.spec.ts` (5 cases, including a
genuine cross-node combination), `drawVectorDraggedFillPreview.spec.ts` (4 cases, mirroring
`drawVectorPaintHoverPreview.spec.ts`'s own structure), plus updated `armVectorMultiDrag.spec.ts`
and a new `armVectorVertexOnPointerDown` case in `armResolvers.spec.ts` for the ref-population
branch. No new E2E: TEST_CASES.md row 285 documents this as intentionally unit-only, same
precedent as the Paint tool's own hover-highlight, which has never had E2E coverage either — the
interesting behavior (which faces, filled or not) is exhaustively pinned by the unit suite; a
screenshot diff would only prove "something changed," not what.

## 55. Cut tool — pink hover preview/cursor, a newly-severed vertex's own pink mark, and auto-return to Move

Three related Cut-tool requests handled in one arc, all keyed off the tool's existing pink
(`VECTOR_CUT_CROSSING_FILL = '#ff2fc2'`):

**Idle hover preview.** While hovering a segment with Cut active (not dragging), a live point marker
now tracks the exact spot a plain click would sever — reusing `getVectorEdgeAtPointAcrossOpenNodes`
(the same hit-test `resolveVectorSegmentHover.ts` already ran for Move/Pen), including its existing
snap-to-midpoint behavior, so hovering near a segment's own midpoint shows the marker snapped there
rather than tracking the raw cursor. `resolveVectorCutHover.ts` does its own independent hit test
(rather than reading the generic hover refs) and stores into two new refs,
`hoveredVectorCutPointRef`/`hoveredVectorCutSegmentRef`; `resolveVectorSegmentHover.ts`'s
`isSegmentHoverBlockedByTool` now also blocks Cut (alongside Paint/Lasso), so the generic blue
segment highlight and white insert-point dot never show for Cut — it owns its own visuals entirely.
Render: `drawVectorCutHoverPreview.ts` strokes the whole hovered segment in pink at
`HOVER_OUTLINE_WIDTH` (mirroring `drawHoveredVectorSegmentHighlight.ts`'s blue, just opaque) and
draws the point marker via a new shared `drawVectorCutPointMarker.ts` — factored out of
`drawVectorCutPreview.ts` (the drag-line crossing markers) so both call sites share one definition of
"what a cut point looks like": **white fill, pink border, same size as a plain unselected vertex
dot** (`VECTOR_VERTEX_SIZE`, via `drawEllipse` with both `fill` and `stroke` set) — landed here after
two wrong turns live-corrected by the user: first a solid pink dot (`VECTOR_CUT_CROSSING_FILL`, no
border) was too flat, but the reflex fix of matching a *selected* vertex's white-ring/pink-center
two-layer look (bigger, more prominent) was **also** wrong — "Panie mówiłem point rozmiar a dałeś
teraz stan jakby te różowe pointy były zaznaczone" (I said [normal] point size, you gave a state as
if selected) — landing on white-fill/pink-stroke at the plain idle size as the actual answer.

**Cursor.** `getCursorClassName.ts` now returns `'cut-off'` for `ToolName.cut`'s idle default (was
falling through to `null`, the base cursor). `resolveVectorCutHover.ts` force-sets `'cut-off'` on
every idle move regardless of what any earlier hover resolver in the chain set, since Cut's own hit
test runs last (after `resolveVectorSegmentHover.ts`, etc.) — otherwise those resolvers' own
cursor-setting calls (`'pen-extend'`, `null`) would leak through and stick until the next hover
event happened to re-resolve them. `armVectorCutOnPointerDown.ts` sets `'cut-on'` once on
pointerdown, left alone for the whole hold (no per-crossing flicker — an earlier version toggled it
based on `crossings.length` inside `continueVectorCutDrag.ts`, corrected once the user clarified
cut-on tracks "is the mouse held," not "is something currently crossed": "chyba że user kliknie lpm w
trakcie [trwania] to cut on"); `disarmVectorCutDrag.ts` resets to `'cut-off'` on release.

**A newly-severed vertex's own pink mark.** Split/Divide's new vertex ids render pink (same
white-fill/pink-border idle style as the hover marker above, plus the ordinary selected-style
white-ring/pink-center swap once actually selected — `drawVectorVertexDots.ts` picks
`VECTOR_CUT_CROSSING_FILL` in place of `VECTOR_VERTEX_FILL`/`VECTOR_VERTEX_SELECTED_FILL` when
`newVertexIds.has(vertex.id)`) until the user selects it and then deselects it again — "póki user ich
nie dotknie tzn. nie kliknie ich i odklika," with an explicit exception: exiting Vector Edit Mode
entirely clears every mark regardless of touch state. Two new `Set<string>` refs,
`newVectorCutVertexIdsRef`/`touchedVectorCutVertexIdsRef` (`TCanvasRefs`, defaulting to `new Set()`
like the codebase's other always-present array/collection refs, never `null`).
`markNewVectorCutVertices.ts` (`disarmVectorCutDrag/`) diffs vertex ids present in the resulting
open nodes but not the pre-cut ones. **Superseded by §57**: the original version matched nodes by
id, so a brand-new sibling node (from a Divide, or now a component-splitting Split too) was silently
skipped — its own share of new vertices never got marked, since it had no same-id counterpart in the
pre-cut snapshot. Fixed into a scope-wide vertex-id diff (union of all pre-cut nodes' vertex ids vs.
all post-cut nodes' vertex ids), which needs no node-id matching at all.
`resolveVectorCutMarkConsumption.ts` runs the actual touch/untouch bookkeeping: adds to `touched` the
moment a pink id is found selected, and un-marks (removes from both sets) once a *previously touched*
id is no longer selected — critically, a Split's two coincident vertices (genuinely disconnected but
sitting at the exact same point, per §53) consume **together**, found by re-looking-up each
candidate's live `{x,y}` in the open nodes and comparing, since the user can only ever click one twin
of the pair, never the other. Called from the `resolveVectorIdleHover.ts` chain (every pointermove)
*and* unconditionally at the end of `handlePointerUp.ts` (every pointerup) — the pointerup call was
added after a reported bug: a drag-then-click-elsewhere left the mark stuck pink until the next
incidental mouse jiggle, since the idle-hover chain alone only re-evaluates on the *next* move, not
the moment the deselecting click itself completes.

**Auto-return to Move.** Completing an actual cut now dispatches `setActiveTool(ToolName.move)` —
requested mid-session ("jak zrobię cut to wracamy do trybu przesuń") and gated on genuinely having
cut something: `commitVectorSplit`'s call site only fires it inside the existing `if (node)` guard,
and `commitVectorDivide.ts` was changed to **return a `boolean`** (`didCut`, previously `void`) so
`disarmVectorCutDrag.ts` can skip the tool-switch when a Divide drag crossed nothing at all. Internal
refactor alongside this (requested separately, "wynieś do funkcji ale w tym pliku"): the
resolve-editing-nodes / find-divide-results / find-connected-cut-results block that used to be one
inline sequence in `commitVectorDivide` is now three small named functions in the same file
(`getVectorDivideEditingNodes`, `findAllVectorDivideResults`, `findAllVectorConnectedCutResults`),
each doing exactly one lookup.

This auto-switch broke one existing e2e regression test that chained two cuts back-to-back under a
single `'x'` press (`cut.spec.ts`'s "cutting an already-cut piece a second time" — the second drag
was silently being interpreted as a Move-tool drag once the tool had switched away) — fixed by
re-pressing `'x'` before the second cut, matching the new expected UX where each cut consumes the
tool selection.

Unit: `resolveVectorCutHover.spec.ts` (hit-test + snap + cursor forcing),
`resolveVectorSegmentHover.spec.ts` (new Cut-blocked case), `drawVectorCutHoverPreview.spec.ts`,
`drawVectorCutPointMarker.spec.ts`, `drawVectorCutPreview.spec.ts` (updated to the shared marker),
`drawVectorVertexDots.spec.ts` (new pink-mark cases for idle/hovered/selected),
`markNewVectorCutVertices.spec.ts`, `resolveVectorCutMarkConsumption.spec.ts` (including the
coincident-pair and no-longer-exists-anywhere edge cases), `commitVectorDivide.spec.ts` (return
value), `disarmVectorCutDrag.spec.ts` (tool-switch assertions). E2E: `cut.spec.ts` row 287 — pixel-
samples a small clip for pink (`countPinkPixels`, since the mark lives only in a canvas ref, invisible
to `store.getState()`) right after a Split, then again after select-then-deselect, and asserts
`activeTool === 'move'` post-cut. The companion hover-preview/cursor half of this arc stays
intentionally unit-only (TEST_CASES.md row 285's own rationale applies identically here — same class
of "which face/segment gets a live paint-style overlay" concern as the Paint tool's hover-highlight,
which has never had E2E either).

Split into its own module-structure folders during this arc, matching the sibling
`drawVectorEditOutline/`/`drawVectorMultiSelectBox/`/`drawVectorTangentHandles/`/
`drawVectorVertexDots/` pattern already established one level down in this same directory
(`drawVectorEditHandlesLayer.ts` was the one file still sitting flat at the top, requested via
"drawVectorEditHandlesLayer do osobnego folderu i rozbij to"): the per-node draw body (outline,
tangent handles, vertex dots, edge-insert preview) is now its own `drawVectorEditHandlesForNode.ts`,
called once per open node from the orchestrator, which now itself lives in its own matching
`drawVectorEditHandlesLayer/` subfolder alongside `test/`.

## 56. Click-to-select a filled face's vertices in Move tool, plus a persistent "fully selected" hatch highlight

A new Move-tool affordance, deliberately mirroring the Paint tool's own hatch-hover visual language
(§43) but for a different purpose: instead of toggling a face's fill, clicking inside an already-
**filled** face selects every one of its vertices at once, sparing the user a point-by-point
multi-select. Requested directly, with a follow-up ("shift też powinien działać na zaznaczanie kilku
powierzchni") extending it to shift-click multi-face selection.

**The missing primitive — face → real vertex ids.** `TVectorFace.pieceKeys` entries already encode
every real, persisted vertex id bounding that piece, in the form `${segmentId}[${boundaryA}|${boundaryB}]`
where each boundary token is either `v:<realVertexId>` or `x:<otherSegmentId>:<n>` (a virtual,
not-yet-persisted crossing — see planarization in §12/§53). New `getVectorFaceVertexIds.ts`
(`utils/canvas/vectorNetwork/`) parses every piece key with a small regex and returns the deduped set
of `v:`-tagged ids, silently dropping any still-virtual `x:` boundary — correct, since a virtual
crossing isn't rendered as a selectable vertex dot until persisted anyway. New
`getVectorFullySelectedFaces.ts` (same folder) uses it plus the existing
`node.filledFaceKeys.includes(getVectorFillLoopKey(face.pieceKeys))` filled-check (the same pattern
`getVectorFilledFacesTouchingVertexIds.ts`, §54, already established) to return every currently
filled face whose entire vertex set is a subset of the live selection.

**Click handling — `armVectorFaceSelectOnPointerDown.ts`**, gated on `activeTool === ToolName.move
&& vectorEditingNodeIds.length > 0`, inserted into `ARM_RESOLVERS` right after
`armVectorSegmentOnPointerDown` and before `armVectorMarqueeOnPointerDown` — late enough that an
actual vertex/segment/handle/multi-select-box hit still wins, but early enough to intercept before
`armVectorMarqueeOnPointerDown`'s catch-all (which would otherwise clear the selection and start a
marquee drag on the same click). Unlike Paint's resolver, this one does **not** unconditionally
return `true` — a miss (empty space, or a face with no fill) returns `undefined` so the click falls
through to the normal marquee/whole-node-drag behavior; only an actual filled-face hit is claimed.
Mirrors `armVectorPaintOnPointerDown.ts`'s crossing-persistence dance exactly (`persistVectorNetworkCrossings`
→ dispatch `updateNode` only if geometry actually changed → re-derive the face from the *persisted*
node before reading its vertex ids), since a face's pieceKeys depend on the segment-id space they
were derived from — reusing the pre-persist face object here would resolve to a stale/wrong id set.
Plain click replaces `selectedVectorVertexIdsRef` outright (and clears `selectedVectorHandlesRef`/
`selectedVectorSegmentIdsRef`, same as a fresh single-vertex selection would); shift-click **unions**
the face's vertex ids into the current selection (plain `Set` spread, not the existing per-id
`toggleSelection` helper single-vertex clicks use) — live-tested regression: two faces sharing a
divider edge (e.g. a square split into a top/bottom half) share that divider's two vertex ids, so a
per-id *toggle* on the second shift-click flipped those shared ids back OFF (they were already
selected from the first face), silently dropping them from the selection — invisible until a
subsequent group-drag, where the divider visibly stayed frozen in place while the rest of the
selection moved. Fixed by making shift-click purely additive; a shift-click on a face whose vertices
are already all selected is now a no-op rather than a deselect. **Also arms a group drag
immediately** (`armVectorGroupDrag(canvas, event, canvasRefs, point, null)`, `pendingClickAction:
null` since there's no single vertex/handle/segment id to collapse to on a no-move release — a
plain click-without-drag on a face correctly leaves the whole face selected, per
`applyPendingClickAction.ts`'s existing "no `pendingClickAction` → no-op" contract) — asked for
directly after the first live pass required an awkward click-release-click-drag two-step; the
existing `armVectorGroupDrag` (shared with the single-vertex/segment/handle "click an
already-multi-selected member" path) reads the vertex ids this resolver just wrote into
`selectedVectorVertexIdsRef`, so a click and an immediate drag now work as one continuous gesture,
same as clicking any other already-selected vector element. `armVectorGroupDrag`'s own
`pendingClickAction` parameter widened from `TVectorPendingClickAction` to `TVectorPendingClickAction
| null` for this call (its existing three callers, which always pass a concrete click-action object,
are unaffected) — it was already just forwarding straight through to `armVectorMultiDrag`, which
accepted `| null` from the start.

**Hover preview — `resolveVectorFaceSelectHover.ts` + `drawVectorFaceSelectHoverPreview.ts`**,
copying `resolveVectorPaintHover.ts`/`drawVectorPaintHoverPreview.ts`'s shape almost verbatim but
gated on `ToolName.move` instead of `ToolName.paint`, with no add/remove distinction — only a filled
face sets the hover ref at all (`hoveredVectorFaceSelectRef`, new `TCanvasRefs` field, same
four-file wiring as `hoveredVectorPaintFaceKeyRef`: `types/design/canvas/types.ts`,
`createCanvasRefs.ts`, `CanvasRefsProvider.tsx`, plus a reset in `useSelectionTool.ts`'s tool-change
cleanup), always hatched in `DRAFT_FRAME_STROKE` blue — the same "would select/add" blue Paint's own
hover uses, deliberately reused rather than inventing a new color so both affordances read as the
same visual language. Called from `resolveVectorIdleHover.ts` right after `resolveVectorPaintHover`
(no cursor className change — out of scope, not asked for).

**Persistent highlight — `drawVectorSelectedFillPreview.ts`**, called from `drawScene.ts` right
after `drawVectorDraggedFillPreview` (§54's sibling). Unlike §54's drag preview (whose touched-face
set is computed once when the drag arms, since topology doesn't change mid-drag), this one
re-derives `getVectorFullySelectedFaces` fresh **every frame** from the live
`selectedVectorVertexIdsRef`/`vectorEditingNodeIds`, across every open node — the selection can
change by many different paths (this click, Lasso, marquee, individual shift-clicks on points), so
there's no single "arm" moment to snapshot against. Same blue `DRAFT_FRAME_STROKE`, same
`drawVectorHatchFill` primitive, one hatch call per frame covering every fully-selected filled face
across every open vector node at once.

Unit-only, same precedent as Paint's own hover-highlight and §54's drag highlight (TEST_CASES.md's
established rationale: a screenshot diff only proves "something changed," not which face/branch) —
`getVectorFaceVertexIds.spec.ts`, `getVectorFullySelectedFaces.spec.ts`,
`armVectorFaceSelectOnPointerDown.spec.ts` (folded into the shared `armResolvers.spec.ts`, matching
that folder's one-file convention), `resolveVectorFaceSelectHover.spec.ts`,
`drawVectorFaceSelectHoverPreview.spec.ts`, `drawVectorSelectedFillPreview.spec.ts`.

## 57. Split now tears into two nodes when it genuinely disconnects the network, same as Divide

Prompted by a direct live-testing question ("Powinno oderwać na 2 wektory czy to będzie
skomplikowane?" — should it tear into two vectors, or would that be complicated) after live-verifying
that a horizontal Divide drag through a rectangle correctly produced two vectors, then checking the
same result via two individual Split clicks instead — and finding it stayed one node with two
severed-but-coincident edges, never splitting.

**Why one Split could already leave the network disconnected.** Severing a segment never adds any
new connectivity — it only ever removes it. A closed loop survives one severed edge as a single open
chain (the remaining edges still bridge it), but severing a *second* edge that shares no vertex with
the first cuts that chain in two, with nothing left to bridge the halves — exactly the two-plain-
-clicks repro above. `commitVectorSplit.ts` previously never checked for this: it just dispatched
`severVectorSegmentAtPoint`'s output as a single `updateNode`, regardless of whether the resulting
vertex/segment graph was still one connected piece.

**The fix reuses Divide's own component-splitting primitives** rather than inventing new ones:
`splitVectorNetworkIntoComponents` (already used by `findVectorDivideResult.ts`, §53) run directly on
the severed network to count components, and `commitVectorCutComponents` (§53's shared
sort-by-size/`updateNode`-the-largest/`addNode`-the-rest helper) to actually commit a ≥2-component
result. Fill is resolved per component via `resolveSurvivingFilledFaceKeys` alone (no
`addCutClosingSegment` — a Split has no drag line to add a chord along, so a loop cut open on two
sides genuinely loses its fill on both halves, not just one; this is the correct, not merely
tolerated, outcome, verified by both a unit test and by live-testing that a pre-filled square splits
into two unfilled halves).

**Baking is conditional, unlike Divide's callers.** `findVectorDivideResult`/
`findVectorConnectedCutResult` always bake rotation to world space first, since a Divide line is
itself defined in world space. A Split's `segmentId`/`t` hit is local to the node regardless of its
rotation, so `commitVectorSplit` only bakes (`bakeVectorNodeRotation`, then re-severs against the
baked node) inside the `components.length >= 2` branch — resetting `rotation: 0` only on the actual
multi-node commit, same as `commitVectorCutComponents` already does for Divide. The ordinary
single-component case (the overwhelming majority of Splits) is untouched: still an unbaked
`updateNode` with the node's existing rotation left alone, exactly as before this change. This means
`severVectorSegmentAtPoint` is called twice in the rare multi-component branch (once unbaked, to
decide the branch cheaply; once baked, for the actual committed geometry) — the ids from the first
call are discarded, never dispatched, so there's no cross-call id inconsistency despite each call
minting its own `nanoid()`s. Component *count* is identical either way since baking only moves
coordinates, never changes which vertex/segment ids reference which — topology is rotation-invariant.

**`disarmVectorCutDrag.ts`** now reads `commitVectorSplit`'s return value (`string[]` — every
resulting node id, `[node.id]` for the ordinary case) and, when it's more than one id,
`setVectorEditingNodeIds`s the pre-cut list with the original id swapped out for the full result set —
mirroring `commitVectorDivide.ts`'s own `setVectorEditingNodeIds` call, so a Split-produced sibling
opens for editing immediately, same as a Divide-produced one already did.

**This also fixed §55's documented `markNewVectorCutVertices` limitation as a direct consequence**:
once Split could produce a brand-new sibling node too, that gap (new sibling's own new vertices never
pink-marked) became directly reachable from this feature, not just Divide's harder-to-hit multi-node
case — see the rewritten paragraph in §55 and `markNewVectorCutVertices.ts`'s new global vertex-id
diff.

One existing unit fixture broke as a direct, intended consequence: `commitVectorSplit.spec.ts`'s
original test used a two-point, one-segment node — severing a lone segment always disconnects its two
endpoints (there's nothing else to bridge them), so this is now genuinely the two-node case, not a
regression to paper over. Similarly, `cut.spec.ts`'s existing branch-vertex Split test (a "Y" shape,
degree-3 vertex) needed its fixture rebuilt via direct `addNode` injection — the original Pen-tool
re-entry choreography (`doubleClick` + re-press `'p'`) turned out to already silently produce a
malformed structure (two segments between the same two vertices, one drawn branch never actually
wired in, its vertex orphaned with zero segments) that only happened to read as "3 segments" by
coincidence; the new injected fixture gives a genuine degree-3 vertex, and the new
`splitVectorNetworkIntoComponents`-based check correctly identifies that severing any one of its 3
segments splits the severed branch off into its own 1-segment node, leaving the other two still
joined at the shared vertex — matching the intent of the original assertion, just fixed on top of an
actually-correct fixture instead of an accidentally-malformed one.

Unit: `commitVectorSplit.spec.ts` (stays-one-node regression on a closed loop's first edge,
tears-into-two on the second, fill loss on both halves, rotation baking), `markNewVectorCutVertices.spec.ts`
(rewritten around the new before/after-node-id-list signature, including a dedicated brand-new-sibling
case), `disarmVectorCutDrag.spec.ts` (new multi-node wiring case: `vectorEditingNodeIds` update +
both-sides pink marking). E2E: `cut.spec.ts` row 288 — two sequential Splits (re-arming Cut with `'x'`
between them, since §55's auto-return-to-Move consumes the tool selection after the first) tear a
square into two nodes, asserting `vectorEditingNodeIds` covers both and pink pixels appear at *both*
cut points, not just the one keeping the original node id; the pre-existing branch-vertex test (row
in the same file) was rebuilt as described above rather than added new.

## 58. VectorEditToolbar "More" menu — Shape builder / Variable width as group-memory tools scoped entirely to Vector Edit Mode

Two new `ToolName` members (`shapeBuilder`, `variableWidth`) that exist purely as toolbar/keyboard
selectable state — no `NodeType`, no draft-fill step, no shader/draw call, no hit-testing entry,
same "doesn't fit the checklist" shape as `design-tool-architecture.md`'s Comment section, but
scoped even narrower: unlike Comment, neither gets a slot in the main Toolbar's `TOOLBAR_ORDER` at
all — they're reachable only from `VectorEditToolbar`'s own "More" `Popover`, plus their own
keyboard shortcuts (`M` / `Shift+W`), both gated into `dispatchTool.ts`'s
`VECTOR_EDIT_ALLOWED_TOOLS` (§45) so they behave like every other Vector-Edit-only tool on the
keyboard path: swallowed if pressed outside Vector Edit Mode's whitelist logic, honored while a
node is being edited.

**Group memory follows the established `lastXTool` pattern (§2 in `design-tool-architecture.md`),
but with a new twist: nullable-until-first-pick.** Every existing group (`lastShapeTool`,
`lastFrameTool`, ...) initializes to a real default `ToolName` so the shared toolbar button always
has *something* to display. `lastMoreTool: ToolName | null` in `TDesignState` instead starts `null`
— the "More" trigger renders as a plain "More" label + chevron (`VectorEditMoreDropdownPlaceholder`)
until the first pick, then permanently swaps to that tool's own icon button, blue when active,
plus a small separate chevron trigger beside it for reopening the dropdown
(`VectorEditMoreDropdownTool`) — mirroring the main Toolbar's `MouseModes`/`ToolDropdown` pair, just
built from scratch rather than reused, since `ToolDropdown` is keyed by a `TOOLBAR_ORDER` member and
these tools have no such membership. `VectorEditMoreDropdown.tsx` is the thin dispatcher choosing
between the two, guarded by a local `isMoreToolName` type predicate (`lastMoreTool` is typed
`ToolName | null` at the store level, deliberately not narrowed to just the two More tools there,
since a global store type must never import a feature-local type per `xigma-module-structure`).
`handleSetActiveTool.ts` gets a `case ToolName.shapeBuilder: case ToolName.variableWidth:` writing
`state.lastMoreTool`, same shape as every other group's case.

**The memory resets on exiting Vector Edit Mode, unlike every other `lastXTool`.** The other groups
persist for the whole session — `lastShapeTool` still remembers Ellipse after you draw a Frame.
`lastMoreTool` instead resets to `null` inside `handleSetVectorEditingNodeIds.ts` whenever the next
id list is empty (i.e. Vector Edit Mode is being left entirely, not just switched to a different
node) — asked for directly ("Kiedy zamykamy edytor wektora to wraca przycisk more" — closing the
vector editor should bring the More button back), since Shape builder/Variable width are
operations *on* whatever's currently being vector-edited, not a general-purpose tool choice worth
remembering across unrelated sessions the way Ellipse-vs-Star is. Because
`handleSetVectorEditingNodeIds` is the single funnel every exit path already dispatches through
(the Close button, Escape, switching to a non-pen-group main-toolbar tool via
`selectToolbarTool.ts`), this one guard covers all of them with no per-caller changes.

Neither tool had any actual canvas behavior yet at the time of writing (no drag gesture, no
rendering) — this section is scoped entirely to the toolbar/shortcut/memory wiring. What Shape
Builder and Variable Width actually *do* to the vector network is §59-62 and §63 respectively.

Unit: `handleSetActiveTool.spec.ts` (new group-memory cases), `handleSetVectorEditingNodeIds.spec.ts`
(reset-on-exit vs. keep-while-still-editing-another-node), `dispatchTool.spec.ts` (both tools added
to the whitelist-allow test), `useKeyboardShortcuts.spec.tsx` (`M`/`Shift+W` cases),
`VectorEditMoreDropdown.spec.tsx` + its `VectorEditMoreDropdownPlaceholder`/`VectorEditMoreDropdownTool`/
`VectorEditMoreDropdownItems`/`VectorEditMoreDropdownItem` siblings, `isMoreToolName.spec.ts`. E2E:
`vector-edit-more-toolbar.spec.ts` (TEST_CASES.md #291-293) — picking from the dropdown swaps the
label for the icon and activates it, both shortcuts activate their tool and update which icon shows,
closing Vector Edit Mode resets the slot back to its plain label even after a tool was picked.

## 59. Shape Builder — merging/subtracting faces by actually deleting/protecting boundary segments, plus two live-caught real-segment-id bugs

`ToolName.shapeBuilder` (§58) gets real canvas behavior: a Figma-style tool that merges the faces a
drag sweeps over by deleting the segments between them, or (Alt held) subtracts a face by deleting
its own exclusive boundary. Confirmed against the user's own reference screenshots: after a merge,
the dividing *stroke* is gone too, not just the fill — this has to be a genuine topology mutation,
not a `filledFaceKeys`-only trick (stroke rendering draws every segment in `node.segments`
regardless of fill, per §2/§3).

**Gesture** — same arm/continue/disarm triad as Lasso (§42), reusing its shape rather than adding a
new pattern: `armVectorShapeBuilderOnPointerDown.ts` seeds `vectorShapeBuilderPathRef` with the
click point *and* immediately hit-tests it into `touchedVectorShapeBuilderFacesRef` (a
`Record<nodeId, Set<faceKey>>`) — necessary because a plain click never fires a `pointermove`, so
if only `continueVectorShapeBuilderDrag` populated touched faces, a single click would do nothing
(shipped-and-fixed: this exact bug, live-caught — "lpm bez przeciągania powinniśmy móc wykonać akcja
na jednym fillu"). `continueVectorShapeBuilderDrag.ts` re-derives touched faces every move — as a
freeform path (`getVectorFacesOnPath.ts`/`...AcrossOpenNodes.ts`, point-in-polygon per path point,
`Canvas/utils/`) normally, or as a swept box (`getVectorFacesInRect.ts`/`...AcrossOpenNodes.ts`,
`isPointInRect` + `getRectCorners` dual test) while Shift is held — and **unions** into the touched
set rather than replacing it, so a mid-drag Shift toggle never drops an already-swept face.
`isVectorShapeBuilderSubtractRef`/`isVectorShapeBuilderBoxModeRef` track Alt/Shift the same way,
read fresh every move. `disarmVectorShapeBuilderDrag/commitVectorShapeBuilder.ts` re-resolves the
touched face *keys* against a `persistVectorNetworkCrossings`-baked live node (same pattern
`armVectorPaintOnPointerDown.ts` already uses) and dispatches one `updateNode` per touched node.

**Rendering** — `drawVectorShapeBuilderPath.ts` draws only a dashed outline for the live path/box
(no translucent fill under it, the one deliberate divergence from `drawVectorLasso.ts`, asked for
directly), and only a hatch-fill hover preview — `drawVectorShapeBuilderHoverPreview.ts`, blue add /
orange subtract via `drawVectorHatchFill.ts`, same convention as Paint's own hover. An earlier
version also dashed-outlined the individual segments bounding the hovered/touched face
(`drawVectorShapeBuilderHoverOutline.ts`) — removed entirely, asked for directly ("usuń ten efekt z
segmentów na liniach bo wygląda to fatalnie"): the dashed outline sat exactly on top of the node's
own white stroke and was functionally invisible. `getShapeBuilderPreviewFaces.ts`
(`useCanvasRenderLoop/utils/drawScene/`) picks what the hatch preview shows each frame: an
in-progress drag's `touchedVectorShapeBuilderFacesRef` takes priority, falling back to just the
single `hoveredVectorShapeBuilderFaceRef` face so the preview still shows on hover alone, before any
drag starts — extracted out of `drawScene.ts` itself after a nested-ternary review comment ("to ma
funkcja zwracać").

**Freeform path renders open, not closed** — asked for directly ("Jak rysujemy bez shift ściezke to
powinna to być sciezka jak na mapie która prowadzi od A do Z a to jest takie trochę lasso" / "to
jakbyś rysował ołówkiem linię"): `drawDashedPolylineOutline.ts` used to always close its own
polyline (wrapping the last point back to the first), which is correct for Lasso's closed loop and
for Shape Builder's own Shift+box mode, but made a freeform drag read as a closed lasso shape
instead of an open pencil-line route. Gained a 5th positional `isClosed: boolean` param (after
`points`, before `color`) — the segment count becomes `points.length` (wraps around) when `true`,
`points.length - 1` (stops at the last point) when `false`. `drawVectorLasso.ts` always passes
`true`; `drawVectorShapeBuilderPath.ts` passes `isBoxMode` straight through — open trace in freeform
mode, closed rectangle in Shift/box mode, matching each gesture's own real shape.

**Cursor, two live-caught gotchas**: `getCursorClassName.ts` has `case ToolName.shapeBuilder: return
'add';` so the tool's own cursor shows the instant it's selected, matching Paint's precedent. Final
cursor assets are `add.png`/`remove.png` (hotspot `5 4` each, `canvas.module.scss`'s `&--add`/
`&--remove`) — an earlier `pointer-group.png`/single-cursor version was replaced once Alt-subtract
needed its own distinct cursor.

1. *Idle cursor dropping out on any mouse movement* — `resolveVectorShapeBuilderHover.ts` initially
   never called `setClassName` at all. Since every hover resolver inside `resolveVectorIdleHover.ts`
   runs unconditionally with no `activeTool` gating (§43's own note on this same file), one of them
   (segment hover) unconditionally reset the cursor to `null` on every idle move once Shape Builder
   had no resolver of its own re-asserting its class — confirmed live via
   `document.querySelector('canvas').className` (a real screenshot can't show the OS cursor sprite,
   so this needed a DOM-class check instead of a visual diff). Fixed two ways together:
   `resolveVectorShapeBuilderHover.ts` now calls `setClassName(event.altKey ? 'remove' : 'add')`
   unconditionally whenever its own gate passes (hit or miss, same as Paint's idle fallback), *and*
   its call in `handlePointerMove.ts` was moved to run **last**, after `resolveVectorIdleHover(...)`
   itself — "whichever hover resolver runs last wins for a given frame" (§43) only holds for whoever
   truly is last in the full chain, not merely last within one nested sub-list.
2. *Alt held mid-hover/mid-drag never switched the cursor to `remove`* — asked for directly ("Plus
   kiedy trzymamy alt zmieniamy ikone na remove.png"), then reported broken twice in a row
   ("Klikam alt ale ikona nie przełacza się na remove." / "Kursor nadal ten sam.") before the actual
   site was found: `resolveVectorShapeBuilderHover.ts`'s `setClassName('add')` call was hardcoded,
   never conditioned on `event.altKey`, despite `isVectorShapeBuilderSubtractRef` itself already
   being tracked correctly — the ref was right, the DOM class just never reflected it. A first fix
   pass added `onAltKeyChange` to `useSelectionTool.ts` (mirroring the existing `onShiftKeyChange`
   synthetic-`pointermove` pattern, so Alt press/release re-evaluates the hover/cursor immediately
   even with zero mouse movement) — necessary, since without it Alt only ever took effect on the
   *next* physical mouse move, but **not sufficient alone**: the resolver itself still needed the
   `event.altKey ? 'remove' : 'add'` conditional added in three places
   (`resolveVectorShapeBuilderHover.ts`, `continueVectorShapeBuilderDrag.ts`,
   `armVectorShapeBuilderOnPointerDown.ts`) before the cursor would actually flip.

**The real bug, and the mathematical crux of this whole section**: a face's stable `pieceKeys`
(§51 — `` `${realSegmentId}[${boundaries}]` ``, deliberately keyed by the *original, unsuffixed*
segment id so a filled region survives a later topology change) are the wrong data source for
deciding which literal `node.segments` entries to delete. `getInteriorSegmentIds`
(merge — a piece is deletable when the exactly-2 faces bordering it are both touched) and
`getExclusiveSegmentIds` (subtract — deletable when *every* face bordering it, 1 or 2, is touched)
both originally grouped pieces by their stripped real-segment-id and required *every* piece of that
id to qualify before deleting any of them — reasoning that a segment couldn't be "half deleted".
That reasoning was backwards: `persistVectorNetworkCrossings` (called before either function ever
runs, in `commitVectorShapeBuilder.ts`) already materializes each crossing's pieces as their own
fully independent `node.segments` entries (literal keys like `"r1Bottom#0"`/`"r1Bottom#1"`, each
with real `startId`/`endId`) — there is no atomicity left to protect, and requiring unanimity across
sibling pieces meant a real segment crossed by anything else could never be deleted at all. Live
symptom: two rectangles overlapping without sharing a vertex (the ordinary case — any Venn-diagram-
style boolean union) planarizes into exactly 3 faces, but a drag touching all 3 produced **3
separate fills, zero segments deleted** — every segment either of the two crossings touch has
*one* piece bordering two touched faces (interior) and *one* piece still on the true outer
boundary (not interior), so the old all-or-nothing rule always failed for literally every segment.
Root-caused live (`document.querySelector`, direct `store.dispatch`/`deriveVectorFaces` calls via
`page.evaluate`, no UI clicking needed to reproduce), confirmed via a temporary `console.log` of
each face's own `pieceKeys` before deleting the grouping logic entirely.

Second-order bug in the *fix itself*, also caught by a failing unit test before it ever reached the
browser: the first correction still used `pieceKeys` (its `.split('[')[0]` prefix strips the "#N"
suffix on purpose, to stay stable across topology changes) as the literal segment id to delete —
which, on a *crossed* segment, doesn't match anything in `node.segments` at all (the persisted key
is `"r1Bottom#0"`, the stripped piece-key prefix is bare `"r1Bottom"`), so nothing was ever deleted,
silently. The real fix: a face's own `key` (§2/§44's `steps.map(step => step.segmentId).sort()
.join(',')`) is built from the *raw*, walked segment ids — "#N" suffixes intact — exactly what
`node.segments` is keyed by once persisted. `getFaceKeysBySegmentId.ts` (renamed from
`getFaceKeysByPieceKey.ts`, `mergeVectorFaces/`) maps each raw segment id from `face.key.split(',')`
to the set of face keys bordering it; both `getInteriorSegmentIds.ts`/`getExclusiveSegmentIds.ts`
now filter this map directly and return matched segment ids verbatim — no per-real-segment grouping
step at all (`getPieceKeysBySegmentId.ts` was deleted, now genuinely unused). Regression-locked in
`mergeVectorFaces.spec.ts` with a hand-built, already-persisted two-crossing-rectangles fixture
(`crossingRectanglesNode`) asserting exactly one resulting face — reproduces the live "3 sectors →
1 union" case without needing a browser.

**Subtract deletes geometry too, not just fill — asked for directly ("Figma usuwa cały segment w
takim case"), with one explicit protection**: `subtractVectorFaces.ts` deletes a touched face's own
*exclusive* boundary (segments bordering only touched faces) via `getExclusiveSegmentIds.ts`, prunes
orphaned vertices (`getRemainingVertices`), and drops the touched face's own `filledFaceKeys` entry
unconditionally (even when nothing was geometrically deletable — a face fully enclosed by untouched
neighbors loses its fill this pass with nothing to delete yet, and a later pass peeling a neighbor
first can then delete it — confirmed as intentional, matching Figma's own iterative behavior, not a
bug to fix). The one hard constraint, asked for directly: a segment shared with a still-standing,
untouched neighbor is **never** deleted (`getExclusiveSegmentIds` requires *every* bordering face —
not just one side — to be touched), so subtracting one half of a divided shape always leaves the
other half's own boundary fully intact.

**Disconnected components divide independently, with zero extra code** — confirmed live with two
entirely separate divided rectangles in one node: sweeping across all 4 faces at once produced two
independently-merged, independently-colored solid shapes, never one shape bridging both. This falls
straight out of the algorithm with no special-casing: a segment can only ever be interior/exclusive
relative to faces it actually borders, and two disjoint components share no segments at all.

Unit: one file per function under `mergeVectorFaces/test/` (100% branch coverage, including the
crossing-rectangles regression above), `getVectorFacesOnPath.spec.ts`/`getVectorFacesInRect.spec.ts`
+ their `...AcrossOpenNodes` siblings (`Canvas/utils/test/`), the new arm/continue/disarm/hover
resolver specs, `drawVectorShapeBuilderPath.spec.ts`/`...HoverPreview.spec.ts`/`getShapeBuilderPreviewFaces.spec.ts`,
plus `useSelectionTool.spec.tsx`'s own `onAltKeyChange` cases (a closed-triangle fixture, since the
file's existing vector-node helpers were open 2-vertex lines — Shape Builder hover hit-testing needs
a real bounded face).

Live-verified end-to-end via Playwright MCP direct `store.dispatch`/`page.evaluate` throughout
implementation (faster and more reliable than driving the Pen tool through raw clicks to build exact
test topologies), then locked in permanently as `e2e/design/vector/vector-shape-builder.spec.ts`
(TEST_CASES.md #294-299) once the tool stopped actively changing shape: freeform merge across a
split rectangle, plain-click fill, Alt+click subtract on an isolated face (no neighbor to protect,
so the whole boundary goes) vs. on a face with an untouched filled neighbor (only the exclusive
edges go, the shared divider survives), Shift-held box-mode merge, the crossing-rectangles
regression from above, and the disconnected-independence case — the last three specifically chosen
because they're real-browser-modifier-key-dependent (Alt/Shift reaching the gesture through actual
`KeyboardEvent`/`PointerEvent` state) or were live regressions once already, exactly the class of
bug [[xigma-e2e-coverage]] flags as worth a permanent test over a unit-only one.

## 60. §51's piece-identity resolver assumed a real segment's surviving pieces are always one unbroken chain — Shape Builder's mid-segment deletion breaks that assumption, silently

Found live, one step past §59's own crown-shape test: the merged shape rendered fine right after
the commit, but **stopped rendering entirely** the moment anything re-derived it fresh (a page
reload replaying the same node shape, or simply re-checking it) — `getVectorFillLoopPoints` started
returning `null` for a `filledFaceKeys` entry that was visibly present and textually well-formed.
Knock-on symptom that surfaced it: Paint-clicking the (invisibly-filled) shape **added a duplicate
of its own key instead of removing it** — `getVectorFillLoopKeyAtPoint` (same underlying resolver)
couldn't find the loop at the click point either, so `armVectorPaintOnPointerDown.ts`'s existing
`existingLoopKey ? remove : add` branch took the "add" path against a face that was, in fact,
already filled.

**Root cause**: `buildVertexSequence.ts` (`getVectorFillLoopPoints/`) — used by
`resolvePieceKeyToUnit.ts` to turn a stored `realSegmentId[boundaryA|boundaryB]` piece key back into
the current segment pieces spanning those two boundaries — chained every current piece of a real
segment into **one** flat vertex sequence via `pieceIds.map(id => boundaryKeys[id].end)`, silently
assuming piece `i`'s end always equals piece `i+1`'s start. That was true for every scenario that
existed before this feature: a fresh *crossing* only ever **subdivides** a piece (more pieces, same
total span, still contiguous) — nothing before Shape Builder ever **deleted** a middle piece while
keeping its outer siblings. `getExclusiveSegmentIds`/`getInteriorSegmentIds` (§59) do exactly that:
a real segment crossed twice, with only its middle piece interior/exclusive, ends up with two
*surviving, disconnected* pieces on either side of a genuine gap. `buildVertexSequence` still
concatenated them as if adjacent, producing a vertex sequence missing the second piece's own real
start vertex entirely — so a stored key naming that exact vertex as a boundary could never be found
in it (`indexOf` returns -1), and `resolvePieceKeyToUnit` returned `null` for that one piece,
which fails the whole loop (`hasEveryUnit` in `getVectorFillLoopPoints.ts`).

**Fix**: renamed to `buildVertexRuns.ts`, now returns `TVectorPieceRun[]` — one run per maximal
contiguous stretch of pieces (a new run starts whenever the running sequence's last vertex doesn't
match the next piece's own start), each carrying its own `pieceIds`/`vertexSequence` pair.
`resolvePieceKeyToUnit.ts` now searches for a run containing **both** of a piece key's boundaries
(`runs.find(run => run.vertexSequence.includes(boundaryA) && ...includes(boundaryB))`) instead of
indexing into one assumed-contiguous sequence — a boundary pair that genuinely spans a gap (crosses
between two runs) correctly still resolves to `null`, since no single run contains both.

Regression-locked directly in `resolvePieceKeyToUnit.spec.ts` (a hand-built gapped `planarSegments`
fixture — piece `s1#0` and `s1#2` present, `s1#1` deleted — asserting each surviving piece's own key
still resolves independently, and a key spanning across the gap correctly returns `null`) and
`buildVertexRuns.spec.ts` (the same gap case, asserting two separate runs). Live-verified end-to-end
against the exact crown-shape node from §59: `getVectorFillLoopPoints` now returns real points where
it previously returned `null`, and a Paint click on the shape now toggles it off on the first click
instead of duplicating its key. Full regression suite (2840 tests across `Canvas`/`vectorNetwork`)
stayed green — this resolver is shared by Paint's hit-testing, the committed-fill render pass, and
(indirectly) anything else that stores a `filledFaceKeys` entry, so a change here needed proof
nothing else regressed, not just that Shape Builder's own case now works.

## 61. Face hit-testing at a point picked the first derived face, not the smallest — broke Paint on a rectangle drawn inside another rectangle

Reported directly, with a reproduction recipe: "Narysuj sobie prostokąt a w nim kolejny prostokąt i
spróbuj ten w środku pomalować" — draw a rectangle, then a second one inside it, and try to Paint the
inner one. Live-reproduced first: clicking dead center of the inner square filled the entire *outer*
square instead, hatch preview and all.

**Root cause**: `deriveVectorFaces` has no notion of a "hole" — two closed loops on the same node with
no shared vertex/segment (an inner rectangle sitting inside an outer one, but never touching it)
derive as two ordinary, independent faces: one is the outer rectangle's own plain 4-point polygon
(oblivious to the inner loop sitting inside it), the other is the inner rectangle. A point at the
inner square's center is therefore inside *both* derived faces' polygons at once.
`getVectorFaceAtPoint.ts` resolved this with a plain `deriveVectorFaces(node).find(...)` — first
match wins, and since the outer face happens to derive first, it always won regardless of which one
the point was actually, visually, sitting inside. `getVectorFillLoopKeyAtPoint.ts` (used to decide
whether a clicked point already sits on an existing fill, so a second click removes it) had the exact
same shape of bug over `node.filledFaceKeys` instead of freshly-derived faces.

**Fix**: new `Canvas/utils/getPolygonArea.ts` (shoelace formula, `Math.abs(sum)/2`, winding-direction
independent). Both functions now filter to every face/loop whose polygon contains the point, then
`reduce` to the **smallest-area** match — the same "prefer the most specific/topmost target" instinct
node-level hit-testing already applies (§5 of the roadmap: last-drawn/topmost wins for overlapping
top-level nodes), just applied one level down, to faces nested within one node's own boundary.

**A second, structurally identical bug one level up**: `getVectorFaceAtPointAcrossOpenNodes.ts` (used
by both Paint and Move's click-selects-face affordance, §56, across every currently open Vector Edit
Mode node) had the same "first match wins" shape, but across *nodes* rather than *faces* — two
different open vector nodes can overlap on screen (a small shape drawn on top of/inside a bigger,
separate one), and the old code returned the first open node (in `vectorEditingNodeIds` order, which
is selection order, not z-order or size) with *any* matching face, not the node whose matching face is
actually smallest. Fixed the same way: collect every open node's hit face, `reduce` to the smallest
by `getPolygonArea`. Both fixes sit at the two actual choke points every face-at-a-point consumer
already funnels through (`getVectorFaceAtPoint` → `getVectorFaceAtPointAcrossOpenNodes`), so Move's
click-select-face (§56) and Cut's `resolveVectorCutFilledFaceKeys` got the fix for free — neither
needed its own change, confirmed by re-running their existing suites unmodified.

Regression-locked with a nested/overlapping-rectangles fixture at each of the three levels: two
in-node loops (`getVectorFaceAtPoint.spec.ts`, `getVectorFillLoopKeyAtPoint.spec.ts` — a 200x200
outer plus a 140x140 middle plus a 100x100 inner square, the middle one specifically exercising the
reduce's "candidate isn't smaller, keep the current smallest" branch for 100% coverage, not just
"found a new smallest" every time), and two separate open nodes
(`getVectorFaceAtPointAcrossOpenNodes.spec.ts`, same 3-square shape split across `n1`/`n2`/`n3`). e2e:
`vector-edit.spec.ts` (Paint on a rectangle drawn inside another, single node) and
`multi-vector-edit.spec.ts` (Paint across two separate, overlapping open nodes) — the cross-node e2e
case opens both nodes via a direct `setVectorEditingNodeIds` dispatch rather than the usual
click-shift-click-Enter flow, since every one of the inner node's own corners sits inside the outer
node's bounds too, making a *selection* click exactly as ambiguous as the *paint* click this test is
actually about — a separate, unrelated concern from the fill hit-test fixed here, not something this
change attempts to also fix.

## 62. Shape Builder across genuinely different vector nodes — materializing a crossing between two nodes' own segment sets, then folding them into one survivor

Requested directly, with a screenshot: two separate rectangles, drawn as two independent vector
nodes, overlapping on screen. Shape Builder already spans every open node for hit-testing/hover
(§59's `...AcrossOpenNodes` helpers), but `commitVectorShapeBuilder.ts` still treated every touched
node **independently** — it had no notion that two different nodes' boundaries could actually cross,
so a drag over the overlap only ever merged/filled each node's own *whole, unsplit* rectangle, never
producing the real split sub-regions the crossing implies.

**The core insight, confirmed before writing any new algorithm**: `planarizeVectorNetwork`/
`persistVectorNetworkCrossings` (`planarizeVectorNetwork/`) are already fully generic — they take a
flat `segments`/`vertices` pair with zero per-node ownership concept, and `findAllNetworkCrossings`
pairwise-checks every segment in the input regardless of origin. Vertex/segment ids are `nanoid()`-
generated and globally unique across the whole scene (already relied on by §48), so a plain object-
spread union of two different nodes' `segments`/`vertices`/`filledFaceKeys`/`vertexHandleModes` never
collides — no retargeting step needed (unlike `mergeVectorVertices`, §46, which retargets a
*coincident* vertex; here there isn't one). This meant the whole existing single-node pipeline
(`deriveVectorFaces`, `mergeVectorFaces`, `subtractVectorFaces`, `getVectorFacesOnPath`/
`...InRect`) could be reused **verbatim** on a synthetic combined node — no new geometry math
anywhere, only new orchestration around it.

**New `utils/canvas/vectorNetwork/mergeVectorNodes/`** (mirrors `mergeVectorFaces/`/
`mergeVectorVertices/`'s one-function-per-file shape):
- `doVectorNodesCross.ts` — `(bakedNodeA, bakedNodeB) => boolean`. An AABB overlap check
  (`getVectorNodeBounds`) as a cheap early-out, then — only if bounds overlap — tags each node's own
  segment ids into a `Set`, runs `findAllNetworkCrossings` on the union, and checks whether any
  introduced crossing (its `virtualVertices` key, `` `x:${firstId}:${secondId}:${t}` ``) pairs a
  segment from A with a segment from B, not just A-with-A or B-with-B. Both inputs must already be
  **baked** (`bakeVectorNodeRotation`) — vertex coordinates are only comparable in world space, and
  two differently-rotated nodes' *raw* vertices live in fundamentally different, incomparable frames.
- `groupCrossingVectorNodes.ts` — `(nodes: TVectorNode[]) => TVectorNodeGroup[]`
  (`{ combinedNode, nodeIds }`). Builds connected components over the input via pairwise
  `doVectorNodesCross` (realistic touched-node counts are 2-5, so O(n²) is fine). A singleton
  component's `combinedNode` is the **original, unbaked** node, completely untouched — this
  preserves the existing single-node commit path's own contract exactly (still works in that node's
  own local/pre-rotation frame, `rotation` never touched). A component of 2+ bakes each member,
  unions their `segments`/`vertices`/`vertexHandleModes`/`filledFaceKeys` (plain spread), runs
  `persistVectorNetworkCrossings` on the union, and returns `{ ...survivor, segments, vertices,
  filledFaceKeys, rotation: 0, vertexHandleModes }` — survivor = the group's lowest-`rootOrder`
  member (the function's own contract: **input must already be sorted ascending by rootOrder**, same
  z-order-wins convention used elsewhere; the survivor falls out for free as whichever node the outer
  scan reaches first, since a BFS start id is always the first not-yet-visited node in that order).

  Caught by review before it ever ran: a naive `nodes.filter(n => !visited.has(n.id)).map(n =>
  collectConnectedComponent(...))` looks equivalent to a single `forEach` doing both, but isn't — the
  `.filter` snapshots `visited` **once**, before any component has been walked, so a node swept into
  an earlier BFS still gets `collectConnectedComponent` called on it again later (returning an empty
  component, since its own `while` loop's first check finds it already visited) — producing a bogus
  zero-length group and crashing on `nodeIds[0]`. Fixed by checking `visited` fresh inside a single
  `forEach`, immediately before deciding whether to start a new component.

**The stale-touched-key problem, and why the raw path has to be re-threaded through to commit**: a
crossing group's own touched sub-faces can't be resolved from the whole-shape face keys each member
node recorded independently during the drag (`touchedVectorShapeBuilderFacesRef`) — those keys don't
exist any more once the nodes are combined and re-split into genuinely different sub-regions. Fixed
by re-hit-testing the **original drag path/box** against the group's already-combined,
already-crossing-persisted node, reusing `getVectorFacesOnPath`/`getVectorFacesInRect` exactly as
armed at drag-start. This is why `commitVectorShapeBuilder.ts` gained `path`/`isBoxMode` params
(sourced from `canvasRefs.vectorShapeBuilderPathRef`/`isVectorShapeBuilderBoxModeRef`, already live
throughout the gesture) alongside the pre-existing `touchedFaces` — the size-1 (unchanged, single-
node) branch still uses the stale keys exactly as before; only the size-2+ branch needs the path.

**Commit split into 3 files, one concern each** (`handlePointerUp/disarmVectorShapeBuilderDrag/`):
`commitVectorShapeBuilder.ts` (thin orchestrator: resolves every currently-**open** node in rootOrder
— not just the touched ones, see the live-caught bug below — groups all of them, then for each group
containing at least one touched member dispatches to whichever of the two below applies, collects
absorbed ids, dispatches one final `setVectorEditingNodeIds` prune), `commitSingleVectorShapeBuilderNode.ts`
(the original, byte-for-byte unchanged single-node logic, just extracted to its own file), and
`commitCrossingVectorNodeGroup.ts` (new: re-hit-test → `mergeVectorFaces`/`subtractVectorFaces` on
the combined node → one `updateNode` for the survivor with `rotation: 0` → one `deleteNode` per
absorbed id → returns the absorbed ids so the orchestrator can prune `vectorEditingNodeIds` and the
caller can clear stale selection refs).

**Live-caught, shipped-and-fixed: grouping only over *touched* nodes silently treated a touched
node's untouched crossing neighbor as if it didn't exist.** Reported directly with two more
screenshots, right after the first version above shipped: Alt+clicking only a shape's own exclusive
corner — never touching the *other*, untouched shape it crosses — deleted its **entire** boundary
instead of leaving the small remnant the real Figma-style behavior implies (the shared chord with the
untouched neighbor should survive). Root cause: `groupCrossingVectorNodes` was fed only the nodes
present in `touchedFaces`, so a lone touched node with an untouched-but-crossing neighbor always
formed a **singleton group of one** — the pairwise crossing check inside `groupCrossingVectorNodes`
never even ran, since there was only ever one node in its input to begin with, and
`subtractVectorFaces` correctly-per-its-own-contract treated that lone face as having "no neighbor to
protect." Whether a touched node's own boundary is exclusive or shared depends on *every* node it
crosses, not just the ones the gesture also happened to touch — exactly the same principle
`getExclusiveSegmentIds`/`getInteriorSegmentIds` already apply *within* one node's own faces (all of
them, not just the touched subset). Fixed by resolving `openNodes` from **every** id in
`vectorEditingNodeIds` (not `touchedFaces`'s own keys) before grouping, then per resulting group
checking `group.nodeIds.some(id => touched)` to decide whether to act on it at all — an untouched
node can now pull a touched neighbor into a real 2+ group purely by crossing it, contributing its own
geometry to protect the shared chord, without ever having any of its *own* faces merged/subtracted.
The identical bug existed in `drawVectorShapeBuilderHoverPreview.ts` (gated on
`touchedNodeIds.length >= 2`, now `>= 1`, same open-nodes resolution) and was fixed the same way.
Live-reproduced and confirmed with an irregular (non-rectangular, rotated) quadrilateral pair
matching the report's own screenshots almost exactly, both before (whole neighbor boundary deleted)
and after (only the touched shape's exclusive edges gone, the small chord-bounded remnant surviving
right where the two shapes crossed) — caught *because* live verification against the user's own
repro is the standing methodology for this feature, not stopped at "the unit tests for the first
version are green."

**`deleteNode` doesn't clean `vectorEditingNodeIds` — the caller must, and one existing caller
doesn't**: `store/design/utils/handleDeleteNode.ts` cleans `nodes`/`rootOrder`/`selectedIds` and
cascades attached text nodes, but leaves `vectorEditingNodeIds` alone. Two existing precedents
disagreed here before this change: the Pen cross-node merge (§48) correctly dispatches
`setVectorEditingNodeIds(...)` after deleting; the vertex-drag merge (§46,
`disarmVectorVertexDrag.ts`) does **not**, leaving it stale if the absorbed node happened to be open
for multi-vector editing. This change follows the correct precedent — `disarmVectorShapeBuilderDrag.ts`
now also clears `selectedVectorVertexIdsRef`/`...HandlesRef`/`...SegmentIdsRef` unconditionally
whenever anything got absorbed, mirroring `disarmVectorVertexDrag.ts`'s own simpler
clear-everything-after-a-merge behavior rather than trying to target specific stale ids. The §46 gap
itself was **not** fixed here — flagged as a separate, pre-existing, out-of-scope bug.

**Live preview only re-groups mid-drag, never on idle hover — a deliberate, documented approximation**:
`drawVectorShapeBuilderHoverPreview.ts` gained the identical open-nodes grouping logic, gated behind
`touchedNodeIds.length >= 1 && path` — a real path only exists once a drag is actually in progress
(`vectorShapeBuilderPathRef` is `null` until `armVectorShapeBuilderOnPointerDown`), so idle hover
(before any click) keeps the plain per-node hatch that already existed, picking whichever node's
*whole* face is smallest/topmost at the cursor (§61's fix) rather than the precise split sliver.
Confirmed live: hovering a crossing point before clicking shows one whole rectangle hatched; the
instant a drag starts and sweeps through the crossing, the preview corrects itself to the real split
regions. This also means a **plain click** (no drag) resolves correctly from its very first frame
with zero special-casing — `armVectorShapeBuilderOnPointerDown` already seeds
`touchedVectorShapeBuilderFacesRef` from *every* open node with a matching face (not a single
winner), and commit's own grouping/re-hit-test runs against `path = [point]` exactly like a 1-point
drag. The repeated `groupCrossingVectorNodes` + branch shape between `commitVectorShapeBuilder.ts`
and `drawVectorShapeBuilderHoverPreview.ts` (dispatch vs. draw) was deliberately left as modest
duplication rather than forced into one shared callback-based abstraction — the actual reusable part
(`groupCrossingVectorNodes` itself, a real pure function) is already shared; the few lines of
per-group dispatch-or-draw branching differ enough in kind that merging them would add more
indirection than the duplication costs. `drawShapeBuilderNodeFacesHatch.ts` (new) extracts the
"bake, derive, filter by stale key, hatch" 4-liner reused by both the fallback per-node path and each
size-1 group inside the new grouping branch.

**Live-verified end-to-end** reproducing the user's own screenshots exactly: two Pen-drawn separate
150x200 rectangles staggered by (75,100) (same proportions as §59's own `crossingRectanglesNode`
fixture, now as two real nodes instead of one), both opened via multi-vector-edit. A drag sweeping
only 2 of the 3 resulting sub-regions correctly merged just those two into one node — the third
region's stroke stayed visibly unfilled but was still structurally absorbed into the same node (node
count dropped from 2 to 1 either way, confirming the crossing-materialization step runs regardless of
which specific sub-faces end up touched). A second run sweeping all 3 regions produced one solid,
seamlessly merged shape with a single set of selection handles. A third run reproducing the
open-nodes bug fix above with an irregular rotated-quadrilateral pair: Alt-clicking only the exclusive
corner of the smaller shape correctly left the larger, untouched shape's own boundary fully intact
plus a small surviving remnant at the crossing — not the "whole neighbor boundary vanishes" result
the pre-fix version produced for the exact same gesture.

Unit: `doVectorNodesCross.spec.ts` (AABB-disjoint, AABB-overlap-but-shapes-don't-actually-cross via
an L-shaped notch, genuine crossing, edge-touching-only), `groupCrossingVectorNodes.spec.ts` (1 node,
2 crossing, 2 non-crossing, 3 nodes transitively crossing A-B-C, an unrelated singleton mixed into a
crossing pair), `commitSingleVectorShapeBuilderNode.spec.ts` (extracted verbatim from the pre-split
file), `commitCrossingVectorNodeGroup.spec.ts` (merge, box-mode merge, subtract, path touching
nothing → empty return), extended `commitVectorShapeBuilder.spec.ts`/`disarmVectorShapeBuilderDrag.spec.ts`/
`drawVectorShapeBuilderHoverPreview.spec.ts` — including, for both the commit and the hover-preview
file, a dedicated regression case for the open-vs-touched-nodes bug (a lone touched node with an
untouched crossing neighbor still forms a real 2+ group) and a case confirming an untouched, non-
crossing group elsewhere in the same gesture is still correctly skipped. 100% coverage per
`xigma-unit-coverage` on every touched file. e2e: extended `vector-shape-builder.spec.ts` with two
genuinely-separate-node crossing-merge and crossing-subtract cases plus the exclusive-corner-only
regression case; the file's own pre-existing disconnected-nodes test already served as the "don't
accidentally combine non-crossing touched nodes" regression guard, re-verified green against the
final code.

## 63. Variable Width becomes a real tool — width points, drag gestures, rendering, and an eligibility gate that now also covers the keyboard shortcut

§58 left `ToolName.variableWidth` wired into the toolbar/shortcut/memory plumbing but with zero
canvas behavior. This section is the actual feature: a Figma-style stroke tool that lets a single,
non-branching vector chain carry one or more width points, each independently draggable along the
path and outward from it, tapering the stroke's rendered thickness between them.

**Data model** (`types/design/types.ts`): `TVectorWidthPoint = { id, leftOffset, position, rightOffset }`,
`TVectorWidthProfile = { points: Record<string, TVectorWidthPoint> }`, and `TVectorNode.widthProfile?:
TVectorWidthProfile | null`. The load-bearing decision is `position: number` — a fraction (0..1) of
the chain's **total arc length**, not a per-segment local `t`. This falls out for free once the
chain is stretched: a point never needs remapping when a segment's endpoint moves, because its
world-space location is always re-derived live from the same stored fraction against whatever the
chain's current total length happens to be. The flip side, also by design, is that appending a
**new** segment to the chain (lengthening it) shifts every existing point's on-screen position too,
since the same fraction now lands earlier along a longer path — verified directly in
`vector-variable-width.spec.ts`'s stretch-redistribution test. Chain endpoints are never stored as
points at all — synthesized on the fly at `strokeWidth/2` both sides wherever chain position is
needed, so nothing has to stay in sync when a vertex moves.

**Eligibility** reuses §57's connected-network primitives one layer down:
`getVectorVertexDegrees.ts` (extracted so both this feature and the Cut tool's
`getVectorNetworkOpenEndpointIds.ts` share one degree-counting source of truth) feeds
`getVectorChainOrder.ts`, which returns `null` on any vertex with degree > 2 (branching) or when the
segment set isn't one connected walk (e.g. two disjoint loops in one node), and otherwise a
canonical, deterministic traversal order — starting from whichever open end (or, for a closed loop,
whichever vertex) was drawn *first*, per `node.vertices`'s own key insertion order, not an
alphabetical id sort. That sort used to pick whichever endpoint's id happened to come first
alphabetically — effectively random relative to draw order, so a Text on Path guide could read
starting from its *last*-drawn point instead of its first, sometimes even flipping mid-edit as
`vertices` keys shifted. Draw order is just as stable frame-to-frame as an id sort (it doesn't
change unless the chain's own vertices do), but it also matches what a user actually expects "start
of the path" to mean.
`getEligibleVectorWidthNodes.ts` filters a list of node ids down to just the vector nodes with a
valid chain order — the single function both the pointer-gesture arm resolver and the toolbar gate
call into.

**The toolbar/dropdown gate vs. the keyboard shortcut — one bug, one shared fix.**
`useIsVectorEditMoreToolDisabled.ts` (now a thin wrapper around the pure
`components/Design/Canvas/utils/isVectorEditMoreToolDisabled.ts`) disables Variable Width unless
`vectorEditingNodeIds.length === 1` **and** that one node is eligible — Shape Builder never gates on
this at all. `VectorEditMoreDropdownItem`'s `PopoverItem` skips both its `onClick` and the Radix
`Close` wrapper when disabled (so a click on a disabled item neither activates the tool nor closes
the popover), and `VectorEditMoreDropdownTool`'s main-slot button gets a real native `disabled`
attribute. Both correctly re-enable the moment two independently-edited nodes get merged into one by
the Pen tool (§46/§53's own merge machinery already prunes `vectorEditingNodeIds` down to the
survivor — no extra code needed here, confirmed live and via the merge tests' own existing
assertions).

This gate was **not**, until today, reachable from the `Shift+W` shortcut itself:
`dispatchTool.ts`'s block condition only checked `VECTOR_EDIT_ALLOWED_TOOLS` (§45), and
`variableWidth` is on that whitelist — so pressing the shortcut while editing a branching or
multi-node selection silently activated the tool anyway, bypassing the exact same check the button
enforced. Fixed by extracting `useKeyboardShortcuts/utils/isDispatchToolBlocked.ts`, which ORs the
whitelist check with `isMoreToolName(tool) && isVectorEditMoreToolDisabled(tool, ...)` — `dispatchTool`
now just computes `isToolBlocked` from that one function and gates the dispatch on it, so the
shortcut and both mouse-click paths enforce identical eligibility.

**Break condition** (`store/design/utils/handleUpdateNode.ts`): right after the existing
`Object.assign(node, payload.changes)`, gated on `'segments' in payload.changes` so an unrelated
color/position patch never re-walks the chain, `isVectorWidthProfileEligible(node)` (`!widthProfile
|| getVectorChainOrder(node) !== null`) decides whether to null out `node.widthProfile` outright.
Because `handleUpdateNode` is the one real choke point every node-mutating caller routes through
(Pen, Shape Builder, Cut, vertex-merge-on-drag), every one of them reverts a profiled stroke back to
uniform width for free the moment an edit branches or disconnects the network — no per-caller
duplication, and no separate "stale segment id" check is needed since `position` is a chain-relative
fraction rather than a `(segmentId, t)` pair that could dangle.

**Gesture** — `armVectorWidthPointOnPointerDown.ts` fans out via `switch(true)` to three resolvers,
most-specific first: `armVectorWidthRegulatorShiftToggle` (Shift+click on any handle of a regulator
toggles that whole regulator, all three of its sides, in/out of
`selectedVectorWidthHandlesRef`), `armVectorWidthHandleGrab` (grabbing an existing left/right/point
handle), `armVectorWidthPointCreate` (a plain click on the bare stroke — hit-tested via the same
`getVectorCutHitAcrossOpenNodes` the Cut tool already uses — seeds a brand-new point at
`leftOffset = rightOffset = strokeWidth / 2`, **not** interpolated from any nearby existing point).
`continueVectorWidthPointDrag.ts` branches on `target`: `'point'` re-projects the pointer onto the
chain each move to update `position` (leaving offsets untouched); `'left'`/`'right'` computes a
signed perpendicular distance from the anchor and writes the **same** clamped-to-zero distance to
**both** `leftOffset` and `rightOffset` — so despite the data model nominally supporting an
asymmetric taper, every drag gesture today only ever produces a symmetric one (confirmed by
`continueVectorWidthPointDrag.spec.ts`'s own "symmetrically" -titled cases). Disarm always commits
whatever's in `vectorWidthPointDragRef`, even with zero pointer movement, so a plain click both
creates and persists a point in one gesture — same "re-derive from refs on disarm, no delta
bookkeeping" convention as Shape Builder. `commitVectorWidthPointDrag.ts` dispatches one `updateNode`
per affected node, `dispatchAsOneGestureIfMultiNode`-wrapped so a synced multi-node group resize
still coalesces into a single Undo step; `beginHistoryGesture`/`endHistoryGesture` already bracket
every pointer-down/up unconditionally, so no gesture-specific history code was needed at all.

**Multi-select group resize**: grabbing a resize handle re-derives the live group from whatever's
currently in `selectedVectorWidthHandlesRef` via `getVectorWidthPointGroupDragTargets.ts` (an
unselected lone point is treated as its own size-1 group) — every member then gets synced to the
one primary regulator's computed distance for the whole drag, regardless of which specific member's
handle was actually grabbed. A plain (non-Shift) grab of a handle that isn't part of the current
multi-selection replaces the selection with just that one regulator first.

**Rendering** — `drawVectorWidthPointsPreview.ts` is gated on `activeTool === ToolName.variableWidth`
and hides every Variable Width overlay (points, handles, hover marker, label) the instant the tool
stops being active, regardless of what's still selected in the refs. `getVectorWidthLabelTargets.ts`
shows the pink numeric badge (`drawValueLabel.ts`, a reusable MSDF-text-plus-`drawRect`-badge
primitive with real glyph-bounds centering, not approximate font metrics) only during an active
resize drag (never during a position drag, per `target === 'point'` returning `[]`) or when a
regulator is merely selected — defaulting to the last-grabbed side remembered in
`lastVectorWidthHandleSideRef` — with one label rendered per synced member during a group resize.
The resize cursor rotates to stay parallel to the handle's own guide line, reusing the existing
`getRotatedResizeCursorUrl`/cursor-rotation infra rather than a new mechanism; hovering the bare
stroke or an existing handle shows the dedicated `controller.png` cursor (hotspot `4 4`, same
convention as `bend`/`segment`/`cut-on`/`cut-off`).

Unit: `getVectorChainOrder.spec.ts`, `getVectorVertexDegrees.spec.ts`,
`getEligibleVectorWidthNodes.spec.ts`, `isVectorEditMoreToolDisabled.spec.ts`,
`isDispatchToolBlocked.spec.ts`, `dispatchTool.spec.ts` (extended with the two new blocking cases),
the full arm/continue/disarm/commit trio under `useSelectionTool/utils/handlePointerDown|Move|Up/`,
`getVectorWidthPointGroupDragTargets.spec.ts`, `toggleVectorWidthRegulatorSelection.spec.ts`,
`handleUpdateNode.spec.ts` (branching/disconnection revert cases). E2E:
`vector-variable-width.spec.ts` (TEST_CASES.md, Variable Width section) — adding several points at
correct chain fractions, the value label showing on selection and hiding on deselect, stretch-
redistribution keeping a point pinned to its fraction, a branching edit discarding the profile and
disabling the option, two edited nodes disabling the dropdown item until merged into one, and three
dedicated cases proving `Shift+W` now respects the exact same gate as the mouse-click paths.

## 64. Sector deletion — any face is click-selectable now, and Delete on a selected sector protects a shared, untouched neighbor's boundary

Requested directly ("Zaimplementuj usuwanie sektorów i pointów w wektorze za pomocą delete i
backspace"). Point (vertex) and segment deletion via Delete/Backspace already existed (§7/§8 above,
`handleDeleteSelection.ts`), and §56 already let a click on a **filled** face select all its vertices
in the Move tool — so Delete already deleted a filled sector transitively, by deleting every vertex
bounding it. Two clarifying decisions were needed before touching anything, since both contradicted
an existing, deliberately-tested constraint: (1) should an **unfilled** region be click-selectable
too — §56's own resolver had a dedicated test asserting a no-fill click returns `undefined` and
changes nothing; (2) should deleting a selected sector protect a boundary shared with an untouched
neighbor (Shape Builder's own Alt+click semantics), or keep the existing "delete every selected
vertex, including shared ones" behavior. Both were confirmed: yes to unfilled sectors, and yes to
protecting the shared neighbor.

**Selection widened to any face, not just filled ones.** `armVectorFaceSelectOnPointerDown.ts`
dropped its `isFilled` check (`Boolean(hit && getVectorFillLoopKeyAtPoint(hit.node, point))`) — any
`getVectorFaceAtPointAcrossOpenNodes` hit now claims the click and selects that face's vertex ids,
filled or not, same plain-replaces/shift-unions behavior as before. `resolveVectorFaceSelectHover.ts`
dropped the identical check so the hover hatch preview shows for any face too — no fill-gated
`drawVectorFaceSelectHoverPreview.ts`/`drawVectorSelectedFillPreview.ts` change was needed, neither
ever checked fill themselves, they just draw whatever face(s) the ref/helper below hands them.
`getVectorFullySelectedFaces.ts` dropped its own `node.filledFaceKeys.includes(...)` filter — it now
returns every face whose entire vertex set is currently selected, regardless of fill, which both
restores the persistent "fully selected" highlight for an unfilled sector and (see below) becomes the
delete path's own detector for "is this selection actually a sector".

**Deletion reuses Shape Builder's own `subtractVectorFaces`, not a new exclusive-boundary
algorithm.** `deleteSelectedVertices.ts` (`useKeyboardShortcuts/utils/handleDeleteSelection/`), per
owning node: computes `getVectorFullySelectedFaces(node, selectedVertexIds)`; if any come back, runs
`subtractVectorFaces(node, fullySelectedFaces)` (§59's own merge/subtract module — deletes each
touched face's *exclusive* boundary via `getExclusiveSegmentIds`, prunes orphaned vertices, drops the
touched face's own `filledFaceKeys` entry) to get an intermediate `sectorNode`; then subtracts the
sector faces' own vertex ids (`getVectorFaceVertexIds`, flattened into a `Set`) from the original
selection to get whatever's left over — any vertex the user selected that *isn't* part of a
fully-enclosed face, e.g. an extra shift-clicked point elsewhere on the same node. That leftover set
gets the exact same plain per-vertex delete this function always did, just applied on top of
`sectorNode` instead of the original `node`. When nothing is fully selected (`fullySelectedFaces`
empty, the ordinary point-selection case), `sectorNode === node` and the leftover set equals the
original selection verbatim — the whole function collapses back to its pre-existing behavior with one
harmless addition: `filledFaceKeys` is now always included in the dispatched `updateNode` payload
(unchanged value on this path, previously omitted entirely and left to self-heal at render time per
§43 — including it is a no-op here, only doing real work on the sector path).

**Why this protects a shared neighbor with zero new geometry logic.** `getExclusiveSegmentIds`
(§59) already only deletes a segment when *every* face bordering it is in the touched set — a
segment on the sector's own outer boundary (bordered by nothing but the unbounded exterior, which
`deriveVectorFaces` never enumerates as a face) always qualifies, but the shared divider between the
selected sector and an untouched neighbor does not, since the neighbor's own face is never in
`fullySelectedFaces`. Two adjacent sectors selected *together* (both fully enclosed by the same
selection) correctly still lose their shared divider too, exactly matching a Shape Builder drag that
sweeps both — this isn't special-cased, it falls straight out of "is every bordering face touched".

**Isolated-face case is `subtractVectorFaces`'s existing "no neighbor to protect" behavior, unchanged
from §59**: a selected sector with no untouched neighbor loses its entire boundary, same as Shape
Builder's Alt+click on a standalone face. `getVectorFullySelectedFaces.spec.ts`, this section's own
`armResolvers.spec.ts`/`resolveVectorFaceSelectHover.spec.ts` cases were flipped from asserting "no
fill → no selection" to asserting the opposite; `deleteSelectedVertices.spec.ts` gained the isolated-
sector, protected-neighbor, mixed-selection, and filledFaceKeys-drop cases (TEST_CASES.md #313-316).
e2e: `vector-edit.spec.ts` #313-314 (an unfilled square click-selected then fully deleted; a split,
unfilled square's top half click-selected then deleted, leaving the divider and the bottom half
intact) — #315-316 stayed unit-only per this file's own established "screenshot diff can't prove
*which* branch" rationale (TEST_CASES.md's closing section).

## 65. Duplicate/Copy/Paste extended down to vertex/segment level — a shared extract-then-merge pair, not a fourth clipboard mechanism bolted onto Delete's shape

Requested directly ("Dla wektorów też daj duplikację i kopiuj wklej"), as a follow-up to the
whole-scene-node Duplicate/Copy/Paste built in Etap 10 (`ROADMAP.md`,
`.claude/docs/design-tool-architecture.md` §6) — which had deliberately no-opped entirely whenever
`vectorEditingNodeIds.length > 0`, on the reasoning that Vector Edit Mode needed its own semantics.
This section is that semantics.

**Two new pure primitives carry the whole feature, both in `useKeyboardShortcuts/utils/`, both reused
by all three operations:**
- `extractVectorFragment(node, vertexIds, segmentIds) → TVectorFragment` (`{ vertices, segments,
  vertexHandleModes }`, all arrays/records of the *actual* objects, not just ids) — given a raw
  vertex-id list and segment-id list, expands them symmetrically: any segment in the input pulls in
  its own two endpoints (even if those weren't separately selected — duplicating a selected *edge*
  must duplicate its points too), and conversely any segment in the node whose *both* endpoints ended
  up in the resulting vertex set gets auto-included, unselected or not — the same "duplicate the
  connecting edge between two duplicated points" behavior Figma has. `vertexHandleModes` is filtered
  down to just the included vertices that actually had a non-default entry (the map is sparse —
  corner-mode vertices have no entry at all).
- `mergeClonedVectorFragment(targetNode, fragment, offsetX, offsetY) → { changes, newVertexIds,
  newSegmentIds }` — takes any `TVectorFragment` (doesn't care where it came from) and produces a
  ready-to-dispatch `updateNode` changes object: every vertex gets a fresh `nanoid()` and an
  `(offsetX, offsetY)` shift, every segment gets a fresh `nanoid()` with its `startId`/`endId`
  remapped through the same id substitution, `tangentStart`/`tangentEnd` copied verbatim (established
  back in Etap 5/10: tangents are relative vectors, not absolute coordinates, so a translate/duplicate
  never needs to touch them), and the result is merged *onto* `targetNode`'s existing
  `vertices`/`segments`/`vertexHandleModes` — nothing pre-existing is touched or removed. Because a
  vector node's `vertices`/`segments` ids are only ever looked up within that one node's own maps
  (never across nodes, confirmed by grepping every consumer), fresh `nanoid()` calls here need no
  collision-checking against anything.

**The three operations differ only in where the fragment comes from and where it's merged to** —
none of them re-implement extraction or merging:
- **Duplicate** (`duplicateVectorFragment.ts`) — source = `extractVectorFragment` on the *same* owning
  node(s) the current `selectedVectorVertexIdsRef`/`selectedVectorSegmentIdsRef` point at (found via
  the existing `getOwningVertexNodes`/`getOwningSegmentNodes` from `handleDeleteSelection/`, reused
  unchanged rather than duplicated a second time); target = that same node; offset =
  `DUPLICATE_OFFSET`. Multi-node selections (multi-vector-editing, §48) duplicate independently per
  owning node, exactly like the whole-scene-node Duplicate already did per selected node.
- **Copy** (`copyVectorFragment.ts`) — same extraction, but concatenated across every owning node into
  one flat fragment and stashed in a **second**, parallel module-level clipboard,
  `vectorClipboard.ts`'s `get/setVectorClipboardFragment` (deliberately separate from the whole-node
  `clipboard.ts` — different data shape entirely; a `TSceneNode[]` clipboard and a `TVectorFragment`
  clipboard can coexist without either being queried during the other's paste).
- **Paste** (`pasteVectorFragment.ts`) — source = the vector clipboard fragment (whatever node(s) it
  originally came from no longer matters, since every id gets freshly regenerated on merge anyway);
  target = **the last entry in `vectorEditingNodeIds`** — the simplest defensible choice for "which
  open node is the paste target" when several can be open simultaneously (§48) and there's no other
  notion of "active" among them; in the overwhelmingly common single-node-editing case this is just
  "the node you're editing."

**Wiring**: `handleDuplicateSelection.ts`/`handleCopySelection.ts`/`handlePasteSelection.ts` (the same
three files Etap 10 built) each gained a leading branch — if `selectedVectorVertexIdsRef.current` or
`selectedVectorSegmentIdsRef.current` is non-empty, delegate to the vertex/segment path above instead
of the whole-scene-node path; if both are empty *and* still inside Vector Edit Mode, fall through to
doing nothing (the original Etap 10 behavior, now scoped to "nothing at all is selected" rather than
"any Vector Edit Mode session whatsoever"). `handleCopySelection` picked up a new `refs` parameter it
didn't need before (it only ever read `store.getState()` directly), since the vertex/segment path
needs the two selection refs. Post-operation selection is written straight onto the refs (`refs.
selectedVectorVertexIdsRef.current = newVertexIds`, `selectedVectorHandlesRef.current = []`) exactly
like `handleDeleteSelection.ts` already does for its own vertex-delete branch — this state lives
outside Redux entirely (§4's ref-vs-Redux split, mirrored in `design-store-architecture.md` §5), so
there's no dispatch for it. `beginHistoryGesture(getVectorSelectionSnapshot(refs))` /
`endHistoryGesture()` bracket every multi-dispatch op so N duplicated/pasted vertices+segments still
collapse into one undo step, same pattern as the whole-node version and as §8's own foundation.

**Explicit scope trim, flagged per this file's own convention (§7)**: a duplicated/pasted fragment
never carries `widthProfile` (Variable Width points, §63) — those are keyed by fractional position
*along the path*, not by vertex id, so correctly relocating them onto a translated, re-ided fragment
is a separate piece of geometry math this request didn't ask for. A vertex/segment fragment that
happened to sit under a width point simply loses that width point's effect in the clone; the original
node's own width profile is untouched either way.

**Shipped-and-fixed real instance — a duplicated/pasted filled face came out unfilled.** The first cut
of fill-carrying (`extractVectorFragment` computing `filledFaceVertexIdSets: string[][]`, then
re-running `deriveVectorFaces` on the *merged* node and matching the new face by vertex-id set) looked
correct against a synthetic filled square and shipped — but broke on real data, live-reported with the
actual store dump: a shape made of **two curved segments sharing both endpoints** (a lens/eye shape,
not an *n*-sided polygon with *n* distinct vertices), where duplicating left `filledFaceKeys` with only
the original's one entry, never a second one for the clone. Two compounding problems with the
re-derive-and-match approach, not one:
1. `getVectorFaceVertexIds` only resolves a piece key's boundary marker when it's `v:<realVertexId>` —
   a marker for a **planarized crossing point** is `x:<otherSegmentId>:<n>` instead
   (`getVectorPieceBoundaryKeys.ts`), which the vertex-id regex silently drops. Switching to matching by
   each face's **real segment ids** (`getVectorFaceRealSegmentIds.ts`, parsing the id straight off each
   piece key's own `${realSegmentId}[...]` prefix — the same string a piece key is already keyed by)
   sidesteps this specific gap, but doesn't fix the deeper problem below.
2. **Re-deriving faces on the *merged* node is inherently unreliable**, regardless of which id type the
   match is keyed on — `DUPLICATE_OFFSET` (10 world units, `Canvas/constants.ts`) is a small, fixed
   nudge, so any shape larger than that overlaps its own freshly-placed duplicate once both live in the
   same node's `segments`/`vertices` at once. `deriveVectorFaces`'s planarization step (§12) then finds
   *genuine* crossings between the original and its own clone, fragmenting the derived faces in a way
   that no longer has a single face whose boundary cleanly equals "just the duplicated segments" — so
   the match fails and the new key never gets added, silently, no error.

**The fix drops re-derivation entirely** in favor of purely **remapping the already-known-good original
piece key string** — the key that produced the correctly-filled *original* face is proof enough that key
shape is valid; duplicating it just needs its ids substituted, not its topology re-solved from scratch.
`extractVectorFragment` now stores each captured filled face's full, unmodified `pieceKeys: string[]`
(`TVectorFragment.filledFacePieceKeySets: string[][]`) instead of any derived id set. `mergeClonedVectorFragment`
builds (in addition to the existing vertex `idMap`) a parallel `segmentIdMap: Map<oldSegmentId,
newSegmentId>`, and the new `getDuplicatedFilledFaceKeys.ts` calls a new `remapPieceKey.ts` per piece
key: split it into `realSegmentId` + the two `|`-joined boundary markers, remap the segment id through
`segmentIdMap`, remap a `v:<id>` marker's id through the vertex `idMap` and an `x:<segmentId>:<n>`
marker's embedded segment id through `segmentIdMap` too (a self-crossing boundary always references
*another segment of the same face*, which is guaranteed to also be in the captured set — the "is this
face captured" filter in `extractVectorFragment` already requires *every* real segment bounding a face
to be in the duplicated/copied set), then re-sort the two remapped boundaries and rejoin — exactly
mirroring `getVectorFillPieceKey.ts`'s own construction, just done by string substitution instead of by
re-walking geometry. This is correct regardless of whatever unrelated overlap the *rest* of the merged
node's geometry has, since it never looks at that geometry at all.

## 66. Erase tool — a real boolean subtract of the brush capsule, not a sever-and-drop

Requested directly ("Erase jest obok cut narzędzia do wektora", with Figma reference screenshots and
the Figma help doc), sitting next to Cut on the `VectorEditToolbar` — `ToolName.erase`, `Shift+E`.
Drag a circular brush over the network; wherever it sweeps the boundary of a filled face, the fill
survives with a real notch carved into it (new boundary walls trace both sides of the swept path);
wherever it sweeps a segment that isn't part of any fill, that segment just gets a clean gap, same as
before. The node is **never** split into components (Figma parity — erasing all the way across
doesn't create a second layer).

**v1 shipped a "sever the one touched segment at entry/exit, drop the covered piece" model.** It broke
the moment the dropped piece was part of a filled face's boundary: `getVectorFillLoopPoints` can't
walk a loop once it's open, so the **entire fill vanished**, not just a local bite — confirmed
directly by the user ("Chce zobaczyc dziure a nie zniknięcie całego fill"). Three narrower attempts to
patch this in the *preview* only (a flat background-colour mask, then a fill-coloured/silhouette-clipped
mask, then an accurate live geometry substitution) all missed the point: the **committed** geometry
itself was destroying the fill, so no preview trick could fix it. The real fix replaces the geometry
pipeline entirely with a boolean subtraction of the brush's swept shape from the network.

### Geometry — `utils/canvas/vectorNetwork/eraseVectorNetwork/`, all pure

The key discovery that made a from-scratch polygon-clipping algorithm unnecessary: the codebase
already has a general planar-graph engine built for the pen tool's self-intersecting paths.
`planarizeVectorNetwork(segments, vertices)` (`vectorNetwork/planarizeVectorNetwork/`) finds every
crossing between arbitrary straight-or-Bézier segments and splits both at each crossing;
`deriveVectorFaces(node)` (§2) walks the resulting planar graph and returns every bounded simple
closed loop as a `TVectorFace { key, pieceKeys, points }` — `getVectorFillLoopKey(pieceKeys)` is
exactly the string format `filledFaceKeys` stores. So instead of clipping polygons by hand, erase
builds the swept brush shape as *ordinary new segments*, merges them into the node, and lets that
existing machinery work out the resulting topology for free — leaving one simple classification rule
per resulting piece.

- **`buildCapsuleNetwork/`** — `buildCapsuleNetwork(path, radius)` returns `{ polygon, segments,
  vertices }`: a closed loop of fresh-`nanoid` straight segments approximating the Minkowski sum of
  the recorded brush path with a disk of `radius` (a single point → a 16-gon circle; a multi-point
  path → two offset rails joined by two round-arc caps, all via `getPointDirection.ts`'s
  incoming/outgoing-direction average per path vertex — offsetting per-vertex rather than per-leg is
  what avoids needing a separate join at every interior point). Kept to *straight* segments even
  against a *curved* original boundary — `planarizeVectorNetwork` already flattens both sides for
  crossing search regardless, so "curves work" comes for free. `buildCircle.ts`/`buildCapArc.ts` both
  carry a small `PHASE_OFFSET` (`0.0137` rad) added to every sampled angle: without it, an
  evenly-divided circle/arc lands vertices at exact cardinal angles relative to its own centre, which
  coincides with a genuine crossing point whenever the brush sits on (or drags along) an axis-aligned
  edge — completely ordinary in a design tool. `planarizeVectorNetwork`'s own crossing search
  (`getStraightSegmentIntersection.ts`) deliberately ignores an intersection landing exactly on either
  segment's endpoint (so an ordinary shared vertex never gets mistaken for a crossing); that
  coincidence silently *dropped* the real crossing instead, so the untouched segment's own full-length
  midpoint tested "inside the capsule" and the eraser deleted the whole segment instead of leaving two
  stubs. The offset just has to be non-zero and not a clean fraction of a quarter turn.
- **`subtractCapsuleFromVectorNetwork/subtractCapsuleFromVectorNetwork.ts`** — the whole pipeline:
  1. Merge `{ ...node.segments, ...capsule.segments }` / vertices, run `planarizeVectorNetwork`.
  2. `filterKeptSegments.ts` classifies every resulting piece by **midpoint** (`getSegmentMidpoint`):
     a piece descended from the *original* network survives iff its midpoint is **outside**
     `capsule.polygon`; a piece descended from the *capsule* survives iff its midpoint is **inside at
     least one** of the node's *original* filled-face polygons (`getOriginalFillPolygons.ts`). The
     second rule is what makes a wall appear only where it's carving into a fill, and disappear
     entirely over a plain unfilled/open path — reproducing the old clean-gap behaviour there with no
     special-casing.
  3. `deriveVectorFaces` on the pruned network, then `deriveFilledFaceKeys.ts` keeps every new face
     whose **centroid** falls inside an original polygon, pairing it with that original's own key
     (`TSurvivingFace = { key, originalKey }` — see the color-flicker fix below for why the pairing
     matters). Two extra filters guard against degenerate outcomes: `MIN_FACE_AREA` drops sliver faces
     a few thousandths of a unit across (a floating-point artifact right where a capsule rail's
     straight leg meets its curved join, not a real region); `isEntirelyCapsule` drops a face made
     *only* of capsule segments — a brush stroke that never touched any boundary, floating disjoint
     inside a fill. Filling that in would need it to render in the *same* color as the shape it's
     meant to punch a hole in, but each loop's color is an independent hash of its own key
     (`getVectorFillColorForLoopKey` — see `groupFilledFacesForRendering.ts`) with no shared-color
     mechanism between two unrelated loops; counting it as a survivor paints a solid, wrong-colored
     blob instead of a hole. Until the color model supports a real hole, a fully-interior stroke stays
     bare unfilled geometry — a real, undoable cut, just not a filled one. (§73 later adds a real,
     explicitly-tracked hole↔parent relationship, but only wired into the Paint click path — this
     erase/capsule pipeline was never revisited to use it.)
  4. Return `null` (the pipeline's "no-op" contract) when nothing was dropped and nothing new was
     kept — the brush genuinely missed everything.
- **`severVectorSegmentAtPoint.ts`** (`cutVectorNetwork/`, shared with Cut) — no longer touched by
  erase at all (a `round` parameter added for the old model was reverted); Cut's own
  `commitVectorSplit.ts` remains its only caller.

### Interaction — record on drag, commit on release (mirrors Cut's arm/continue/disarm shape)

- `armVectorEraseOnPointerDown.ts` (in `ARM_RESOLVERS`, next to Cut) — sets `vectorEraseDragRef`
  (`{ lastPoint }`) and `vectorEraseStrokeRef` (`[point]`), `setPointerCapture`, `setClassName('erase')`.
  **No dispatch.**
- `continueVectorEraseDrag.ts` — pushes the pointer position onto `vectorEraseStrokeRef.current`.
  **No dispatch, no geometry change** (added after the user pointed at Figma's own behaviour: "real
  time nie modyfikują wektor tylko … urywa ten stroke że widać pod spodem linie które są segmentami").
- `disarmVectorEraseDrag.ts` — `commitVectorErase(dispatch, strokePath, radius)`: for each editing
  node, bake rotation (`bakeVectorNodeRotation` — a rotated node flattens to `rotation: 0` on erase,
  since the world-space brush must line up with stored points), run
  `subtractCapsuleFromVectorNetwork`, one `updateNode` (`filledFaceKeys`, `segments`, `vertices`).
  Then clear both refs, release capture, `setClassName('erase')` (**stays** on the tool, unlike Cut's
  auto-return to Move). `handlePointerDown.ts` already opened the history gesture for the whole
  interaction, so the single commit = one undo step.

**Brush size:** `eraserDiameterRef` (a `TCanvasRefs` `RefObject<number>`, default
`ERASER_DEFAULT_DIAMETER_PX = 10` **screen px** — converted to world via `/zoom` for hit-testing,
like every other tolerance here). `[` / `]` adjust it, clamped to `[1, 100]` —
`adjustEraserDiameter.ts`, called from `useSelectionTool.ts`'s `onKeyDown`, gated on
`activeTool === ToolName.erase`. Session-scoped: survives tool switches, resets on reload, **not**
undoable.

**Preview + cursor:** `resolveVectorEraseHover.ts` tracks `eraseBrushCenterRef` on idle moves;
`drawScene/drawVectorEraseBrush.ts` strokes a thin circle there via `drawEllipse`, in
`DRAFT_FRAME_STROKE` (the same blue used for every other box/frame/selection outline in the app —
originally a distinct grey, changed on request so the brush outline reads as "the app's own outline
color" rather than a one-off). Cursor class `erase` → `erase.png` at hotspot `(8, 24)`.

**Shift axis-lock, shared with Pencil's own.** Holding Shift mid-stroke constrains the brush path to
the nearest cardinal (horizontal/vertical) axis — "lock on first move, hold until release", the same
shape as Pencil's own Shift lock (`pencil-tool.md` §5). Rather than duplicate that logic, the two
primitive functions it's built from — `getDominantAxis.ts` and `getAxisLockedPoint.ts` (plus their
`TAxisLock` type and `AXIS_LOCK_THRESHOLD_PX` constant) — were pulled out of
`useDrawPencilTool/utils/handlePointerMove/` up into `components/Design/Canvas/utils/`, a location
both tools' hooks can import from, and Pencil's own files updated to import from the new shared
location instead of a local copy. Erase's own state lives right on `TVectorEraseDragState`
(`axisLock`, `shiftAnchor`, alongside the existing `lastPoint`) rather than as separate refs, since
erase already carries one mutable drag-state object per stroke; `continueVectorEraseDrag.ts` freezes
`shiftAnchor` to the last real point the first time Shift matters, locks `axisLock` once movement
clears the threshold, and never re-evaluates the axis once locked. Unlike Pencil, erase needs no
separate "fold the pending locked point into the tail" step on release — every point, locked or not,
is pushed straight onto `vectorEraseStrokeRef` the moment it's computed (no chunked/simplified tail
buffer sits in front of it), so releasing Shift (even via `useSelectionTool.ts`'s existing
`onShiftKeyChange` synthetic-pointermove-on-key-change mechanism, extended to also fire while
`vectorEraseDragRef.current` is set, not just `vectorHandleDragRef`) just resumes pushing raw points
from whatever the real cursor position already is.

### The live preview is the real geometry, substituted in for rendering only — and it has to reach *two* layers, not one

`getErasePreviewNodes.ts`: for every scene node that's both a `TVectorNode` and one of
`vectorEditingNodeIds`, while Erase is active and `vectorEraseStrokeRef` holds an in-progress stroke,
it bakes rotation and runs `subtractCapsuleFromVectorNetwork` — the *exact same* function
`commitVectorErase.ts` runs on pointer-up — then splices the result into the array in place of the
real node before it reaches `drawSceneNodes`. Nothing is dispatched (recomputed from the refs every
frame, discarded after), so this still satisfies "the vector data is not touched while dragging" —
a render-only stand-in, exactly like the existing `draggedVectorNodeSnapshots` family
`drawSceneVectorNode.ts` already substitutes for a live drag/resize/rotate.

Two problems surfaced only by *watching a real drag*, not by unit tests:

- **Color flicker.** A node's fill color comes from `getVectorFillColorForLoopKey(key)` — a hash of
  the face's *exact* boundary-segment composition. During a live drag the boundary's composition
  changes every single frame as the path grows, so the hash (and the rendered hue) jumped around the
  whole color wheel for as long as the mouse was held — even on a node with a perfectly stable,
  already-established color. The fix is a render-only color pin, not a data change:
  `TVectorNode.fillColorOverrideByKey?: Record<string, string>` (a new, always-optional field — no
  real, persisted node ever sets it) and `groupFilledFacesForRendering.ts` checks
  `renderedNode.fillColorOverrideByKey?.[key] ?? getVectorFillColorForLoopKey(key)` before falling
  back to the hash. `getErasePreviewNodes.ts` builds that map from `erased.survivingFaces`'s
  `{ key, originalKey }` pairs — each surviving face is pinned to *its own* original counterpart's
  color, not a single blanket color for the whole node (a node can have several independently-colored
  faces; forcing them all to one color was an earlier, wrong attempt at this same fix, caught the same
  way — by watching it live on a multi-face node).
- **The thin skeleton papers over the cut.** `drawVectorEditHandlesLayer` (the thin outline + vertex
  dots that show the real, editable network) reads nodes straight from Redux state
  (`getBakedVectorEditingNodes.ts`), not from the erase-substituted `sceneNodes` — exactly right most
  of the time, since it's meant to show the real vertex network *underneath* an uncommitted drag. But
  during an active erase, that thin line traces the segment's full pre-erase length the whole time the
  mouse is held, visually masking the gap the thick stroke (drawn from the substituted node) is
  otherwise correctly showing. A filled node still *looked* like something was happening (the fill
  boundary visibly changed); an unfilled node had nothing else to reveal the cut through, so it read
  as "erase does nothing until you release" — reported directly ("nie widać w trakcie efektu cięcia").
  `getEraseAwareNodesById.ts` builds a copy of `nodesById` with the vector-editing node(s) swapped for
  their already-computed `sceneNodes` entry (only while `activeTool === erase`), and `drawScene.ts`
  passes *that* to `drawVectorEditHandlesLayer` instead of the raw `nodesById` — so the skeleton
  tracks the same live cut the thick stroke does, instead of masking it.

Once the real node is swapped out for the live-eroded one at both layers, normal back-to-front
compositing does the rest for free: wherever a segment is gone, whatever was already drawn earlier in
the frame — the canvas background, the grid, another shape underneath — simply shows through, because
nothing is drawn over it any more.

**Wiring** (same spots as every vector-edit tool): `ToolName.erase`, `VectorEditToolbar/constants.ts`
`TOOLS` (after Cut, `EraseTool` icon from `@xigma/components`), `Toolbar/constants.ts`
`TOOL_ICON`/`TOOL_LABEL`, `keys.ts`, `shortcuts.ts`, `useKeyboardShortcuts.ts`,
`isDispatchToolBlocked.ts` `VECTOR_EDIT_ALLOWED_TOOLS`, `useSelectionTool.ts` effect gate,
`en.json`/`pl.json`.

Unit: every new util has its own spec (100% coverage), including `subtractCapsuleFromVectorNetwork`'s
own boundary-touching-bite, fully-interior-stroke, and fully-consumed-face scenarios; the shared
`getDominantAxis`/`getAxisLockedPoint` primitives have their specs alongside them in
`components/Design/Canvas/utils/test/`.

e2e: `vector-erase.spec.ts` — the `Shift+E` shortcut, a mid-edge drag on unfilled geometry (the old
sever/drop parity case), brush-diameter growth via `]`, and the headline fix itself: a dip through a
filled edge (in and back out) carves new wall segments while `filledFaceKeys` stays non-empty, proving
the fill survives instead of vanishing. `vector-erase-multi.spec.ts` — with two filled nodes open for
editing at once, one continuous stroke correctly scopes itself per node: a dip into only one leaves the
other byte-identical; a dip into both carves and preserves both fills independently; a single Undo
after the double-touch stroke reverts both nodes at once (one history gesture, not two), mirroring
`vector-cut-multi.spec.ts`'s own scenario shape for Cut.

**v1 limitations:** a rotated node is baked flat on erase; a stroke that sweeps back over the *same*
segment from two separate approaches (dips away and returns) collapses to one span covering both,
rather than leaving the untouched middle stretch intact; erasing pure fill area that never crosses a
face's boundary produces bare unfilled geometry rather than a real hole (the fill-color-sharing gap
above); no right-sidebar weight/shape panel; the brushed path uses straight rails + round caps, not a
fully round-jointed capsule union at interior bends.

## 67. Paint gets a real color — the ColorPicker wired to the tool button, `fillColorOverrideByKey` now set on click instead of only by conversion utils

Until now the hash-derived hue from `getVectorFillColorForLoopKey.ts` (§51) was the *only* color a
freshly-painted face ever got — `armVectorPaintOnPointerDown.ts` toggled `filledFaceKeys` but never
touched `fillColorOverrideByKey`, so every click looked like it picked a random color. The ColorPicker
component (built standalone in an earlier session, never wired into a real consumer) is now the actual
color source for the Paint tool.

**One new top-level `TDesignState` field, `paintColor: string`** (`store/design/types.ts`), defaulting
to `DEFAULT_PAINT_COLOR = '#D9D9D9'` (`store/design/constants.ts`) — a plain hex string, mirroring
`fillColor`/`fillColorOverrideByKey`'s own shape (no alpha channel on a vector fill yet, so the picker's
alpha stays pinned to 100 for this flow). New `setPaintColor` reducer + `selectPaintColor` selector,
both following the exact one-line pattern `penActiveVertexId` already used.

**`armVectorPaintOnPointerDown.ts`** now reads `selectPaintColor(state)` and, only on the *add* branch
(not on un-filling), writes `fillColorOverrideByKey: { ...node.fillColorOverrideByKey, [newLoopKey]:
paintColor }` alongside `filledFaceKeys` in the dispatched `updateNode`. Un-filling leaves
`fillColorOverrideByKey` untouched — the stale entry for a key no longer in `filledFaceKeys` is inert,
same as every other place in this doc that already tolerates orphaned override entries (§51, §66). The
hash fallback in `getVectorFillColorForLoopKey.ts` still exists and still fires for anything that sets
`filledFaceKeys` through a path other than this resolver (shape→vector conversion, cut/erase) — it is
not retroactive, so faces painted before this change keep whatever color they already had.

**The toolbar button itself is no longer generic.** `VectorEditToolbar/constants.ts`'s `TOOLS` array is
unchanged (still the single source of icon/label/shortcut for all six tools), but `VectorEditToolbar.tsx`
now special-cases the `paint` entry to render a new `VectorEditPaintTool` component instead of the
generic `VectorEditToolButton` — every other tool's rendering path is untouched. `VectorEditPaintTool`
switches its own markup on the `isActive` prop it's given (same prop shape as `VectorEditToolButton`, so
the parent's `.map()` stays a one-line ternary):

- **Inactive** — identical markup to `VectorEditToolButton` (Tooltip + `Button` + static `PaintTool`
  icon + label). Click dispatches `setActiveTool(ToolName.paint)` via the existing
  `useSelectVectorEditTool` hook, same as any other tool.
- **Active** — swaps to rendering `ColorPicker` directly (imported by path — like Sampler/ButtonMenu
  before it, `ColorPicker` still isn't in the `shared` barrel), with a `Color` swatch (14×14, sized via
  a `className` override — the shared `Color` component's own intrinsic size is 16×16, per its one
  existing consumer, `Footer`'s 24×24 preset cells) as the trigger, reflecting `paintColor` from Redux.

**No extra "is the picker open" state needed anywhere.** Because the inactive→active transition swaps
in a *new* DOM node (the generic button unmounts, `ColorPicker`'s own Radix `Popover.Trigger` mounts in
its place), the click that just activated the tool never also opens the panel — it landed on the old
node. Every click on the new swatch node after that is Radix's own default trigger-toggle behavior
(`Popover.Root` is uncontrolled here, exactly like every other `Popover` consumer in this codebase):
2nd click opens, 3rd closes, and the component stays on its "active" render branch throughout since
that only depends on `activeTool === ToolName.paint`, not on the panel's open state.

**One prop added to the shared `ColorPicker`/`Popover`, `triggerClassName`** — `ColorPicker`'s existing
`className` prop only ever styled its *content* wrapper, never the trigger button Radix renders, so
there was previously no way to give that trigger the "selected tool" look (blue background, matching
every other active `Button` in this toolbar). Threaded straight through to `Popover`'s own
`triggerClassName` (which already existed and already had this exact use case — `ButtonMenu` uses it),
so this is a one-line, backward-compatible addition, not a new mechanism.

## 68. Erase/Cut/Shape Builder now carry a face's own picked color forward too — closing the gap §67 flagged

§67 wired the ColorPicker into Paint but explicitly left "cut/erase" (and, unnoted there, Shape
Builder) falling through to the hash-derived fallback whenever they re-derived a face's loop key —
every geometry-changing tool nicked a painted face's key composition, so its picked color vanished
and a new, effectively-random hue appeared instead. Same root cause everywhere: a face's color lives
in `fillColorOverrideByKey`, keyed by loop key; any operation that changes *which* real segment
pieces bound a face produces a **new** key, and nothing was carrying the old key's color over to it.

**One shared primitive added first**: `getEffectiveVectorFillColor(node, loopKey)`
(`utils/canvas/vectorNetwork/getEffectiveVectorFillColor.ts`) — exactly the `?? getVectorFillColorForLoopKey(key)`
fallback `groupFilledFacesForRendering.ts` (the renderer) and `armVectorPaintOnPointerDown.ts` already did
inline, now the one canonical way to ask "what color does this face actually render as right now,
override or hash." The renderer was switched to call it instead of repeating the `??` itself.

**`TSurvivingFace = { key: string; originalKey: string }`** (moved from being erase-only, in
`eraseVectorNetwork/subtractCapsuleFromVectorNetwork/deriveFilledFaceKeys.ts`, up to the shared
`vectorNetwork/types.ts`) is the pairing every fix below reuses: "this new key's face is the same
face as that old key's, so look up the old key's effective color and pin it onto the new key."

- **Erase** — `deriveFilledFaceKeys.ts` already computed this pairing for the "does this new face
  belong to that original filled polygon" test (§66); `subtractCapsuleFromVectorNetwork.ts` now also
  builds `fillColorOverrideByKey` from it and returns it on `TErasedNetwork`, and
  `commitVectorErase.ts` forwards it into the dispatched `updateNode`. `getErasePreviewNodes.ts`
  (the live-drag preview) got *simpler*, not more complex — it used to re-hash `originalKey` by hand
  (a preview-only hack from §66, before real per-face colors existed); now it just spreads the real
  `erased.fillColorOverrideByKey` the commit path also uses, so the preview and the commit agree.
- **Cut** — two sub-paths, one easy one hard:
  - Non-disconnecting ("connected cut", `materializeVectorNetworkCut.ts`): `resolveVectorCutFilledFaceKeys.ts`
    already ran a centroid → `getVectorFaceAtPoint(_, originalNode)` lookup per new face to decide
    *whether* it was filled before (§ "the real, only call site" per its own file) — it just discarded
    the matched original face's own key afterward. Now it returns `TSurvivingFace[]` instead of
    `string[]`, and `materializeVectorNetworkCut.ts` builds `fillColorOverrideByKey` from it exactly
    like Erase does. `TVectorConnectedCutResult` gained the field; `applyConnectedCutResults.ts`
    forwards it.
  - Disconnecting (Split/Divide, sharing `commitVectorCutComponents.ts`): `resolveSurvivingFilledFaceKeys.ts`
    is the "easy" case — a surviving face keeps its *exact original key* (it only filters, never
    re-derives), so `originalKey === key` and no pairing is even needed, just a direct
    `getEffectiveVectorFillColor(node, key)` lookup. Both `commitVectorSplit.ts`'s inline
    ≥2-component `finish` callback and `finishDividedComponent.ts` (Divide) now build a
    `fillColorOverrideByKey` this way. A face genuinely **closed by the cut line itself**
    (`addCutClosingSegment.ts`/`deriveClosedFaces.ts`) has no single original ancestor — that's real
    new geometry, structurally the same as a fresh Paint click on virgin area, so it deliberately
    keeps falling back to the hash color; `finishDividedComponent.ts` only colors the *surviving*
    half of its merged key set, never the newly-closed half. `TVectorNetworkComponent` gained an
    optional `fillColorOverrideByKey` field to carry this through; `commitVectorCutComponents.ts`
    forwards `finish()`'s result into both its `updateNode` (primary) and `addNode` (spun-off
    components) dispatches.
- **Shape Builder** — `subtractVectorFaces.ts` needed **no change at all**: it only ever removes
  faces, never creates one, and already returned `{ ...node, ... }`, so `fillColorOverrideByKey`
  was already riding along on the intermediate result object the whole time. The gap was entirely
  downstream, at the three `updateNode` dispatch sites (`commitCrossingVectorNodeGroup.ts`,
  `commitSingleVectorShapeBuilderNode.ts`) hand-picking `{ filledFaceKeys, segments, vertices,
  [rotation] }` out of that result and never mentioning the color field — now they do.
  `mergeVectorFaces.ts` (the one operation that *does* create a new face, by deleting the interior
  boundary between touched faces) had the real gap: the merged face's key is brand new, and — since
  a merge can combine faces that had genuinely different colors — there's no single "correct"
  answer, so it takes the **first touched face's** effective color, deterministic by touch order.
  `groupCrossingVectorNodes.ts`'s `buildCombinedNode` had a separate, quieter bug: `filledFaceKeys`
  was already unioned across every group member via `flatMap`, but `fillColorOverrideByKey` was
  only ever the survivor's own map (`{ ...survivor, ... }`), so a non-survivor member's own painted
  faces silently lost their color the moment two open nodes crossed paths — fixed by unioning every
  member's map the same way `filledFaceKeys` already was.
- **Not touched**: `deleteSelectedVertices.ts` (Delete key on selected vertices, also calls
  `subtractVectorFaces.ts`) needed no fix for the same reason as the Shape Builder subtract path —
  subtract never mints a new key, so the store's pre-existing `fillColorOverrideByKey` for whatever
  survives is already correct without being re-dispatched.

Every touched file kept/reached 100% coverage; the positive "a key survives geometrically unchanged
and keeps its color" case and the negative "a brand-new closed-off face does NOT inherit a stale
color" case are both asserted explicitly wherever the distinction exists (Cut's connected-cut and
Divide paths especially, since that's where both cases coexist in the same function).

## 69. Paint becomes a real drag brush — multiple faces per stroke, a remove mode, and always-paint-never-remove on an already-filled start face

§67/§68 only ever painted one face per click. Paint now also arms a drag: `armVectorPaintOnPointerDown.ts`
still handles the single click (and decides add-vs-remove from whatever face was clicked), but
`continueVectorPaintDrag.ts` (promoted to its own folder — `paintNodeAlongPath.ts`/`addNodeAlongPath.ts`/
`removeNodeAlongPath.ts` siblings, same split-massive-function shape as `drawScene/`) sweeps every face
the accumulated stroke path crosses past `MIN_DRAG_DISTANCE_PX`, painting (or, with `isVectorPaintRemoveRef`
armed, un-filling) each still-untouched-this-stroke face in one dispatch per move event. A
`touchedVectorPaintLoopKeysRef` Set-per-node prevents re-processing a face already handled earlier in the
same stroke.

**Always paint, never remove, once a stroke is genuinely dragging**: clicking an already-filled face
toggles it off (plain click semantics, unchanged) — but if that click turns into a real drag,
`armVectorPaintOnPointerDown.ts` defers marking the start face "touched" until it's actually re-swept
by `continueVectorPaintDrag.ts`'s own pass, so a drag that begins on a filled face and moves on always
ends with that face still filled, never left as an accidental hole. Same brush semantics as Figma: a
drag only ever adds (or, in remove mode, only ever removes) — it doesn't toggle per-face like a plain
click does.

**A render-only regression, not a data bug**: the touched-faces drag preview (`drawVectorPaintTouchedFacesPreview.ts`,
a hatch-fill overlay keyed off `vectorPaintTouchedFacesRef`) draws unconditionally whenever that ref is
non-null — it doesn't check whether a stroke is actually still in progress. `useSelectionTool.ts`'s
tool-switch cleanup effect resets `vectorPaintPathRef`/`touchedVectorPaintLoopKeysRef` but had missed
`vectorPaintTouchedFacesRef`/`isVectorPaintRemoveRef` (both of which `disarmVectorPaintDrag.ts` already
resets on a clean pointerup) — so a stroke interrupted by a tool switch mid-drag (rather than a normal
release) left a stale, frozen "touched faces" preview rendering on every subsequent frame, reading as
the whole shape being painted even though `filledFaceKeys` itself was correct. Fixed by adding the two
missing resets alongside the two that were already there.

Coverage: unit (100%, including a dedicated spec per split file, not just the orchestrator), e2e
(`vector-edit.spec.ts` — a drag starting on an already-filled face keeps it filled while still painting
every new face the stroke crosses).

## 70. Variable Width value label gets a hover border — keyed on hovering the label rect, not the width point

§63's pink value badge (`drawValueLabel`) now thickens to a white border while the pointer is over
**the badge itself**, not over the width point/handle on the curve. Those are two independent hover
states with two independent refs:

- `hoveredVectorWidthPointRef` (unchanged) — the width point/handle on the stroke; drives the
  `controller`/resize cursor and `drawVectorWidthPointHoverMarker`'s cut-point marker on the curve.
- `hoveredVectorWidthLabelRef` (new, same `TVectorWidthPointHover = {nodeId, segmentId, t}` shape) —
  the value badge's screen rect. Set by `resolveVectorWidthLabelHover.ts` (added to
  `handlePointerMove.ts`, and to `useSelectionTool.ts`'s tool-switch cleanup), which mirrors
  `resolveVectorWidthPointHover`'s guards (`variableWidth` active, a node in edit mode, `buttons === 0`)
  and hit-tests via `getVectorWidthLabelAtPoint.ts`.

`getVectorWidthLabelAtPoint` walks the same `getVectorWidthLabelTargets(refs, nodes)` the renderer
draws, so only an on-screen label can be hovered, and rebuilds each badge's world rect from the exact
draw-path math: `getVectorWidthLabelAnchor.ts` (extracted from `drawVectorWidthValueLabel.ts` — the
anchor/normal/side calc both now share) then `getValueLabelBadgeGeometry` for centre + width/height,
then an axis-aligned point-in-rect test (labels are never rotated for this tool). A match writes the
resolved `{nodeId, segmentId, t}`; `isVectorWidthPointHovered` then compares that to each label
target's freshly recomputed `{segmentId, t}` inside `drawVectorWidthValueLabel` — exact float equality
is safe because both sides run the identical `getVectorChainPositionAtFraction` call.

**`drawValueLabel.ts` split into `drawValueLabel/`** (same "own folder + focused siblings" convention
as `handleMoveNodesToPage/`, `continueVectorPaintDrag/`): `getValueLabelBadgeGeometry.ts` (pure
centre/size math, reused by the hit-test above), `drawValueLabelBorder.ts` (the hover border rect —
`VALUE_LABEL_HOVER_BORDER_PX`/`VALUE_LABEL_HOVER_STROKE`, drawn as a larger rounded rect *behind* the
badge, the same double-draw trick as `drawSelectedWidthHandleDiamond.ts` rather than `drawRect`'s
unreliable native stroke), `drawValueLabelBadge.ts` (the fill rect), `drawValueLabelText.ts` (MSDF
glyph translate/rotate/draw). Orchestrator `drawValueLabel.ts` is now just: measure text → geometry
→ border if `isHovered` → badge → text. `drawSelectionSizeLabel.ts` (the other consumer) and
`drawVectorWidthValueLabel.ts` both import from `.../drawValueLabel/drawValueLabel` now.

Coverage: unit 100% (a spec per split file plus `getVectorWidthLabelAnchor`, `getVectorWidthLabelAtPoint`,
`resolveVectorWidthLabelHover`).

## 71. Variable Width value label becomes editable — double-click to overtype the total width

Double-clicking the pink value badge opens a DOM `<input>` over it (same `worldToScreen`-positioned
overlay pattern as `TextEditOverlay`), pre-selected for overtype; Enter/blur commit, Escape cancels.
The badge text is `round(leftOffset + rightOffset)` — the **total** width — so a committed value `n`
writes a symmetric taper `leftOffset = rightOffset = n / 2` (matching what every drag gesture
produces). Empty / non-numeric / negative input, or a value equal to the current total, reverts (no
dispatch); a real change is one `updateNode` (undoable). Only the one regulator is edited, never the
selected group.

Pieces:

- **`CanvasValueLabelInput`** (`Canvas/CanvasValueLabelInput/`) — the reusable presentational input:
  anchored on a screen-space centre (`translate(-50%, -50%)`), controlled value, `size` attribute
  tracks `value.length` so the pill grows/shrinks with the text while `min-width` keeps it no
  narrower than the badge, autofocus+select on mount, `settle`-once guard so Enter-then-blur
  doesn't double-fire, `stopPropagation` on keydown (canvas shortcuts) and pointerdown. Built
  standalone because it's meant for other on-canvas numeric labels later.
- **`getVectorWidthLabelRects.ts`** (`Canvas/utils/`) — extracted from §70's `getVectorWidthLabelAtPoint`,
  which now just point-tests its output. Returns every visible label's world rect
  (`center`/`badgeWidth`/`badgeHeight`) **plus** the resolving `target` (with `point.id`) and
  `{segmentId, t}`, so callers that need the width point itself (the editor) and callers that only
  need a hover key (§70) share one geometry pass. `isPointInVectorWidthLabelRect` is the shared
  axis-aligned test.
- **`useVectorWidthLabelEditor.ts`** (`Canvas/VectorWidthLabelEditOverlay/hooks/`) — owns the
  `edit` state, attaches the `dblclick` listener on the canvas only while `activeTool === variableWidth`
  (`useDoubleClickActivation` is hard-gated to default/move, so it can't be reused here), and the
  `commit`/`cancel` callbacks. While an edit is open it writes `refs.vectorWidth.editingWidthLabelRef`,
  which `getVectorWidthLabelTargets` filters on — so the WebGL-drawn badge is suppressed for exactly
  that regulator and you don't see the MSDF pill behind the input.
- **`VectorWidthLabelEditOverlay.tsx`** — mounted in `Canvas.tsx` beside `TextEditOverlay`; thin,
  just `worldToScreen(edit.center)` × zoom → `CanvasValueLabelInput`.
- **`armVectorWidthLabelClick.ts`** — new resolver in the `armVectorWidthPointOnPointerDown` `switch`,
  before the `default:` that clears `selectedVectorWidthHandlesRef`. A single click on the badge
  (which sits *off* the stroke, so it otherwise hit nothing and the label vanished) is now consumed
  and the selection kept, making the label "clickable" and the second click of the dbl-click harmless.

`editingWidthLabelRef` lives on `TVectorWidthRefs` and is cleared in `useSelectionTool.ts`'s
tool-switch cleanup alongside the other width refs. Coverage: unit 100% (component, hook, both utils,
the arm resolver, plus an integration case in `armResolvers.spec.ts`).

## 72. Pen-tool mid-segment split left a stale `filledFaceKeys` entry — §51's piece-identity resolver only covers virtual crossing splits, not a literal new-segment-id split

Live-reported: attaching a fresh Pen stroke to the *middle* of an already-painted triangle's side made
the whole face's fill vanish. §51's piece-identity mechanism is designed exactly for "a segment gets
subdivided out from under a stored key" — but it only covers subdivision via `splitSegmentAtCrossings.ts`
(§44), which keeps the **same real segment id** for every sub-piece (`` `${segment.id}#${index}` ``) so
`getVectorPieceBoundaryKeys.ts` can still group them and walk between two stored boundaries. `splitVectorSegment.ts`
(`Canvas/hooks/useDrawPenTool/utils/handlePointerDown/`) — used whenever a new fragment/segment is started
or closed onto the *middle* of an existing edge (`startVectorFragment.ts`, `continueVectorNetwork/closeLoopOntoEdge.ts`,
`closeLoopOntoAnotherNodeEdge.ts`) — does something different: it keeps the original segment's own id for
the first half but mints a brand-new, unrelated nanoid for the second half. A stored piece key like
`` `${segmentId}[v:${originalStart}|v:${originalEnd}]` `` now names a segment id that only reaches a new
midpoint vertex directly; the far endpoint is a *different* segment id's problem, entirely outside
`getVectorPieceBoundaryKeys`'s same-real-id grouping — `resolvePieceKeyToUnit.ts` can't find a run
containing both boundaries and returns `null`, and `computeLoopPoints.ts`'s `hasEveryUnit` check then
nukes the whole face.

Fixed at the source of the split, not in the resolver: `remapFilledFaceKeysAfterSegmentSplit.ts`
(`utils/canvas/vectorNetwork/`) rewrites any stale piece — one whose boundaries are exactly the original
segment's own two real vertices — into the two real pieces the split just produced (`originalId[v:start|v:new]`
+ `newId[v:new|v:end]`), recomputes that loop's key via `getVectorFillLoopKey`, and carries any
`fillColorOverrideByKey` entry across to the new key. `splitVectorSegment.ts` now returns
`filledFaceKeys`/`fillColorOverrideByKey` alongside `segments`/`vertices`, and all three call sites thread
them into their `updateNode` dispatch (`closeLoopOntoAnotherNodeEdge.ts` splits the *target* node, so its
remapped output merges into the survivor's own maps, fixing a pre-existing gap where the target's
`fillColorOverrideByKey` wasn't merged at all). Scoped deliberately to the one case that actually occurs
here — a piece whose boundaries are two plain real vertices (`v:...`) — not a piece already mid-crossing
(a `x:...` boundary), since a segment reaching this literal record-level split with pre-existing virtual
crossings on it isn't a case this pen-tool path produces today.

Coverage: `remapFilledFaceKeysAfterSegmentSplit.spec.ts` (stale-key rewrite, color carry-over, an
unrelated key left untouched, an already-migrated key left untouched), a `splitVectorSegment.spec.ts` case
exercising the real triangle-side-split scenario end to end (matching pieces as a set, since the new
vertex/segment ids are random nanoids).

## 73. An explicit hole↔parent relationship — the same-color XOR trick made deliberate instead of coincidental

Live-reported, in three parts: (1) painting a face nested inside an already-filled ancestor of the exact
same color correctly read as "cut a hole" (§67's same-color-cancels mechanism, also how a glyph's "o"
gets its counter — a plain solid outer face and a plain solid inner face of one color, XORed by
`drawVectorNode.ts`'s per-color stencil grouping); (2) but the click that produced it was really "add B to
`filledFaceKeys` with whatever `selectPaintColor(state)` the palette currently has" — the hole was a
coincidence of that color happening to equal the ancestor's, not anything tracked; (3) dragging that same
now-filled B into a *different* shape C reproduced the exact same accidental hole whenever C happened to
share that literal color too (overwhelmingly likely in practice, since every new fill defaults to the same
palette swatch) — even though B's fill was never meant to relate to C at all.

**New tracked relationship, not a change to the general color-grouping mechanism.** `TVectorNode` gains
`holeParentByKey?: Record<string, string>` (child loop key → parent loop key). Painting a face already
recognizes its own further-nested unfilled children (§ the A/B nested-paint feature preceding this one,
`getNestedUnfilledLoopKeys`); it now also checks the *other* direction —
`getContainingFilledLoopKey.ts` (`utils/canvas/vectorNetwork/`) finds whether the clicked face itself sits
inside some other already-filled face (smallest of any matching ancestors, for a face nested several
levels deep), reusing the exact same containment heuristic as `getNestedUnfilledLoopKeys` (`getPolygonArea`
strict-larger filter + one `getPointInsideFace` interior point tested via `isPointInPolygonVertices`, not a
full polygon-clip test). When found, `armVectorPaintOnPointerDown.ts` inherits **the parent's own current
color** (not the palette's `selectPaintColor`) and records `holeParentByKey[newLoopKey] = parentKey`.

**Rendering only ever cancels a tracked hole against its own specific parent — never against an unrelated
face of the same literal color.** `groupFilledFacesByColor.ts` is replaced by
`groupFilledFacesForRendering.ts` (`utils/canvas/drawVectorNode/`, same folder, new name since the return
shape changed to `{color, polygons}[]` instead of `Map<color, points[]>` — every caller updated:
`drawVectorNode.ts`, and the three snapshot builders, `captureVectorNode{Drag,Resize,Rotate}Snapshot.ts`).
A face with a `holeParentByKey` entry only joins its parent's own color-keyed render group (so it actually
cancels against it, indistinguishable from §67's original coincidental case) while **all three** of these
still hold, re-checked fresh every render, nothing pre-computed or invalidated eagerly: the parent is still
in `filledFaceKeys` and resolvable, the child is still geometrically nested inside the parent's *current*
polygon (same `getPointInsideFace`/`isPointInPolygonVertices` test), and the child's effective color still
equals the parent's. The moment any one breaks — the child was dragged out of the parent, or either side's
color changed — the child gets its **own, unique** render group (keyed by its loop key, not by color), so
it renders independently with whatever color it currently has instead of silently cancelling against
whatever unrelated face happens to share that hex value now. A plain face with no `holeParentByKey` entry
at all (every glyph counter, every ordinary manually-painted fill) is completely unaffected — still grouped
by literal color exactly as before, which is what keeps §67's original mechanism and every font-outline
face (§ font-outline docs) working unchanged.

**Deliberately single-level.** The active-hole check only looks at one parent hop; a hole nested inside
another hole isn't resolved recursively. Nothing in this feature's actual scope produces that shape yet, so
it's left as a known, called-out limitation rather than over-built ahead of a real case.

Coverage: `getContainingFilledLoopKey.spec.ts` (finds the containing key, null when none contains it, picks
the smallest of several nested ancestors, rejects a same-or-smaller-area candidate), `groupFilledFacesForRendering.spec.ts`
(ordinary same-color merge unchanged, different colors stay separate, an active hole merges into its
parent's group, a hole isolated once no longer nested in its parent, a hole isolated once its parent's
color has drifted), plus an `armResolvers.spec.ts` case asserting the inherited color and the recorded
`holeParentByKey` entry end to end against a real disjoint-cluster A/B fixture.

## 74. "D" (and other multi-contour glyphs whose contours genuinely overlap) rendered as a near-solid
blob — fixed by processing each contour independently and re-joining them via winding-direction hole
detection, not by patching the half-edge walk itself

**Symptom**: flattening the "D" glyph produced one giant face spanning almost the entire glyph bbox, with
two tiny notch-shaped holes right where the bowl's own hole-bridging slit crosses the stem — instead of a
proper stem + a properly-holed bowl. Not font-atlas-specific: reproduced from the real Inter TTF.

**Root cause, confirmed via `opentype.js`'s raw path commands (not this codebase's own pipeline)**: Inter's
"D" is two *separate* subpaths — (1) the bowl, encoded as one continuous path that already correctly cuts
its own counter via an internal keyhole slit, and (2) the stem, a completely separate simple rectangle.
The slit in (1) physically crosses the stem's own left edge at two points — a legitimate, harmless overlap
in the font's own encoding that a real nonzero-winding rasterizer never notices, because it never merges
independent subpaths into one shared graph before rasterizing. This codebase used to merge *every*
contour of a glyph into one shared cluster before deriving faces, turning that harmless overlap into a
real, shared crossing point. Three attempts at patching the half-edge walk itself (dropping the sign
pre-filter, summing all raw candidates' signed areas) were tried and rigorously disproven by grid-sampling
against ground-truth nonzero-winding — confirmed empirically that the standard "always continue via
twin-1" DCEL rule does not, by itself, guarantee a genuinely non-overlapping plane partition once one real
segment is crossed twice by geometry belonging to a second, originally-independent closed contour (unlike
a plain self-crossing within *one* contour, e.g. "x" §72, which that rule already handles correctly).

**Actual fix — process each contour on its own, then re-join with explicit hole detection**:
`getTextFlattenVector.ts` now calls `buildVectorNodeFromEdgeLoops` once *per contour* (never combining a
glyph's own sibling contours before face derivation — each contour's own harmless self-touching or
cross-contour-overlapping geometry is resolved in total isolation), then recombines a glyph's own
already-correct contours via the new `mergeVectorNodeGeometriesWithHoleDetection.ts`. That function
classifies every pair of a glyph's own derived faces (regardless of whether they came from the same
contour, e.g. "R"'s self-crossing bowl, or different contours, e.g. "D"'s stem vs. bowl):

- **Nested + opposite winding direction** → a genuine hole (e.g. "o"'s counter inside its outer ring):
  recorded as an explicit `holeParentByKey` entry, so it cancels via the renderer's existing same-color
  XOR (§73) exactly like a user-painted hole does.
- **Nested or boundary-crossing but *same* winding direction** → not a hole at all, just two independent
  solid regions that happen to share area (e.g. "D"'s stem sitting inside where the bowl's slit crosses
  it, "A"'s crossbar sitting inside the outer silhouette's own already-solid ink) — isolated into its own
  private render group (a dangling, never-resolving `holeParentByKey` key) so it always renders as
  independent ink and can never accidentally XOR-cancel against an unrelated same-colored face.
- **Neither nested nor crossing** → left completely alone (e.g. "x"'s three non-overlapping pieces from
  its own single self-crossing contour).

The winding-direction check is the load-bearing discriminator, not geometric nesting alone: TrueType/
OpenType fonts always encode a counter/hole with the *opposite* winding direction from the solid ink it
cuts from (a hard format convention, not a heuristic) — plain nesting alone wrongly classified "A"'s
crossbar as a hole of the outer silhouette, since both wind the *same* direction and the crossbar is
already just sitting inside solid ink at that height. Containment itself is tested by requiring **every**
vertex of the candidate hole to fall inside the container (`isFullyContained`), not a single "representative
interior point" sample (`getPointInsideFace`) — a thin, elongated shape (e.g. "Q"'s tail, which touches its
ring at one point and extends far outside it) can have that one sampled point land right at the touching
point, giving a false "fully contained" reading. Verified against ~27 real Inter-font characters via a
ground-truth grid-sampling methodology (raw `opentype.js` path commands → hand-computed nonzero-winding,
independent of this codebase's own pipeline), all within 0.0–0.1% mismatch.

## 75. `getVectorFillLoopPoints` non-deterministically lost an entire face on repeated, byte-identical
input — root-caused to a greedy walk reconstructing a self-touching vertex's continuation, fixed by
backtracking instead of guessing

**Symptom, found live**: typing a multi-character string (e.g. the full alphabet, or "men") and repeating
the exact same Flatten call would occasionally render a self-crossing letter ("e", "n", "x") with a chunk
of its own fill missing — non-deterministically, on an otherwise byte-identical rebuild. A 500-iteration
stress test on "men" measured a **31% failure rate** (155/500). Initially suspected to be a cross-glyph
contamination bug (only manifesting with multiple glyphs present) — disproven by the same stress
methodology applied to a *single* glyph in total isolation: "e" alone, 300 iterations, failed **43/300
(14%)** of the time. The bug is purely per-glyph; multi-glyph text just gives more chances to hit it.

**Root cause**: this is a *render-time* bug, not a face-derivation bug — §74's `filledFaceKeys` list
itself is stable. The bug lives in `getVectorFillLoopPoints`/`chainIntoSteps`, which resolves a *stored*
loop key (an unordered, alphabetically-sorted set of piece-key strings, per `getVectorFillLoopKey`) back
into an ordered walk of points for rendering. A self-touching glyph contour (e.g. "e") legitimately visits
one crossing vertex *twice* in its own face boundary — degree 4 there, not the usual degree 2 — so there
are two candidate continuations at that vertex, and the old code (`getNextUnitHalfEdge`) took a single
greedy guess: walk outward from the arriving piece's twin edge and commit to the *first* neighbour
recognized as one of this loop's own units. On the wrong branch, that guess closes the walk back to its
start early, using only some of the loop's units — a shorter, internally self-consistent loop silently
missing the pieces it skipped past, and the old code simply returned `null` for the whole face the moment
that happened, with no way to recover.

The determinism angle: *which* candidate got tried first depended on the real geometric departure angle at
that vertex (correct and stable for a fixed shape) **and** on which unit `chainIntoSteps` started its walk
from — `first = units[0]`, where `units` comes straight from splitting the loop key's own comma-joined,
alphabetically-sorted piece-key string. Piece keys embed real segment/vertex ids, freshly generated via
`nanoid()` on *every* call to `getTextFlattenVector` — so for the exact same glyph shape, the alphabetical
sort order (and so the walk's starting point) was different on every single rebuild, occasionally landing
on a starting point whose first-tried branch happened to be the wrong one.

**Fix**: `chainIntoSteps` now backtracks instead of guessing. `getNextUnitHalfEdgeCandidates` (renamed
from `getNextUnitHalfEdge`) returns *every* recognized candidate at a branch point, still in twin-1
priority order for the common (non-ambiguous) case. `chainIntoSteps` tries them in order, and if a branch
can't be extended into a closed loop using every one of the loop's units exactly once, it undoes that
choice and tries the branch's next candidate — bounded by a fixed search budget to guard against
pathological blowup on arbitrary user-drawn networks, though a genuine branch point is rare (at most one
or two per glyph) so this stays cheap in practice. This is correct by construction rather than by luck of
the id draw: re-verified via the same stress methodology at **0/500** on "men" and **0/300** on "e" alone.
See `getTextFlattenVector.determinism.spec.ts` (now a real, passing test — previously kept as `it.fails`
while this was unresolved) and the synthetic backtracking regression in `chainIntoSteps.spec.ts`.

## 76. "(" and ")" rendered as a spiked, twisted shape instead of a smooth bracket curve — a font-cusp
miter-point collapse with no distance limit

**Symptom**: flattening "(" or ")" alone (no other characters involved — this is unrelated to §75's
multi-glyph non-determinism) produced a shape with a sharp spike shooting out well past the glyph's own
natural bounding box, instead of a smooth crescent. Reproduced with the real Inter TTF; deterministic
(same wrong shape every time, for either character alone).

**Root cause**: `getGlyphEdgeLoops`'s `collapseCuspEdges` (added for a different, earlier fix — collapsing
a short "blunted" straight bridge at a genuine sharp cusp into a single true miter point, computed via
`getMiterPoint`'s line-intersection of the two flanking curves' tangent directions) had no limit on how
far that computed point could land. Both "(" and ")" have exactly this "blunted tip" pattern at their
top and bottom cusps — opentype.js represents each tip as a short (~3.4 unit), near-flat straight segment
between two long, shallow-angle curves — but for this specific glyph, the two flanking tangent lines are
close enough to parallel that their line-intersection lands **tens of units away**, over 10x the length
of the tiny bridge it's meant to replace. `collapseBridgeRun` unconditionally snapped both flanking edges
onto that far-off point, producing the spike. This is the same class of instability
`getPolylineJoinVertices`/`getStrokeJoinPoints` already guard against with `MITER_LIMIT = 4` for real
stroke joins — `getMiterPoint` had no equivalent safety check at all.

**Fix**: `getMiterPoint` now rejects (returns `null`, same as the existing "parallel lines" case) any
computed point farther from the bridge than `MITER_LIMIT` (4) times the bridge's own gap length (the
distance between the two points being bridged) — not the flanking curves' own lengths, which was tried
first and rejected: it let one of "("'s two symmetric tips scrape just under the limit while landing
~10x farther from the bridge than the bridge itself was long, precisely because a short bridge can sit
between arbitrarily long flanking curves with no relationship to how far a *sane* correction should
reach. When rejected, `collapseCuspEdges` simply leaves the original short straight run in place
(a very slightly blunted tip) instead of collapsing it — a safe, visually negligible fallback, verified
against real ground truth: "(" and ")" now render with matching, correct dimensions (mirror images, as
they should be) instead of differing by 30–60%. See `getMiterPoint.spec.ts`'s real-glyph-data regression
and `getTextFlattenVector.determinism.spec.ts`'s bracket-symmetry test.

## Related

[[design-tool-architecture]] — the generic tool-assembly checklist this feature only partially follows
(§1 here explains why). [[canvas-rendering-pipeline]] — the stencil-buffer technique in context, and the
one context-attribute change it needed. [[selection-and-manipulation]] — the resolver-array architecture
Vector Edit Mode extends rather than duplicates. [[design-store-architecture]] — the history middleware
in full, and the two new `TDesignState` fields driving the Pen session.
[[canvas-vector-performance]] — the caching layer sitting in front of §2's face derivation and §36's
stroke tessellation, why every cache here is keyed on the whole node's object reference, and the
still-open cluster-cache plan for many-disconnected-shapes-per-node scenes.
