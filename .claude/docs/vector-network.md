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
};
```

Not a `TBaseNode` (no `x/y/width/height/rotation`) — like `TLineNode`, a point graph doesn't fit a box.
Bounds are derived on demand (`utils/canvas/vectorNetwork/getVectorNodeBounds.ts`, min/max over
`vertices`), exactly mirroring how `getNodeBounds.ts` already special-cases `TLineNode`. No stored
`rotation` either — group rotate/move apply directly to vertex/tangent coordinates (§6).

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
  outline is a no-op there, same as `NodeType.path` — Vector Edit Mode's own handle layer, below, is what
  shows while selected/editing, not a generic box outline).
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

**Live preview** (`penPreviewRef`/`penHoverVertexRef`, `TCanvasRefs`, ref not Redux — pure uncommitted
visuals): `updateVectorPenPreview.ts` recomputes every pointermove — the snap-indicator circle over any
nearby vertex of the network (shown even before an active vertex exists, satisfying "handler podąża za
nim między networkami" within the one active object — cross-*object* connecting is explicitly out of
scope, see §7) and, once there's an active vertex, the rubber-band edge to the cursor, curved via
`tangentFromOffset` if a drag left a pending outgoing tangent. `drawScene/drawPenPreview.ts` renders it;
never touches Vector Network state.

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
- `armVectorEdgeInsertOnPointerDown` — click a segment's stroke away from either endpoint
  (`getVectorEdgeAtPoint.ts`) to split it into two segments at that point. One-shot `updateNode`, no drag
  state. Splitting a curved segment does **not** run proper De Casteljau subdivision (see §7) — the
  original `tangentStart`/`tangentEnd` are kept on the outer ends of the two new segments and the new
  shared vertex gets straight (null) tangents on both sides, a visually-reasonable but not
  curve-exact split.
- Entry without Pen: `useVectorEditOnDoubleClick.ts` mirrors `useTextEditOnDoubleClick.ts`'s shape
  exactly — double-click a `NodeType.vector` node on the Selection tool sets `vectorEditingNodeId`.
- Continuing via Pen from inside Edit Mode falls out for free — `useDrawPenTool` only checks
  `activeTool === pen`, and `vectorEditingNodeId` already persists across the tool switch (§5), so
  pressing `P` again resumes on the existing network with no extra wiring.
- Delete/Backspace (`Canvas/hooks/useDeleteShortcut/`, new — **no generic "Delete removes selected
  node(s))" feature existed anywhere in the app before this**, so this hook covers both: with a vector
  vertex selected, removes it + every incident segment; otherwise deletes the whole selected node(s).
  Lives in `Canvas.tsx`'s own tree (not `useToolbarShortcuts`, which is mounted at `DesignPage` level)
  specifically because it needs `refs.selectedVectorVertexIdsRef`, a `TCanvasRefs` ref inaccessible from
  there — same reasoning that kept `vectorEditingNodeId`/`penActiveVertexId` in Redux instead (§4).

## 7. Explicit scope trims (flagged, not silent)

- **Cross-object connecting/merging is out of scope** (your call, asked directly) — Pen/Vector Edit Mode
  only ever snap to vertices of the one network currently open (`vectorEditingNodeId`), never a
  different object's.
- **Single-vertex selection only** — no shift-multi-select or marquee-select of vertices within a
  network. `selectedVectorVertexIdsRef` holds zero or one id. Move/delete still work per-vertex.
- **No solo resize/rotate handles on a Vector Network** — `getResizeHandleAtPoint.ts`/
  `getRotateHandleAtPoint.ts` exclude `NodeType.vector` from the single-node branch, exactly like
  `NodeType.line` already does, and for the identical reason: a rotated, arbitrary point-cloud has no
  well-defined "local unrotated bounds" to resize against without a stored rotation field, which vertices
  (absolute world coords, like Line's `x1/y1/x2/y2`) don't have. **Group** resize/rotate/move *do* work
  (`getVectorNodeOrigin.ts`/`resizeVectorNode.ts`/`rotateVectorNodeOrigin.ts`/`translateVectorVertices.ts`
  — the group case has none of solo-resize's rotational complexity, since it's a uniform world-space
  scale/rotation with no per-node local-axis projection).
- **No freehand Pencil** — `ToolName.pencil`'s toolbar entry stays exactly as wired before this feature
  (icon/shortcut/cursor only); only the click-based `ToolName.pen` flow is implemented. Freehand would
  need stroke-sampling + curve-fitting, a different algorithm the spec never described.
- **Stroke end caps** — explicitly deferred (asked directly).
- **No "pull a fresh handle out of a corner point" in Vector Edit Mode** — `armVectorHandleOnPointerDown`
  hit-tests via `getVectorHandlePosition`, which returns nothing for a `null` tangent, so there's no
  handle dot to grab on a vertex that was placed as a plain corner (no drag at creation time). Creating
  a *new* curve handle is only possible during Pen-tool drawing (click-drag while placing a point); Edit
  Mode can only reshape a handle that already exists. Figma additionally supports Option/Alt-dragging a
  corner point in edit mode to pull a fresh pair of handles out of it — not implemented here.
- **No standalone "select just an edge, delete only it" interaction** — Vector Edit Mode selects and
  deletes **vertices** (`selectedVectorVertexIdsRef`), not segments in isolation; deleting a vertex
  correctly removes every segment touching it (§6's Delete/Backspace), but there's no way to remove one
  segment while leaving both its endpoint vertices in place as newly-disconnected points. Requirement
  #8's "zaznaczać edge" is only met in the sense that `armVectorEdgeInsertOnPointerDown` hit-tests and
  acts on a clicked edge (to split it) — it doesn't persist a "this edge is selected" UI state the way
  vertex selection does.

## 8. Undo/redo — built as this feature's own foundation

No history mechanism existed anywhere before this (confirmed — ROADMAP Etap 11 was unstarted). See
`design-store-architecture.md` §8 for the full mechanism (`store/history/`); the short version: a
`beginHistoryGesture()`/`endHistoryGesture()` pair wraps `useSelectionTool`'s pointerdown/pointerup
orchestrators (and `useDrawPenTool`'s own pointerdown/pointerup) unconditionally — cheap enough to fire
on every gesture regardless of what it turns out to be, since the middleware only actually pushes a
snapshot the first time an undoable action (`addNode`/`updateNode`/`deleteNode`) fires inside an open
gesture, coalescing an entire drag into one entry.

## Related

[[design-tool-architecture]] — the generic tool-assembly checklist this feature only partially follows
(§1 here explains why). [[canvas-rendering-pipeline]] — the stencil-buffer technique in context, and the
one context-attribute change it needed. [[selection-and-manipulation]] — the resolver-array architecture
Vector Edit Mode extends rather than duplicates. [[design-store-architecture]] — the history middleware
in full, and the two new `TDesignState` fields driving the Pen session.
