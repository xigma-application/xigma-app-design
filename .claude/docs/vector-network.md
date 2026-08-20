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

- **Cross-object connecting/merging is out of scope** (your call, asked directly) — Pen/Vector Edit Mode
  only ever snap to vertices of the one network currently open (`vectorEditingNodeId`), never a
  different object's.
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
  interactive immediately after the tool switch, matching `e2e/pages/design/vector-edit.spec.ts`'s "dragging
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

## 28. Deleting a segment now prunes any endpoint it leaves with zero remaining segments

`handleDeleteSelection.ts`'s vertex-selection branch already recomputed both `vertices` and `segments`
together (`getRemainingSegments`). Its sibling segment-selection branch didn't: it only ever filtered
`node.segments`, so a vertex whose only segment(s) got deleted stayed behind in `node.vertices` forever —
a floating, unselectable-by-normal-means dot with nothing attached (screenshot: an orphaned point sitting
apart from an otherwise-normal two-segment path). Fixed with a new `getRemainingVertices(vertices,
segments)` helper (same reachability check `deleteDanglingActiveVertex.ts` already used for the Pen tool's
single active vertex on Escape, generalized here to every vertex against an arbitrary post-delete
`segments` map) — applied only in the segment-selection branch, deliberately not the vertex-selection one:
deleting a *vertex* explicitly already has its own, separate question of whether to bridge/reconnect its
two neighbors (out of scope here, not asked for), so that branch is left as-is.

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

Covered by `e2e/pages/design/vector-edit.spec.ts` (rows 213-215, `TEST_CASES.md`): a differential
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

## Related

[[design-tool-architecture]] — the generic tool-assembly checklist this feature only partially follows
(§1 here explains why). [[canvas-rendering-pipeline]] — the stencil-buffer technique in context, and the
one context-attribute change it needed. [[selection-and-manipulation]] — the resolver-array architecture
Vector Edit Mode extends rather than duplicates. [[design-store-architecture]] — the history middleware
in full, and the two new `TDesignState` fields driving the Pen session.
