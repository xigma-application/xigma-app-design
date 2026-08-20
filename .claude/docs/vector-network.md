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
   existing vertex just resumes from it (no mutation); blank canvas adds a new, disconnected vertex to
   the same node.
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
- **Single-vertex selection only** — no shift-multi-select or marquee-select of vertices within a
  network. `selectedVectorVertexIdsRef` holds zero or one id. Move/delete still work per-vertex.
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
- **No standalone "select just an edge, delete only it" interaction** — Vector Edit Mode selects and
  deletes **vertices** (`selectedVectorVertexIdsRef`), not segments in isolation; deleting a vertex
  correctly removes every segment touching it (§6's Delete/Backspace), but there's no way to remove one
  segment while leaving both its endpoint vertices in place as newly-disconnected points. Requirement
  #8's "zaznaczać edge" is only met in the sense that the Pen tool's edge hit-testing (§6,
  `getVectorEdgeAtPoint.ts` via `splitVectorSegment.ts`) acts on a clicked edge to split it — it
  doesn't persist a "this edge is selected" UI state the way vertex selection does.

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

## Related

[[design-tool-architecture]] — the generic tool-assembly checklist this feature only partially follows
(§1 here explains why). [[canvas-rendering-pipeline]] — the stencil-buffer technique in context, and the
one context-attribute change it needed. [[selection-and-manipulation]] — the resolver-array architecture
Vector Edit Mode extends rather than duplicates. [[design-store-architecture]] — the history middleware
in full, and the two new `TDesignState` fields driving the Pen session.
