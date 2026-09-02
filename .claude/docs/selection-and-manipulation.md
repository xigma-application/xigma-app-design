# Selection & manipulation

What happens to a node **after** it's drawn: hit-testing, selecting it, moving it, resizing it,
rotating it. The single most complex interactive subsystem in this app — companion to
`design-tool-architecture.md` (how a tool draws a node in the first place).

The roadmap's prose (Etap 5) describes an earlier, simpler shape of this code (one shared
`dragStateRef` with a `pendingClickAction`). That core state machine is still exactly accurate (see
§3), but the file list has grown substantially since Etap 10 added resize/rotate/line-endpoint/
path-text-offset handling as siblings, and since then three corner-radius handle drags joined them
too (Rectangle, §11; Polygon, §12; Star, §15 — the latter two added as *parallel* mechanisms rather
than sharing Rectangle's, since neither ever has a multi-candidate collision to resolve), followed by
two vertex-count handle drags (Polygon/Star, §18 — again parallel mechanisms, not sharing the
corner-radius ones despite the superficial similarity) — eleven separate drag-state refs, not one,
each with its own `arm*`/`continue*`/`disarm*` files, all funneled through three top-level
orchestrators.

## 1. File structure

`Canvas/hooks/useSelectionTool/`:
- `useSelectionTool.ts` — active only when `activeTool === default || activeTool === scale` (the
  **Scale tool fully reuses this hook** — see §5) and text-caret editing isn't active
  (`shouldUseCanvasCaretEditing`). Its own eight refs — `dragStateRef`, `endpointDragRef`,
  `pathOffsetDragRef`, `resizeDragRef`, `rotateDragRef`, `polygonVertexCountDragRef`,
  `starVertexCountDragRef`, `marqueeStartRef` — come from a dedicated
  `hooks/useSelectionToolRefs/useSelectionToolRefs.ts` (mirroring `Canvas`'s own `useCanvasRefs()`,
  `canvas-rendering-pipeline.md` §1: a lazily-initialized `useRef` holding the whole returned object
  so its identity stays stable across renders), typed `TSelectionToolRefs`
  (`types/design/selectionTool/types.ts`, alongside every other selection-tool-local drag-state type
  that file needs — since a type reachable from the global `types/` layer can't reach back into
  `components/`, everything `TSelectionToolRefs` is built from lives there too, not in the feature
  folder). `cornerRadiusDragRef`/`polygonCornerRadiusDragRef`/`starCornerRadiusDragRef`/
  `ellipseArcDragRef`/`ellipseArcRotateDragRef`/`ellipseArcRatioDragRef` (§19) are the odd six out:
  lifted to `useCanvasRefs()` instead and destructured off the shared `refs: TCanvasRefs` object the
  hook receives as its one parameter (same "parent-owned, ref-drilled" shape as
  `marqueeRef`/`hoverRef`/`sliceRef` — see `canvas-rendering-pipeline.md` §2), specifically so
  `useCanvasRenderLoop` can also read them every frame. For the corner-radius three that's §13's
  "mid-drag zero" fix (needs to know whether a drag is *currently* in progress); for the ellipse-arc
  three it's simpler — `drawEllipseArcHandleLayer` reads `draggedHandlePosition` off each ref every
  frame purely so the dragged handle visually follows the live pointer projection instead of jumping
  to wherever the node's Redux state alone would place it (§19). `polygonVertexCountDragRef`/
  `starVertexCountDragRef` (§18) stay in `TSelectionToolRefs` instead, like
  `resizeDragRef`/`rotateDragRef` — they have no such render-time dependency, so nothing downstream
  ever needs to know a vertex-count drag is in progress; the handle's rendered position just reads
  the node's live `sides`/`points` from Redux every frame like anything else. The three native
  `PointerEvent` listeners' own handlers (`onPointerDown`/`onPointerMove`/`onPointerUp`) are hoisted
  out of the `useEffect` body to the hook's own top level, taking `canvas: HTMLCanvasElement` as an
  explicit parameter alongside the two refs objects — only trivial one-line forwarding closures
  (`(event) => onPointerDown(canvas, event, refs, selectionRefs)`) stay inside the effect to bind
  `canvas`, matching the shape every other `Canvas/hooks/*` listener hook already uses
  (`xigma-function-style`'s "don't nest non-trivial logic inside an effect" rule).
- `types.ts` — gone entirely: every type it held (`TDragState`, `TEndpointDragState`,
  `TPathOffsetDragState`, `TResizeDragState`, `TRotateDragState`, `TPolygonVertexCountDragState`,
  `TStarVertexCountDragState`, `TPendingClickAction`, `TLineEndpoint`,
  `TNodeOrigin`/`TResizeNodeOrigin`/`TRotateNodeOrigin`) turned out to be needed by the new
  `TSelectionToolRefs`, directly or transitively, so the whole file moved wholesale to
  `types/design/selectionTool/types.ts`, alongside `TSelectionToolRefs` itself. `TCornerRadiusDragState`,
  `TPolygonCornerRadiusDragState`, `TStarCornerRadiusDragState`, `TEllipseArcDragState`,
  `TEllipseArcRotateDragState`, `TEllipseArcRatioDragState` (§19, all three an identical
  `{ bounds, draggedHandlePosition, flipX, flipY, nodeId, rotation }` shape) live in
  `types/design/canvas/types.ts` instead, alongside `TCanvasRefs`, per the same "grouped with the refs
  object that composes them" rule.
- `handlePointerDown.ts`/`handlePointerMove.ts`/`handlePointerUp.ts` (the three top-level
  orchestrators dispatched to from the hook) take `(canvas, event, dispatch, canvasRefs,
  selectionRefs, setClassName)` — six params total, down from the sprawling one-positional-arg-per-ref
  lists these used to take. `handlePointerMove.ts`/`handlePointerUp.ts` reach directly into
  whichever of the two ref objects each `continue*`/`disarm*` call actually needs (e.g.
  `continueCornerRadiusDrag(..., canvasRefs.cornerRadiusDragRef, ...)`,
  `disarmPathOffsetDrag(..., selectionRefs.pathOffsetDragRef, ...)`) — those deeper `continue*`/
  `disarm*` files themselves are untouched, still taking their one specific ref as an explicit
  parameter exactly as before; only the dispatchers' own boundary absorbed the two grouped objects.
  `handlePointerDown.ts` no longer calls any `arm*` directly at all — see below, it was promoted to
  its own resolver-array pattern, the pointerdown mirror of `useHoverHighlight`'s `resolveHover` (§9).

`utils/handlePointerDown/` — `handlePointerDown.ts` is now a thin orchestrator: it builds one
`TArmContext` (`types.ts` — `canvas`, `event`, `dispatch`, `canvasRefs`, `selectionRefs`,
`setClassName`, `point`, `viewport`, `selectedNodes`, `orderedNodes`, `currentSelection`, and `hit`,
the one whole-node hit-test computed once up front since two later resolvers both need it) and loops
`ARM_RESOLVERS` (`constants.ts`, full priority table in §3) until one returns `true`. Each entry is an
`arm*OnPointerDown` function in `armResolvers.ts` — one hit-test, then the matching lower-level
`arm*Drag` call. The pre-existing lower-level `arm*.ts` files are untouched below that layer:
`armPathOffsetDrag`, `armPolygonVertexCountDrag` (§18), `armStarVertexCountDrag` (§18),
`armEllipseArcDrag`/`armEllipseArcRotateDrag`/`armEllipseArcRatioDrag` (§19), `armResizeDrag`,
`armCornerRadiusDrag` (§11), `armPolygonCornerRadiusDrag` (§12), `armStarCornerRadiusDrag` (§15),
`armRotateDrag`, `armLineEndpointDrag` (→ `armEndpointDrag`), `armHitDrag` (→ `armDrag`),
`armGroupBoundsDrag` (→ `armDrag`), `armMarqueeDrag`. `toggleSelectionOnPointerDown` is the one
resolver with no matching lower-level `arm*Drag` file — shift-click toggling is a synchronous
`dispatch`, nothing to arm.

`utils/handlePointerMove/` — one `continue*.ts` per kind. **All fourteen run unconditionally on every
pointermove** — `handlePointerMove.ts` just calls all fourteen in sequence; each is a no-op guarded by
`if (dragState)` on its own ref, so only the one actually armed does anything: `continueDrag`,
`continueEndpointDrag`, `continuePathOffsetDrag`, `continueResizeDrag/` (its own sub-folder, §5),
`continueRotateDrag`, `continueCornerRadiusDrag` (§11), `continuePolygonCornerRadiusDrag` (§12),
`continueStarCornerRadiusDrag` (§15), `continuePolygonVertexCountDrag` (§18),
`continueStarVertexCountDrag` (§18), `continueEllipseArcDrag`/`continueEllipseArcRotateDrag`/
`continueEllipseArcRatioDrag` (§19), `continueMarqueeDrag`.

`utils/handlePointerUp/` — mirror image, `disarm*.ts` per kind, each clears its own ref and releases
pointer capture: `disarmDrag` (**resolves `pendingClickAction`**, see §3), `disarmEndpointDrag`,
`disarmPathOffsetDrag` (also resets cursor to `'hand'`), `disarmResizeDrag`, `disarmRotateDrag`,
`disarmCornerRadiusDrag`, `disarmPolygonCornerRadiusDrag`, `disarmStarCornerRadiusDrag`,
`disarmPolygonVertexCountDrag` (§18), `disarmStarVertexCountDrag` (§18),
`disarmEllipseArcDrag`/`disarmEllipseArcRotateDrag`/`disarmEllipseArcRatioDrag` (§19),
`disarmMarqueeDrag`.

Loose files directly under `useSelectionTool/utils/`: `isPointInGroupBounds.ts`,
`isPointInSelectedTextBounds.ts`, `toggleSelection.ts`.

**Note**: `getNodeAtPoint.ts` and most per-shape hit-test primitives live one level up, in the
*shared* `Canvas/utils/` — relocated once `useHoverHighlight` needed them too (not just selection).

## 2. Hit-testing

`Canvas/utils/getNodeAtPoint.ts`:
```ts
const getUnrotatedQueryPoint = (point, node) => {
  if (node.type === NodeType.line || node.rotation === 0) return point;
  const bounds = getNodeBounds(node);
  const center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  return rotatePoint(point, center, -node.rotation);
};

export const getNodeAtPoint = (point, nodes, viewport) =>
  [...nodes].reverse().find((node) => {
    const testPoint = getUnrotatedQueryPoint(point, node);
    switch (node.type) {
      case NodeType.ellipse: return isPointInEllipse(testPoint, node);
      case NodeType.polygon: return isPointInPolygon(testPoint, node);
      case NodeType.star:    return isPointInStar(testPoint, node);
      case NodeType.line:    return isPointNearLine(testPoint, node, lineTolerance);
      case NodeType.text:    return node.pathId ? isPointInCurvedText(point, node, pathTextTolerance) : isPointInText(testPoint, node);
      case NodeType.path:    return false;
      default:               return isPointInRect(testPoint, node);
    }
  }) ?? null;
```
Topmost-wins via reversing `selectOrderedNodes` (last-drawn = last in `rootOrder` = topmost). A node
with `hidden`/`locked` set (Layers panel, [[design-store-architecture]]) is skipped outright before
any per-type test runs — same one-line guard added to `getCollidedNodes.ts` (marquee) so a
locked/hidden node can't be acquired that way either. This only gates *acquiring* a node via a canvas
click/marquee; a node already selected through the Layers panel itself can still be dragged/resized.

The real `case NodeType.vector` additionally returns `false` outright for any vector id a text
node's `pathId` currently names — a vector serving as a Text on Path guide is inert as an
independent hit-test target, the same treatment `case NodeType.path` already gets (both computed via
a `nodesById`/`textPathBoundVectorIds` pass built once per call, not per node). See
`design-store-architecture.md`'s text-on-path section for the full vector-as-guide mechanism.

**Rotation is handled uniformly, in one place**: `getNodeAtPoint` rotates the *query point* backward
by `-node.rotation` around the node's own bounds center, then calls the ordinary, rotation-unaware
test function. The test functions themselves never know about rotation. The same trick
(`getUnrotatedQueryPoint`) is reused by `getResizeHandleAtPoint.ts`, `getRotateHandleAtPoint.ts`, and
`continueResizeDrag/getResizeQueryPoint.ts` — one rotation-inversion helper, four call sites.

Per-`NodeType` tests (all `Canvas/utils/`):
- `isPointInRect.ts` — AABB, **rounded-corner-aware**: excludes a point that falls inside the
  bounding box but outside a nonzero `cornerRadius`'s rounded corner (analytic circle test against
  each corner's own arc center, `getMaxCornerRadius`-clamped — no point-list approximation needed
  since a rect corner is always a plain quarter-circle). Used for rectangle/frame/media/default *and*
  reused verbatim by `isPointInGroupBounds.ts`/`isPointInSelectedTextBounds.ts`/the Slice tool's own
  hit-test — safe, since none of those ever pass an object with a `cornerRadius` field, so the
  rounding branch is simply never taken there.
- `isPointInEllipse.ts` — normalized `(x/rx)² + (y/ry)² ≤ 1` for a plain ellipse; ring-and-arc-aware
  once §19's `arcRatio`/cut fields are in play (own sub-cases: outside the outer bound → miss; ring
  with no cut → outer-bound-minus-hole-radius test; fully cut away or `arcRatio` at its max → whole
  outer bound counts as a hit, deliberately broad so an otherwise-invisible node stays click-selectable;
  otherwise a proper point-in-polygon test against the sector/ring-sector vertices, §19).
- `isPointInPolygon.ts` / `isPointInStar.ts` — ray-casting over generated vertices, **flip-aware**:
  calls `flipPoint(point, center, flipX, flipY)` before testing (see §8). Also
  **rounded-corner-aware**: swaps in `getRoundedPolygonPoints`/`getRoundedStarPoints` (the same
  point generators the fill rendering itself uses, §15/§16) instead of the sharp
  `getPolygonPoints`/`getStarPoints` whenever `cornerRadius > 0`, so a click just outside a rounded
  tip correctly misses and a click in a now-filled-in rounded concave notch correctly hits — the
  ray-casting algorithm itself needs no changes, it just needs the right point list fed in.
- `isPointNearLine.ts` — point-to-segment distance ≤ `LINE_HIT_TOLERANCE_PX / zoom`, clamped
  projection.
- `isPointInText.ts` — per-line width/height rect test, flip-aware (`flipTextPoint`).
- `isPointInCurvedText.ts` — text-on-a-path variant (arc-length table + boundary offsets).
- `isPointInSelectedTextBounds.ts` (in `useSelectionTool/utils/`) — "click anywhere in the fixed
  box of the single selected text node, even past its rendered content" — only consulted for
  dragging an already-selected text node, not for initial selection.

**Group/gap hit-testing**, `isPointInGroupBounds.ts`:
```ts
export const isPointInGroupBounds = (point, nodes) => isGroupSelection(nodes) && isPointInRect(point, getSelectionBounds(nodes));
```
`isGroupSelection` = `nodes.length > 1 && haveSameParent(nodes)`. `getSelectionBounds` = combined
AABB over `getRotatedNodeBounds` of every selected node — the shared bbox already accounts for each
member's individual rotation, not just raw bounds.

## 3. Selection state machine — arm on pointerdown, resolve on pointerup

`handlePointerDown.ts` builds one `TArmContext` and loops `ARM_RESOLVERS` (`constants.ts`) until one
returns `true`; the array order **is** the priority table (topmost wins), each entry an
`arm*OnPointerDown` function in `armResolvers.ts` (§1):
```ts
export const ARM_RESOLVERS = [
  armPathOffsetOnPointerDown,
  armPolygonVertexCountOnPointerDown,
  armStarVertexCountOnPointerDown,
  armEllipseArcOnPointerDown,          // §19 Sweep
  armEllipseArcRotateOnPointerDown,    // §19 Start
  armEllipseArcRatioOnPointerDown,     // §19 Ratio
  armResizeOnPointerDown,
  armCornerRadiusOnPointerDown,
  armPolygonCornerRadiusOnPointerDown,
  armStarCornerRadiusOnPointerDown,
  armRotateOnPointerDown,
  armLineEndpointOnPointerDown,        // only if !event.shiftKey
  toggleSelectionOnPointerDown,        // ctx.hit && event.shiftKey
  armHitOnPointerDown,                 // ctx.hit
  armSelectedTextBoundsOnPointerDown,  // !event.shiftKey
  armGroupBoundsOnPointerDown,         // !event.shiftKey
  armMarqueeOnPointerDown,             // !event.shiftKey (always matches if reached)
];
```
```ts
for (const resolve of ARM_RESOLVERS) {
  if (resolve(ctx)) return;
}
```
**Handle priority**: path-offset → **polygon/star vertex-count (§18) → Sweep/Start/Ratio (§19) →
resize** → corner-radius (§11) → polygon corner-radius (§12) → star corner-radius (§15) → rotate →
**line endpoint (only if not shift)** → shift toggle → plain hit → text-fixed-bounds fallback →
group-gap → marquee. `armCornerRadiusOnPointerDown`, `armPolygonCornerRadiusOnPointerDown`, and
`armStarCornerRadiusOnPointerDown` call their `get*CornerRadiusHandleAtPoint(...)` hit-tests
unconditionally, with **no** `resizeHandleHit` gate anywhere in their own bodies — resize still wins
any tie, but purely through `ARM_RESOLVERS`' ordering (`armResizeOnPointerDown` sits earlier in the
array and returns `true`/stops the loop on a match, so these three never even run when resize already
claimed the point), not through an explicit ternary. A node is never more than one of
Rectangle/Polygon/Star at once, so the three hit-tests never actually compete with each other, only
each independently with resize.
`polygonVertexCountHandleHit`/`starVertexCountHandleHit` and all three
`ellipseArcHandleHit`/`ellipseArcRotateHandleHit`/`ellipseArcRatioHandleHit` are the exceptions to
"resize wins any tie": all five resolvers are checked *before* `armResizeOnPointerDown` in
`ARM_RESOLVERS` — for vertex-count, §18's
exact-pixel collision with a resize handle; for the ellipse-arc trio there's no known coincident-pixel
case (a node is never simultaneously Polygon/Star/Ellipse), the earlier ordering is just consistency
with vertex-count rather than a forced fix. Line-endpoint hit-testing is checked *before* the generic
whole-node `hit` branch, which is why grabbing a line's own endpoint always wins over a whole-line
drag even when both technically match the same point.

`armHitDrag.ts` — the collapse-vs-replace decision:
```ts
export const armHitDrag = (canvas, event, dispatch, dragStateRef, hit, currentSelection, selectedNodes, point) => {
  const isPartOfMultiSelection = currentSelection.length > 1 && currentSelection.includes(hit.id);
  if (isPartOfMultiSelection || isPointInGroupBounds(point, selectedNodes)) {
    armDrag(currentSelection, { id: hit.id, kind: 'collapse' }, point, dragStateRef);
  } else {
    dispatch(setSelection([hit.id]));
    armDrag([hit.id], null, point, dragStateRef);
  }
};
```
`armDrag.ts` (shared by `armHitDrag` and `armGroupBoundsDrag`) snapshots each armed node's origin
(`{x1,y1,x2,y2}` for lines, `{x,y}` for boxes) from live `store.getState()`.

**Resolution happens in `disarmDrag.ts`**:
```ts
export const disarmDrag = (canvas, event, dispatch, dragStateRef) => {
  const dragState = dragStateRef.current;
  if (dragState) {
    const { hasMoved, pendingClickAction } = dragState;
    if (pendingClickAction?.kind === 'collapse' && !hasMoved) dispatch(setSelection([pendingClickAction.id]));
    else if (pendingClickAction?.kind === 'deselect' && !hasMoved) dispatch(setSelection([]));
    dragStateRef.current = null;
  }
};
```
`continueDrag.ts` sets `hasMoved = true` unconditionally on the first move. Full decision tree:

| Scenario | Arm site | `pendingClickAction` | Resolved by |
|---|---|---|---|
| click unselected node | `armHitDrag` else-branch | `null` | dispatch already happened on pointerdown; disarm is a no-op |
| shift+click add/remove | inline in `handlePointerDown` | n/a | synchronous, no drag state involved at all |
| click node in 2+ selection, **no move** → collapse | `armHitDrag` if-branch | `{kind:'collapse', id}` | `disarmDrag` dispatches `setSelection([id])` iff `!hasMoved` |
| click+**drag** node in 2+ selection → group moves, selection kept | same arm | same | `continueDrag` sets `hasMoved=true`, so `disarmDrag`'s guard skips the collapse |
| click in gap, **no move** → deselect all | `armGroupBoundsDrag` | `{kind:'deselect'}` | `disarmDrag` dispatches `setSelection([])` iff `!hasMoved` |
| click+**drag** in gap → group moves, selection kept | same arm | same | same guard skips the deselect |
| click empty canvas → clear + arm marquee | `armMarqueeDrag` | n/a (`marqueeStartRef`, not `dragStateRef`) | `setSelection([])` fires immediately at arm time, before any drag resolves |

**e2e coverage gap worth knowing**: no e2e test exercises this collapse/deselect/gap-drag matrix
directly — it's unit-test-only (`useSelectionTool.spec.tsx`, ~30 `it` blocks enumerating exactly
these scenarios by name). e2e coverage for this subsystem is weighted toward resize/rotate/mirror
pixel-correctness instead (see §10).

## 4. Marquee selection

`armMarqueeDrag.ts`: `dispatch(setSelection([])); marqueeStartRef.current = point;` — clearing
happens immediately at arm time.

`continueMarqueeDrag.ts` — **live dispatch on every move**, not just on release:
```ts
export const continueMarqueeDrag = (canvas, event, dispatch, marqueeStartRef, marqueeRef) => {
  if (marqueeStartRef.current) {
    const rect = toDraftRect(marqueeStartRef.current, point);
    const collidedNodes = getCollidedNodes(selectOrderedNodes(state), rect, isControlPressed(event));
    marqueeRef.current = rect;                                   // ref — pure rendering
    dispatch(setSelection(collidedNodes.map(({ id }) => id)));   // redux — every move
  }
};
```
`getCollidedNodes.ts`:
```ts
export const getCollidedNodes = (nodes, area, requireFullyInside) =>
  nodes.filter((node) => {
    const bounds = getRotatedNodeBounds(node);
    return requireFullyInside
      ? area.x <= bounds.x && area.x + area.width >= bounds.x + bounds.width && /* same for y */
      : !(bounds.x + bounds.width < area.x || bounds.x > area.x + area.width || /* same for y */);
  });
```
`requireFullyInside` = `isControlPressed(event)` read **fresh on every pointermove** — Control can
be toggled mid-drag and the result updates live. Uses `getRotatedNodeBounds` (true rotated AABB), not
raw bounds, so a rotated node's marquee collision is accurate. `disarmMarqueeDrag.ts` just clears the
refs — no further dispatch, selection is already final from the last `continueMarqueeDrag` call.

## 5. Resize — and how the Scale tool shares it entirely

`continueResizeDrag/continueResizeDrag.ts` is the **single entry point for both** the plain Selection
tool's resize handles and the Scale tool:
```ts
const isScaleTool = selectActiveTool(store.getState()) === ToolName.scale;
const point = getResizeQueryPoint(rawPoint, bounds, singleBoxOrigin);
const { anchors, scaleX, scaleY } = getResizeOrScaleFactors(isScaleTool, handle, bounds, point, aspectRatio, event.shiftKey);
const rotatedAnchorSolver = getResizeAnchorSolver(bounds, handle, scaleX, scaleY, singleBoxOrigin);
originEntries.forEach(([id, origin]) => resizeNode(id, origin, dispatch, anchors, scaleX, scaleY, Boolean(singleBoxOrigin), rotatedAnchorSolver));
```
`isScaleTool` only swaps which factor-computation function runs
(`getResizeOrScaleFactors.ts`: `isScaleTool ? getScaleFactors(...) : getResizeFactors(...)`) —
everything downstream (anchor solving, per-node application) is identical code for both tools.

**Anchor convention**: `getResizeAxisAnchors.ts`'s `HANDLE_AXES` maps each of the 8 handles to
`{x, y}` of `'min' | 'max' | 'none'` (edge handles get `'none'` on their perpendicular axis — that
axis simply isn't touched by a plain resize).

**Mirror-past-anchor** (`computeResizedRect.ts`, shared with draw tools) — crossing the anchor flips
which side the box grows on instead of clamping in place:
```ts
const resizeAxis = (originStart, originSize, pointCoord, edge) => {
  if (edge === 'none') return { size: originSize, start: originStart };
  const anchorCoord = edge === 'max' ? originStart : originStart + originSize;
  const delta = pointCoord - anchorCoord;
  const size = Math.max(MIN_SHAPE_SIZE, Math.abs(delta));
  return { size, start: delta >= 0 ? anchorCoord : anchorCoord - size };
};
```
`getSignedScale.ts` converts old/new bounds into a signed scale factor relative to the anchor
(negative once mirrored) — this signed value is what drives the flip-toggle in §8.

**Plain resize** (`getResizeFactors.ts`): `anchors.{x|y}` is `null` on an edge handle's untouched
axis — no Shift-lock possible on a single axis, deliberately (roadmap: "świadomie bez locka na
krawędziach"). Shift applies `getAspectRatioLockedRect` only on corner handles, which have real
anchors on both axes.

**Scale tool** (`getScaleFactors.ts` → `getScaleBounds.ts`) always derives both dimensions from
`aspectRatio`, **regardless of Shift** (the function has no `shiftKey` parameter at all):
```ts
export const getScaleBounds = (handle, bounds, point, aspectRatio) => {
  const anchor = getScaleAxisAnchors(handle, bounds);   // edge handles get a CENTER anchor on their "none" axis, unlike plain resize
  const widthDrivesSize = Math.abs(point.x - anchor.x) >= aspectRatio * Math.abs(point.y - anchor.y);
  const width = widthDrivesSize ? Math.abs(point.x - anchor.x) : Math.abs(point.y - anchor.y) * aspectRatio;
  const height = widthDrivesSize ? width / aspectRatio : Math.abs(point.y - anchor.y);
  // ...
};
```
`getScaleAxisAnchors.ts` gives an edge handle a *center* anchor (`start + size/2`) on its untouched
axis instead of `null` — so dragging an edge with Scale active still proportionally scales both
dimensions around the shape's center, confirming "edge handles are also locked" for Scale, unlike
plain resize where edges have no locking mechanism at all.

**Per-node-type application** (`resizeNode/resizeNode.ts` branches only line-vs-box):
- `resizeLineNode.ts` — `x1/y1/x2/y2` each transform independently:
  `transformCoord(coord, anchor, scale) = anchor + (coord - anchor) * scale`.
- `resizeBoxNode.ts` — `axisScale` via `getResizeAxisScale.ts`, new position via
  `getResizedPosition.ts` (uses the rotated anchor solver when present), final `changes` via
  `getResizeChanges.ts` (flip XOR, §8).

**Rotated-node resize** — the trickiest math, `getRotatedAnchorSolver.ts`:
```ts
export const getRotatedAnchorSolver = (bounds, handle, rotation, scaleX, scaleY) => {
  const oldCenter = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const { x: signX, y: signY } = /* 'max' → -1, 'min' → 1, 'none' → 0, per axis */;
  const oldOffset = rotatePoint({ x: (signX * bounds.width) / 2, y: (signY * bounds.height) / 2 }, ORIGIN, rotation);
  const anchorWorldPoint = { x: oldCenter.x + oldOffset.x, y: oldCenter.y + oldOffset.y };
  // once a drag crosses the anchor, the anchor corner sits on the OPPOSITE side of the new
  // (mirrored) local box — the sign locating it must flip for whichever axis crossed
  const crossedSignX = signX * Math.sign(scaleX);
  const crossedSignY = signY * Math.sign(scaleY);
  return (width, height) => {
    const newOffset = rotatePoint({ x: (crossedSignX * width) / 2, y: (crossedSignY * height) / 2 }, ORIGIN, rotation);
    return { x: anchorWorldPoint.x - newOffset.x - width / 2, y: anchorWorldPoint.y - newOffset.y - height / 2 };
  };
};
```
And the axis-swap threshold, `isRotationAxisSwapped.ts` (a hard 45° threshold — this replaced an
earlier trig-blend formula that's now fully gone from the codebase):
```ts
export const isRotationAxisSwapped = (rotation) => Math.abs(Math.sin((rotation * Math.PI) / 180)) > Math.abs(Math.cos((rotation * Math.PI) / 180));
export const getRotatedAxisScales = (scaleX, scaleY, rotation) =>
  isRotationAxisSwapped(rotation) ? { x: Math.abs(scaleY), y: Math.abs(scaleX) } : { x: Math.abs(scaleX), y: Math.abs(scaleY) };
```
**Single-node vs. group distinction**: for a single *rotated* node, the query point is pre-rotated
into the node's own local space before any math runs (`getResizeQueryPoint.ts`), so the resulting
`scaleX`/`scaleY` are already local — applying `getRotatedAxisScales` again would double-transform,
hence a plain `Math.abs()` for that branch (`getResizeAxisScale.ts`'s `isSingleBoxOrigin` flag). For
a group, the query point stays in world space and each member's own `rotation` re-projects the
group's world-space scale onto that member's own axes individually.

## 6. Rotation

`armRotateDrag.ts` snapshots pivot (bounds center), each node's `rotation`/box (or line endpoints),
`startAngle = getAngleBetweenPoints(pivot, point)`, initial `cursorAngle`.

`continueRotateDrag.ts` — full logic:
```ts
const deltaDegrees = getAngleBetweenPoints(pivot, point) - startAngle;
canvas.style.cursor = getRotatedRotateCursorUrl(cursorAngle + deltaDegrees) ?? canvas.style.cursor;
Object.entries(nodeOrigins).forEach(([id, origin]) => {
  if ('x1' in origin) {
    const a = rotatePoint({ x: origin.x1, y: origin.y1 }, pivot, deltaDegrees);
    const b = rotatePoint({ x: origin.x2, y: origin.y2 }, pivot, deltaDegrees);
    dispatch(updateNode({ changes: { x1: round(a.x), x2: round(b.x), y1: round(a.y), y2: round(b.y) }, id }));
    return;
  }
  const newCenter = rotatePoint({ x: origin.x + origin.width / 2, y: origin.y + origin.height / 2 }, pivot, deltaDegrees);
  dispatch(updateNode({ changes: { rotation: round2dp(origin.rotation + deltaDegrees), x: newCenter.x - origin.width / 2, y: newCenter.y - origin.height / 2 }, id }));
});
```
Delta is always `currentAngle - startAngle` (from drag start, not absolute cursor angle), applied to
both (a) the node's own `rotation` and (b) its center orbiting the shared `pivot`. **No special-case
for single vs. group** — for a single node, `pivot === that node's own center`, so `rotatePoint` on
the center is a no-op and only `rotation` changes; the same formula handles both cases. **No angle
snapping** (no 15°/45° snap logic anywhere) — confirmed genuinely absent, not just undocumented.
Lines have no `rotation` field and only ever rotate via the group-orbit path on their endpoints.
Cursor angle is recomputed every `pointermove` (`cursorAngle + deltaDegrees`), not fixed at arm-time.

Rotation interacts with resize entirely through §5's rotated-node math
(`getRotatedAnchorSolver`/`getRotatedAxisScales`/`isRotationAxisSwapped`/`getUnrotatedQueryPoint`) —
there's no separate "rotated resize" code path, just these functions being consulted.

## 7. Line endpoint dragging

`getLineEndpointAtPoint.ts` — only applies when the line is the **sole** selected node (a group
selection never exposes endpoint handles):
```ts
export const getLineEndpointAtPoint = (point, selectedNodes, viewport) => {
  const [node] = selectedNodes;
  if (selectedNodes.length === 1 && node.type === NodeType.line) {
    const radius = LINE_ENDPOINT_HANDLE_HIT_RADIUS_PX / viewport.zoom;
    if (Math.hypot(point.x - node.x1, point.y - node.y1) <= radius) return { endpoint: 'a', nodeId: node.id };
    if (Math.hypot(point.x - node.x2, point.y - node.y2) <= radius) return { endpoint: 'b', nodeId: node.id };
  }
  return null;
};
```
Checked *before* the generic whole-node `hit` resolver in §3's `ARM_RESOLVERS` — this is why clicking
near a line's tip grabs the endpoint handle instead of starting a whole-line drag, even though the
line's own tolerance-based hit-test (`isPointNearLine`) would also match that point.
`continueEndpointDrag.ts` writes the raw world point straight to `x1/y1` or `x2/y2` — **not
delta-based**, unlike a whole-node drag — so dragging endpoint A never touches B and vice versa.

## 8. Flip/mirror

`flipX`/`flipY` (required booleans) exist only on `TMediaNode`, `TTextNode`, `TPolygonNode`,
`TStarNode` — Rectangle/Ellipse/Frame don't need them (visually symmetric either way).

`armResizeDrag.ts` snapshots `flip: isFlippableNode(node) ? { x: node.flipX, y: node.flipY } : null`
at drag start. The XOR toggle, `resizeNode/getResizeChanges.ts`:
```ts
const flipSign = isSingleBoxOrigin ? { x: scaleX, y: scaleY } : getRotatedAxisSigns(scaleX, scaleY, origin.rotation);
return origin.flip
  ? { flipX: origin.flip.x !== flipSign.x < 0, flipY: origin.flip.y !== flipSign.y < 0, height, width, x, y }
  : { height, width, x, y };
```
`flipSign.x < 0` = "has this drag's signed scale crossed to the negative side". XOR-ing against the
flip state **at drag start** means reversing the cursor back across the anchor within the same
gesture correctly un-flips, rather than accumulating.

Render/hit-test layers apply the flip via reversing the query point, not by storing pre-flipped
geometry: `utils/math/flipPoint.ts` (generic mirror around a center) is used by
`isPointInPolygon.ts`/`isPointInStar.ts` before testing against the canonical unflipped vertex list;
`utils/canvas/text/flipTextPoint.ts`/`flipGlyphVertices.ts` are the text-specific equivalents
(`isPointInText.ts` calls `flipTextPoint` first; glyph rendering does a full mesh mirror around the
node center). Media flips via UV-coordinate flipping in `drawImage.ts` instead of geometry.

## 9. Cursor feedback

One shared primitive, `utils/canvas/createCursorRotator.ts` — lazily loads a cursor image, draws it
rotated onto an offscreen canvas per requested angle, caches the resulting data-URL per angle, and
returns `url(${dataUrl}) 16 16, auto`. Three factories built on it:
`getRotatedResizeCursorUrl.ts` (plain resize), `getRotatedRotateCursorUrl.ts`,
`getRotatedScaleCursorUrl.ts` (a visually distinct cursor specifically for Scale's resize handles).

Angle inputs: `utils/math/getResizeCursorAngle.ts` (per-handle base angle + node `rotation` — `e`/`w`
→ `rotation`, `n`/`s` → `90 + rotation`, `ne`/`sw` → `-45 + rotation`, `nw`/`se` → `45 + rotation`)
and `getRotateCursorAngle.ts` (quadrant-based on cursor position relative to the node center, rotated
into local space first).

`useHoverHighlight.ts` is where hover-without-drag cursor updates happen — a `pointermove` listener
guarded by `event.buttons === 0` (inert mid-drag), delegating to `resolveHover.ts`
(`utils/resolveHover/`), the exact same resolver-array pattern as §3's `handlePointerDown`/
`ARM_RESOLVERS`: it builds one `THoverResolverContext`, then loops `HOVER_RESOLVERS`
(`constants.ts`) — each entry a pure `resolveXHover(ctx): THoverResult | undefined` in
`hoverResolvers.ts` — until one returns a `{ className, cursor, nodeId }` result, which is then
applied in one place via `setHoverState(canvas, hoverRef, setClassName, ...)`. Same order as
`handlePointerDown`'s hit-test priority (line endpoint → path-offset handle → editing-text caret →
vertex-count → Sweep/Start/Ratio (§19, all three `className: 'radius'`, same class as corner-radius)
→ resize handle → corner-radius → rotate handle → default node hover), plus one final resolver,
`resolvePlainNodeHover`, that has no gate at all and always returns a result — the plain-node-hover
fallback, which is *why* the loop never needs a separate post-loop branch: the last entry is
guaranteed to match. The Scale-vs-plain-resize cursor swap is decided in `resolveResizeHover`:
```ts
export const resolveResizeHover = ({ resizeHandleHit, activeTool }: THoverResolverContext): THoverResult | undefined => {
  if (resizeHandleHit) {
    const getCursorUrl = activeTool === ToolName.scale ? getRotatedScaleCursorUrl : getRotatedResizeCursorUrl;
    const cursor = getCursorUrl(getResizeCursorAngle(resizeHandleHit.handle, resizeHandleHit.rotation)) ?? '';
    return { className: null, cursor, nodeId: null };
  }
};
```
`hoverRef` (a ref — pure rendering concern) is set by `setHoverState` on *every* resolved case, not
just the fallback — each `THoverResult` carries its own `nodeId` (the node's own id for a
radius/vertices/hand handle, `null` for resize/rotate, `hit?.id ?? null` for plain hover);
`drawHoverOutline.ts` reads it to draw the hover outline without corner handles, separately from
`drawSelectionOutline.ts`.

**Gotcha — stale hover after a drag ends without a further `pointermove`**: the `event.buttons === 0`
guard above is correct for its own purpose (don't flicker hover onto other nodes while, say, dragging
a node across them), but it means hover is *frozen* at whatever it was when the drag started for the
drag's entire duration. Nothing re-evaluated it once the drag ended — releasing outside the hovered
shape (e.g. a corner-radius handle dragged past the shape's own edge, per §16/§17's handles) left the
hover outline/handle showing the stale pre-drag state indefinitely if the pointer didn't move again
afterward. Fixed by also registering the exact same handler on `pointerup`, not just `pointermove`:
pointer capture (`setPointerCapture` on every `arm*Drag`) guarantees `pointerup` still fires on the
canvas even with the cursor now physically outside the shape, and a primary-button `pointerup` always
carries `event.buttons === 0`, so the existing guard lets it through with no other change needed. This
is general — it fixes stale hover after *any* drag (resize, rotate, move, corner-radius), not just the
corner-radius case that surfaced it.

## 10. Test conventions

Unit: a real `<canvas>` (`getBoundingClientRect` stubbed, `setPointerCapture` stubbed with
`vi.fn()`), real `new PointerEvent(...)` dispatched directly into the handler functions (or through
the mounted hook in `useSelectionTool.spec.tsx`), asserted against `store.getState()`. Every
`arm*`/`continue*`/`disarm*` file and every math helper
(`getResizeFactors`/`getScaleFactors`/`getRotatedAxis*`/`isRotationAxisSwapped`/`transformCoord`/
`getSignedScale`/`resizeNode`/...) has its own `test/*.spec.ts` sibling, 100%-coverage granularity —
including the resolver files themselves: `armResolvers.spec.ts` (one `describe` block per
`arm*OnPointerDown`, §3) and `hoverResolvers.spec.ts`/`resolveHover.spec.ts` (§9), each calling the
resolver functions directly with a plain `TArmContext`/`THoverResolverContext` object rather than
going through the full hook, even though the pre-existing `handlePointerDown.spec.ts`/
`useHoverHighlight.spec.tsx` integration suites already exercise every branch at 100% on their own —
the dedicated resolver specs pin each function's own contract (its return value) independent of the
surrounding orchestrator wiring.
`useSelectionTool.spec.tsx` (~30 `it` blocks) is effectively the canonical enumeration of the state
machine in §3 — good source list if re-deriving the decision tree from scratch.

e2e (`e2e/design/`):
- `selection.spec.ts` — shift-click, Escape-deselects, multi-selection-not-replaced-until-release,
  survives-pan/zoom, marquee live-select + persists + touch-vs-Control, text hit past/within bounds.
- `resize.spec.ts` — rotated cursor per handle, corner-anchors-opposite-corner, Shift aspect-lock,
  mirror-past-anchor (generic + media UV + text glyph + polygon + star), rotated-single-node
  local-axis resize + mirror.
- `rotate.spec.ts` — rotate cursor distinct from resize, drag visibly spins node, cursor updates live
  mid-drag, rotated node hit-tests correctly at its rotated position (incl. its own resize handles),
  group rotation orbits shared center.
- `scale-tool.spec.ts` — `K` activates Scale (shared button state with default/hand), distinct cursor
  vs. plain resize, edge handle scales both dimensions proportionally (unlike plain resize).
- `line-drag.spec.ts` — whole-line drag moves both endpoints; endpoint A/B independence.
- `corner-radius.spec.ts` (§11, §12, §15) — Rectangle handles render only when selected+hovered;
  pure-left and pure-down drags each independently drive the radius to max. Same visibility check
  plus a toward-center drag and an overshoot-then-back drag for both the Polygon and the Star handle.
- `vertex-count.spec.ts` (§18) — same selected+hovered visibility check for the Polygon/Star
  vertex-count handle; a drag toward the corner-radius handle's vertex increases `sides`/`points`;
  crossing the vertical axis resets to the minimum; a flipped shape's handle stays attached at its
  physically-flipped position (the exact regression class from §17, re-tested here since this handle
  follows the same forward-flip/un-flip pattern independently).
- `ellipse-arc.spec.ts` (§19) — dragging Sweep cuts a wedge; dragging Start shows the `radius` cursor
  and actually rotates the cut (the literal wiring bug §19 describes); dragging Ratio hollows a ring
  even on an uncut ellipse; dragging Ratio into the cut-away gap swaps which side is filled versus
  the identical drag distance into the fill (the inversion feature, §19's `getEffectiveArcAngles`).
- `layers-panel.spec.ts` — locking a node from the Layers panel keeps it rendered but makes a canvas
  click/marquee unable to acquire it; hiding one removes it from rendering and hit-testing entirely
  (canvas screenshots clipped to `canvasSafeArea()`, since a plain `canvas.screenshot()` also captures
  the LeftPanel overlay drawn on top of it, which changes when the panel expands).

As noted in §3, the pending-click-action collapse/deselect/gap-drag matrix has **no** e2e coverage —
that correctness relies entirely on the unit suite; e2e here is weighted toward resize/rotate/mirror
pixel-correctness instead.

## 11. Corner-radius handles (Rectangle)

Four handles, one per corner, that round a Rectangle's corners (`TRectangleNode.cornerRadius?:
number`, optional — same "add a field, default `?? 0` at every read site" pattern as the Arrow
tool's `startPoint`/`endPoint`). Canvas-drag-only for now; a side-panel numeric input is a deliberately
separate, later feature. Math lives in `utils/canvas/cornerRadius/`, generic over `bounds`/`corner`
rather than `NodeType.rectangle` specifically, so wiring up a second shape later is "widen
`hasCornerRadius.ts` + add a render/hit-test case," not new mechanism:
- `getMaxCornerRadius.ts` — `min(width, height) / 2`.
- `getCornerRadiusFromPoint.ts` — absolute-position-based (like `continueEndpointDrag.ts`, not
  delta-accumulated): `radius = max(leftward/rightward inset, up/down inset)` per corner, so either
  axis alone can drive it to max without diagonal movement.
- `getCornerRadiusHandlePositions.ts` — at `cornerRadius > 0`, insets by the radius itself (clamped
  defensively to `getMaxCornerRadius`, in case a stored value ever overshoots). At `cornerRadius ===
  0`, uses a "zero-state" screen-space gap that shrinks as you zoom in past 100% (floor
  `MIN_RADIUS_HANDLE_GAP_PX`, so it never re-collides with the resize handle's own hit circle) and
  is pinned flat at `ZERO_RADIUS_HANDLE_OFFSET_PX` as you zoom out past 100% (so it never grows
  unboundedly toward the shape's center at extreme zoom-out either).
- `shouldShowCornerRadiusHandles.ts` — hides the handles entirely (render **and** hit-test) once
  `min(width, height) * zoom` drops below `MIN_ELEMENT_SCREEN_SIZE_FOR_RADIUS_HANDLES_PX`,
  independent of the current `cornerRadius` value — matches Figma's own "too small on screen, not
  worth showing" cutoff.
- `resolveCornerFromDirection.ts` — see the collision case below.

**Rendering**: `drawRect/` (its own folder, mirroring `useSelectionTool/useSelectionTool.ts`'s
"folder named after its main file" convention) — `drawRect.ts` is a pure dispatcher
(`if (cornerRadius) drawRoundedRect(...) else drawStandardRect(...)`), `drawRoundedRect.ts` fans a
`getRoundedRectPoints.ts`-generated perimeter (quarter-circle arcs per corner, `shapes/` folder,
same shape as `getEllipsePoints.ts`) the same way `drawEllipse.ts` fans its own points, and
`drawStandardRect.ts` is the original flat 2-triangle quad, byte-for-byte unchanged so the
long-established plain-rect rendering path (used by ~15 unrelated callers — marquee, resize
handles, hover/selection outlines, draft shapes...) never even sees the `cornerRadius` field.
`drawCornerRadiusHandlesLayer.ts` (in `drawScene/`, alongside `drawHoverOutline.ts`) gates the 4
small-circle handles on `selectedNodes.length === 1 && hoveredNode?.id === selectedNode.id &&
hasCornerRadius(...) && shouldShowCornerRadiusHandles(...)` — unlike the resize corner *squares*,
which render on selection alone regardless of hover.

**Handle collision** (several corners' handles landing on/near the same point once `cornerRadius`
nears `getMaxCornerRadius` — guaranteed exact convergence for a square, a coincident *pair* for a
non-square rect since the shorter dimension's insets meet first): `getCornerRadiusHandleAtPoint.ts`
returns every corner within hit tolerance as a `corners: TCornerRadiusHandle[]` candidate list, not
just the first match. `armCornerRadiusDrag.ts` leaves `TCornerRadiusDragState.corner` as `null` when
there's more than one candidate; `continueCornerRadiusDrag.ts` resolves it on the drag's first real
movement via `resolveCornerFromDirection.ts` — each corner's own *quadrant* direction relative to
the shape center (nw = up-left, se = down-right, etc. — the exact **opposite** sign of the direction
that would grow that corner's own radius in `getCornerRadiusFromPoint.ts`; moving toward a corner's
own resting position shrinks it, moving away grows it), scored via dot product against the move
delta, highest score wins. A tie (e.g. a purely-horizontal move against a pair that only differs
vertically) intentionally resolves to `null` again — stays unresolved until a more decisive move
comes in, rather than guessing. Once resolved, `corner` is written back onto the live drag-state
object and reused for the rest of the gesture, never re-resolved.

`continueCornerRadiusDrag.ts` also re-clamps *after* `Math.round`, not just before
(`Math.min(Math.round(radius), getMaxCornerRadius(bounds))`) — rounding a value already clamped to
a fractional max (e.g. `50.5` on a 101px side) can round it up past that max (`51`); re-clamping
after lands exactly on the fractional max instead, matching Figma.

## 12. Corner-radius handle (Polygon)

**Exactly one** handle, at the polygon's fixed top vertex (`getPolygonPoints` always places vertex
index 0 at the apex, `-90°`, regardless of `sides`/aspect ratio) — dragging it sets one shared
`cornerRadius` (`TPolygonNode.cornerRadius?: number`, same optional-field pattern as Rectangle's)
applied to every vertex identically. Unlike Rectangle's 4 independent-looking corners, there's no
multi-candidate collision to ever resolve, so this is wired as a **parallel** mechanism to
Rectangle's rather than sharing it (same reasoning as Line's endpoint-drag being its own mechanism
instead of shoehorned into resize) — its own drag-state shape
(`TPolygonCornerRadiusDragState = { bounds, nodeId, rotation, sides }`, no `corner`/`candidates`
field since there's nothing to disambiguate). Unlike Rectangle, Polygon's `arm*`/`continue*`/`disarm*`
trio is **not** independently implemented: `armPolygonCornerRadiusDrag.ts` is a one-line call into
`armSimpleDrag.ts` (`handlePointerDown/`, generic `<T>(canvas, event, dragRef, state)` — just sets
the ref and captures the pointer) with the polygon-shaped state object; `disarmPolygonCornerRadiusDrag.ts`
is the same one-line pattern against `disarmSimpleDrag.ts`. `continuePolygonCornerRadiusDrag.ts`
supplies `continueShapeCornerRadiusDrag.ts` (`handlePointerMove/`, generic over
`{ bounds, flipX, flipY, hasMoved, nodeId, rotation }` plus a `getVertices`/`getMaxRadius` callback
pair) with `getPolygonPoints`/`getMaxPolygonCornerRadius`; Star's equivalent (§15) supplies
`getStarPoints`/`getMaxStarCornerRadius` to the same generic function — this is what actually removed
the Polygon/Star duplication `getVertexAngles.ts` et al. already generalized on the math side, one
layer up in the call stack.

Polygon-specific math lives in `utils/canvas/cornerRadius/polygon/`, a sibling to the Rectangle math
folder — but as of the Star feature (§15), the actual vertex-angle/tangent-arc/handle-setback math
underneath it moved out to shape-agnostic locations shared by *both* Polygon and Star (Rectangle
still doesn't share, since its 90°-corner math is a simpler special case not worth generalizing):
- `utils/math/getVertexAngles.ts` (moved from this folder's old `getPolygonVertexAngles.ts`) — the
  *unsigned* interior angle at each vertex (`Math.acos(dot/mags)` of the two adjacent edge vectors,
  always in `[0, π]`). Works unmodified for concave/reflex vertices too (a star's inner points, §15)
  because the angle-bisector direction — computed downstream, not here — flips on its own from the
  vertex geometry; no convex/concave branch needed anywhere in this chain.
- `utils/canvas/cornerRadius/getMaxCornerRadiusForVertices.ts` — at a vertex with (unsigned) angle
  `θ`, a tangent arc of radius `r` touches each adjacent edge at distance `r / tan(θ/2)` from the
  vertex; for a shared edge between vertex `i` and `i+1`, the max radius before their two tangent
  points cross is `edgeLength / (cot(θᵢ/2) + cot(θᵢ₊₁/2))`. The shape's true max is the minimum of
  that across every edge — verified against Figma's own reference numbers for Polygon (100×100
  triangle caps at 25, 100×100 hexagon caps at 43.3), and collapses to the exact apothem formula
  `R·cos(π/sides)` for a regular polygon in a square bounding box. `getMaxPolygonCornerRadius.ts` /
  `getMaxStarCornerRadius.ts` are thin per-shape wrappers that just supply the vertex list.
- `utils/canvas/cornerRadius/getCornerRadiusHandleSetbackMultiplier.ts` —
  `1 / sin(vertexAngle / 2)`. **This is not the radius itself** — see the dedicated gotcha in §16;
  do not "simplify" a handle-position formula back to using `cornerRadius` directly without reading
  that section first.
- `getPolygonCornerRadiusHandlePosition.ts` — a thin wrapper: builds `vertices`/`center`/`maxRadius`
  from `bounds`/`sides`, then hands them to `getCornerRadiusHandlePositionFromVertices.ts` (one
  folder up, in the shared `cornerRadius/` root — not `polygon/`), the shape-agnostic function
  Star's own wrapper (§15) also calls. That shared function
  computes from the top vertex (local/unflipped/unrotated space), moves toward the bounding-box
  center by `cornerRadius * setbackMultiplier` world units (§16, same zero-state zoom-aware offset
  formula as Rectangle's `getCornerRadiusHandlePositions.ts` —
  `ZERO_RADIUS_HANDLE_OFFSET_PX`/`MIN_RADIUS_HANDLE_GAP_PX`, zero-state ceiling `maxRadius *
  setbackMultiplier` rather than `maxRadius` alone since it's compared against a setback distance,
  not a raw radius), then applies `flipPoint` to the final local position before returning (§17) —
  it does **not** ignore `flipX`/`flipY`; that final flip is exactly what §17's gotcha fixed.
- `hasPolygonCornerRadius.ts` — `node.type === NodeType.polygon`, its own guard rather than widening
  `hasCornerRadius.ts` — the two shapes' render/handle-position functions are entirely different
  downstream, and a shared guard would just invite a caller to (wrongly) treat them interchangeably.

**Rendering**: `getRoundedPolygonPoints.ts` (`utils/canvas/shapes/`, alongside
`getRoundedRectPoints.ts`) generates, per vertex, the tangent-arc points via that vertex's own angle
bisector, joined by the implied straight edges between vertices — same "arcs + implied joins" shape
as the rect version, generalized to arbitrary per-vertex angles. `utils/canvas/drawPolygon/` mirrors
`drawRect/`'s split exactly (dispatcher + `drawStandardPolygon.ts` + `drawRoundedPolygon.ts`, see
`canvas-rendering-pipeline.md` §8). `drawPolygonCornerRadiusHandle.ts` draws the single small circle,
gated by the same `hasPolygonCornerRadius(...) && shouldShowCornerRadiusHandles(...)` condition as
Rectangle's 4-handle draw, both folded into one shared `selectedNodes.length === 1 &&
hoveredNode?.id === selectedNode.id` guard inside `drawCornerRadiusHandlesLayer.ts` so the check and
the `bounds`/`shouldShowCornerRadiusHandles` computation aren't duplicated per shape.

**Dragging**: `continuePolygonCornerRadiusDrag.ts` is absolute-position-based like Rectangle's own
(not delta-accumulated) but simpler — no candidate resolution step, since there's only ever one
handle. It projects the current unrotated pointer position onto the fixed vertex→center axis (dot
product against the normalized `towardCenter` vector), clamps to `[0, getMaxPolygonCornerRadius]`,
rounds (re-clamping after rounding, same fractional-max-overshoot fix as Rectangle's), and dispatches
`updateNode({ changes: { cornerRadius } })`. "Toward center increases, away decreases" falls out of
the projection itself with no explicit direction check needed.

`getPolygonCornerRadiusHandleAtPoint.ts` lives in the shared `Canvas/utils/` (like
`getCornerRadiusHandleAtPoint.ts`, per §1's note), not inside `handlePointerDown/`, since it's reused
by both `handlePointerDown.ts` and `useHoverHighlight.ts` — the latter wraps it in its own small
`getPolygonCornerRadiusHandleHit.ts` (`useHoverHighlight/utils/`) to keep the
`resizeHandleHit ? null : ...` gating out of the hook body itself, following this repo's "named
helper over inline closure" convention.

## 13. Mid-drag render fix — don't snap to the zero-state offset while still dragging

Both §11 and §12's handle-position functions have a **zero-state fallback**: at `cornerRadius === 0`
the handle renders at a fixed screen-space offset from the corner/vertex, purely so it stays
grabbable, instead of collapsing onto the corner itself where it'd be nearly impossible to click.
That fallback is correct *at rest*, but it used to fire mid-drag too — dragging a handle down toward
`cornerRadius === 0` made it visibly snap out to the zero-state offset the instant the dispatched
radius hit exactly 0, even though the pointer was still held down right at the corner. Confusing:
the handle jumps away from the cursor that's still dragging it.

The fix threads an `isDraggingCornerRadius` boolean into the fallback so it's suppressed while a drag
is actually in progress (radius stays literal, including `0`, tracking the pointer at the corner/
vertex) and only re-applies once the drag ends. Getting that boolean to the render layer required
lifting `cornerRadiusDragRef`/`polygonCornerRadiusDragRef` out of `useSelectionTool.ts` (previously
private `useRef`s, invisible outside the hook) up to parent ownership, so the *same* ref objects
reach both `useSelectionTool` (which still arms/disarms them exactly as before —
`armCornerRadiusDrag.ts` et al. are unchanged) and `useCanvasRenderLoop` — the same "parent-owned,
ref-drilled" shape already used for `marqueeRef`/`hoverRef`/`sliceRef` (`canvas-rendering-pipeline.md`
§2), just applied to refs that used to be selection-tool-private (a third, `starCornerRadiusDragRef`,
joined the same way once Star's handle was added, §15). Parent ownership now means
`Canvas/hooks/useCanvasRefs/useCanvasRefs.ts` — it creates all of these refs and returns them as one
`TCanvasRefs` object; `Canvas.tsx` calls it once and passes the resulting `refs` object into every
hook, so `useSelectionTool`/`useCanvasRenderLoop` each receive it as their one shared parameter
rather than as separate positional refs (`useSelectionTool` additionally gets its own
`useSelectionToolRefs()`-sourced `selectionRefs` for the refs private to it, §1 — the corner-radius
trio lives in `TCanvasRefs`, not there, precisely because the render loop needs to see it too). From
there the flag is a plain dereference-and-OR, computed once inside `drawScene.ts` itself rather than
in `startRenderLoop.ts`'s `tick` (its own file, `drawScene/hasCornerRadiusDragMoved.ts`, since it's a
three-ref OR rather than a one-line dereference like `hoverRef`'s):

```
useCanvasRefs(): creates cornerRadiusDragRef/polygonCornerRadiusDragRef/starCornerRadiusDragRef (+ the rest of TCanvasRefs)
Canvas.tsx: const refs = useCanvasRefs()
  → useSelectionTool(refs)  // arms/disarms cornerRadiusDragRef/polygonCornerRadiusDragRef/starCornerRadiusDragRef off refs, exactly as before — no behavior change here
  → useCanvasRenderLoop(refs)  // forwards refs, untouched, all the way down to drawScene
      → startRenderLoop's tick(gl, program, buffer, imageContext, canvas, frameIdRef, refs) → drawScene(gl, program, buffer, imageContext, canvas, refs)
          isDraggingCornerRadius = hasCornerRadiusDragMoved(refs) =
            Boolean(refs.cornerRadiusDragRef.current?.hasMoved) || Boolean(refs.polygonCornerRadiusDragRef.current?.hasMoved) || Boolean(refs.starCornerRadiusDragRef.current?.hasMoved)
          → drawCornerRadiusHandlesLayer(..., isDraggingCornerRadius)
            → drawCornerRadiusHandles(...) / drawPolygonCornerRadiusHandle(...) / drawStarCornerRadiusHandle(...) (each also given isDraggingCornerRadius)
              → getCornerRadiusHandlePositions(..., isDragging) / getPolygonCornerRadiusHandlePosition(..., isDragging) / getStarCornerRadiusHandlePosition(..., isDragging)
                  effectiveSetback = cornerRadius > 0 || isDragging ? literalRadius(·setbackMultiplier for Polygon/Star, §16) : zeroStateOffset
```

`isDraggingCornerRadius` defaults to `false`/`undefined` at every layer, so every existing call site
(hit-testing via `getCornerRadiusHandleAtPoint.ts`/`getPolygonCornerRadiusHandleAtPoint.ts`, which
must keep seeing the zero-state offset since that's the position a fresh click needs to land on) is
unaffected — only the render path opts into the new parameter.

## 14. Hiding the handle when a small radius collides with the corner on screen

A *nonzero* radius has an edge case the zero-state fallback doesn't cover: at rest, `cornerRadius >
0` renders the handle at `radius` **world** units from the corner/vertex — a fixed world-space
offset that doesn't shrink or grow with zoom — while the handle's own rendered circle stays a
constant **screen**-space size regardless of zoom (by design, so it's always equally easy to grab).
Zooming out shrinks the *screen-space gap* between those two fixed points (world offset × shrinking
zoom) without ever shrinking the handle's own on-screen size, so at a small enough radius and a far
enough zoom-out, the handle visually overlaps the corner (and whatever resize handle sits there)
even though the shape itself may still be comfortably above `shouldShowCornerRadiusHandles.ts`'s
existing shape-size cutoff.

`shouldShowCornerRadiusHandles.ts` now takes `cornerRadius` and `isDragging` too, and gates on
**both** the existing shape-size check and a new
`cornerRadius * viewport.zoom >= MIN_RADIUS_HANDLE_GAP_PX` check — reusing the exact same floor
`getCornerRadiusHandlePositions.ts`'s zero-state offset already clamps to, since it's the same
"minimum usable screen gap" concept. Two deliberate exemptions: `cornerRadius === 0` always passes
(the zero-state offset already guarantees a visible gap by construction — this rule only needs to
catch the *nonzero-but-tiny* case the zero-state path doesn't cover), and `isDragging` always passes
(per §13, a drag in progress always tracks the literal position; hiding the handle out from under an
actively-dragging pointer would be worse than the overlap it prevents at rest). Both hit-testing and
rendering read the same gate — `getCornerRadiusHandleAtPoint.ts`/`getPolygonCornerRadiusHandleAtPoint.ts`
pass `isDragging` implicitly `false` (hit-testing never runs mid-drag), so a hidden handle is also
ungrabbable, not just invisible; a fresh click in that state falls through to whatever's underneath
(resize handle, plain node hit) exactly as if the shape had no corner radius at all.

`drawCornerRadiusHandlesLayer.ts` computes `bounds`/`cornerRadius`/`canShowHandles` **once**, before
branching, then dispatches on shape type via `switch (true) { case !canShowHandles: ...; case
hasCornerRadius(selectedNode): ...; case hasPolygonCornerRadius(selectedNode): ...; case
hasStarCornerRadius(selectedNode): ... }` — a `hasAnyCornerRadius` type guard (the `||` of all three
`has*CornerRadius` checks) narrows `selectedNode` up front so `selectedNode.cornerRadius` is valid
in every branch without each one re-narrowing independently. There's deliberately **no `default`
arm**: `hasAnyCornerRadius` already guarantees one of the three shape cases matches, so a `default`
would be dead code no test could ever reach — v8's 100%-coverage gate treats an unreachable `default:
break` as a real uncovered line, and ESLint's `default-case` rule wants one anyway, so the switch
carries a targeted `// eslint-disable-next-line default-case` immediately above it explaining why.

## 15. Corner-radius handle (Star)

Structurally identical to §12's Polygon mechanism — same single top-vertex handle
(`getStarPoints`'s vertex index 0 is always the top outer tip, `-90°`), same one shared
`cornerRadius` (`TStarNode.cornerRadius?: number`) applied to every vertex, same
`armStarCornerRadiusDrag`/`continueStarCornerRadiusDrag`/`disarmStarCornerRadiusDrag` trio built the
same way on top of the shared `armSimpleDrag`/`continueShapeCornerRadiusDrag`/`disarmSimpleDrag`
helpers (§12), just supplying `getStarPoints`/`getMaxStarCornerRadius` instead of Polygon's
equivalents, and `TStarCornerRadiusDragState = { bounds, nodeId, points, ratio, rotation }`
drag-state shape, same
`hasStarCornerRadius.ts` guard, same `getStarCornerRadiusHandleAtPoint.ts` (`Canvas/utils/`) +
`getStarCornerRadiusHandleHit.ts` (`useHoverHighlight/utils/`) split. The one substantive difference
from Polygon is geometric, not mechanical: a star's vertices alternate outer (convex, sharp tips) and
inner (concave, the notches between points) — and this is the case that proves §12's shared math
(`utils/math/getVertexAngles.ts`, `getMaxCornerRadiusForVertices.ts`, `getRoundedVertexPoints.ts`,
`getCornerRadiusHandleSetbackMultiplier.ts`) is genuinely shape-agnostic rather than
Polygon-specific-with-Star-reusing-it-by-luck: every one of those functions works on inner vertices
completely unmodified, because they only ever consume the *unsigned* angle between the two adjacent
edge vectors and let the tangent-arc bisector direction fall out of that vector math on its own — at
a concave vertex the bisector naturally points *outward* (away from center, into the notch) instead
of inward, which is exactly the direction a concave corner needs to round correctly, with zero
convex/concave branching anywhere in the chain. `getRoundedStarPoints.ts` (thin wrapper around
`getRoundedVertexPoints`, mirroring `getRoundedPolygonPoints.ts`) and `utils/canvas/drawStar/`
(dispatcher + `drawStandardStar.ts` + `drawRoundedStar.ts`, same split as `drawPolygon/`/`drawRect/`)
are the only genuinely star-specific files in the render path.

## 16. Gotcha — the corner-radius handle sits at the rounding arc's *center*, not the vertex offset by `cornerRadius`

Easy mistake, made twice in this codebase's history before being caught: it's tempting to move the
Polygon/Star handle toward center by the literal `cornerRadius` value (as §12 used to claim, and as a
since-corrected first attempt at generalizing it to non-90° vertices did too) — but that is *not*
where Rectangle's own handle sits, and Rectangle is the reference behavior every other shape's handle
is supposed to match. Rectangle's `getCornerRadiusHandlePositions.ts` places each handle at
`bounds.corner ± effectiveRadius` on **both** axes — i.e. at distance `radius·√2` from the actual
90° corner, which is the rounding arc's own **center**, not a point on the arc's boundary and not the
raw radius distance either. Generalized to an arbitrary vertex angle `θ`, that center sits
`radius / sin(θ/2)` from the vertex along the bisector — for a 90° corner, `sin(45°) = 1/√2`, so
`radius / sin(45°) = radius·√2`, confirming the two formulas agree exactly at the case that's easiest
to eyeball. `getCornerRadiusHandleSetbackMultiplier.ts` is that `1 / sin(θ/2)` factor; a first attempt
at this fix used `1/sin(θ/2) − 1` instead (the distance from the vertex to the arc's *nearest
boundary point*, not its center) — visually near-indistinguishable from "no offset at all" at small
radii, which is exactly the bug report that prompted rediscovering the correct formula: the handle
looked stuck on the shape's outline instead of floating clear of it the way Figma's (and Rectangle's
own) handle does. If a future change to either Polygon's or Star's handle-position math ever looks
like it should just use `cornerRadius` directly again, it's almost certainly reintroducing this same
bug — reread this section first.

## 17. Gotcha — the corner-radius handle math must flip forward, and the drag math must un-flip, or the handle detaches from a mirrored shape entirely

Another shipped-and-fixed bug, same family as §16 but orthogonal to it: `getPolygonCornerRadiusHandlePosition.ts`/`getStarCornerRadiusHandlePosition.ts` compute everything — `topVertex`, `towardCenter`, the setback — in **local/unflipped** space (`getPolygonPoints`/`getStarPoints` never apply `flipX`/`flipY`, same as the fill-rendering point generators before §12's rounding fix). The render path (`drawRoundedPolygon.ts` et al.) always applies `flipPoint(point, center, flipX, flipY)` to its point list before drawing, but the handle-position functions didn't — so a flipped Polygon/Star rendered its actual (correctly flipped) fill in one place while the handle stayed at the pre-flip location, nowhere near the visible shape. Fixed by flipping the *final computed position* forward, mirroring the fill path exactly:
```ts
const localPosition = { x: topVertex.x + towardCenter.x * effectiveSetback, y: ... };
return flipPoint(localPosition, center, flipX, flipY);
```
`flipX`/`flipY` are threaded in from the node (`drawCornerRadiusHandlesLayer.ts` passes `selectedNode.flipX/flipY`; `getPolygonCornerRadiusHandleAtPoint.ts`/`getStarCornerRadiusHandleAtPoint.ts` pass `node.flipX/flipY` and also return them in the hit-test result so `armPolygonCornerRadiusDrag.ts`/`armStarCornerRadiusDrag.ts` can store them on `TPolygonCornerRadiusDragState`/`TStarCornerRadiusDragState`, per §1/§13's ref-lifting pattern).

The drag math needs the **inverse** of that same transform, not a copy of the forward one: `continuePolygonCornerRadiusDrag.ts`/`continueStarCornerRadiusDrag.ts` already un-rotate the raw pointer via `getUnrotatedQueryPoint` (physical → un-rotated, still flipped), but must additionally un-flip it — `flipPoint` is self-inverse, so the same call that flips local→physical also un-flips physical→local:
```ts
const unrotatedPoint = getUnrotatedQueryPoint(rawPoint, bounds, rotation);
const point = flipPoint(unrotatedPoint, center, flipX, flipY); // now back in local space
```
only then is `point` safe to project onto the (local-space) `towardCenter` vector. This is the exact same forward/inverse pairing `isPointInPolygon.ts`/`isPointInStar.ts` already use for hit-testing the shape itself (flip the *query point* back to local space, test against unflipped vertices) — worth remembering as the general pattern any future flip-aware geometry on Polygon/Star should follow, rather than re-deriving it per feature.

`getCornerRadiusHandleEffectiveSetback.ts` (`utils/canvas/cornerRadius/`) was also extracted in the same change: the `cornerRadius > 0 || isDragging ? ... : ...` branch (§13's zero-state/isDragging logic) was duplicated verbatim across Rectangle's `getCornerRadiusHandlePositions.ts` (with an implicit setback multiplier of 1, since Rectangle's handle inset equals `cornerRadius` directly) and both Polygon/Star's position functions — now all three call the one shared function.

## 18. Vertex-count handles (Polygon, Star)

A second single-handle drag on Polygon/Star, alongside corner-radius (§12/§15) — but a deliberately
**separate, parallel mechanism**, not a variant of it: it sets `sides`/`points` instead of
`cornerRadius`, sits at a different vertex with no setback at all, and uses genuinely different
math (angle-snapping, not a projection onto a fixed axis). Math lives in `utils/canvas/vertexCount/`,
a sibling to `utils/canvas/cornerRadius/`.

**Which vertex, and why not the literal "next" one for Star**: Polygon's handle sits at
`getPolygonPoints(bounds, sides)[1]` — literally the vertex right after the corner-radius handle's
vertex 0. Star's does **not** follow the same "index+1" rule, even though that was the first
instinct — `getStarPoints` alternates outer (spike tip, convex) / inner (concave notch between
spikes) vertices, so index 1 is an *inner* vertex. A vertex-count handle sitting on the concave notch
reads as a completely different control (it looks like a spikiness/ratio handle, not a "how many
points" handle), so Star's handle is pinned to **index 2** instead — the next *outer* spike tip,
skipping the notch. Both `getPolygonVertexCountHandlePosition.ts` / `getStarVertexCountHandlePosition.ts`
apply the same forward-`flipPoint` treatment as the corner-radius position functions (§17) — compute
in local/unflipped space, flip the final point forward — since this is exactly the same "handle
must physically track a mirrored shape" problem, independently re-solved for this handle rather than
shared code, to keep the two mechanisms fully decoupled.

Unlike corner-radius, there is **no zero-state**: at `cornerRadius === 0` the handle sits exactly at
the raw vertex, no `ZERO_RADIUS_HANDLE_OFFSET_PX`-style minimum gap logic — "trzyma się czubka
wierzchołka" was an explicit, deliberate requirement for the un-rounded case. This is also why the
drag-state types (`TPolygonVertexCountDragState`/`TStarVertexCountDragState`, both just
`{ bounds, flipX, flipY, nodeId, rotation }`) carry no `hasMoved` flag, unlike all three corner-radius
drag states — §13's "mid-drag zero-state relocation" bug has no equivalent here, since there's no
zero-state position to snap away from. Consequently `polygonVertexCountDragRef`/
`starVertexCountDragRef` also never needed lifting out to `Canvas.tsx` (§1) — nothing downstream
needs an `isDragging` flag, so they stay ordinary hook-private refs.

**Gotcha, shipped-and-fixed — the handle must track corner-radius rounding too, and *not* via §16's
`towardCenter` shortcut**: originally believed to need "no setback at all" (the claim this section
used to make), but a rounded Polygon/Star visibly detaches its vertex-count handle from the now-curved
outline if the handle stays pinned to the pre-rounding sharp vertex. Fixed via a shared
`getVertexCountHandlePositionFromVertices.ts` (`utils/canvas/vertexCount/`, called by both
`getPolygonVertexCountHandlePosition.ts`/`getStarVertexCountHandlePosition.ts`) using the *same*
`radius * (setbackMultiplier - 1)` distance as §16/§17's corner-radius handle (one radius closer to
the vertex than the arc's own center, since this handle should sit *on* the rounded silhouette, not
at the arc's center) — but two details that don't carry over from §16/§17 without breaking:
- **Direction must be the true two-edge bisector, not `towardCenter`.** §16/§17's corner-radius
  handle only ever sits at vertex 0, which is always on the shape's own vertical symmetry axis by
  construction (`getPolygonPoints`/`getStarPoints`'s angle formula) — so "vertex-to-shape-center" and
  "true bisector of the two adjacent edges" coincide there, hiding the fact that they're different
  approximations. The vertex-count handle sits off-axis (index 1 / index 2), where they don't
  coincide — using `towardCenter` there sends the handle to a visibly wrong spot once cornerRadius is
  applied. Fix: compute the bisector from the handle vertex's own immediate array neighbors
  (`normalize(toPrevious) + normalize(toNext)`, then re-normalized), exactly mirroring
  `getRoundedVertexPoints.ts`'s own tangent-arc bisector — verified to land bit-identical to that
  render function's own near-vertex arc point.
- **For Star specifically, "immediate array neighbors" means the two adjacent *inner* (concave)
  vertices, not the neighboring outer tips.** A tempting-looking alternative — treat the star's outer
  tips as their own virtual `getPolygonPoints(bounds, points)` N-gon (numerically identical vertex
  positions to the star's own outer subsequence) and take index±1 within *that* — computes a much
  wider, gentler angle than the tip's true two-edge angle, so it barely offsets the handle at all for
  a many-point star, again detaching it from the actual (more tightly rounded) rendered silhouette.
  The star's own `getStarPoints` array (immediate index±1, landing on the concave inner vertices) is
  the only one that reproduces the true render.
- **Must clamp to this vertex's own `getMaxPolygonCornerRadius`/`getMaxStarCornerRadius`, exactly
  like the corner-radius handle's `Math.min(cornerRadius, maxRadius)`.** Without it, a `cornerRadius`
  that's valid for the shape's *current* `sides`/`points` becomes progressively over-max as the
  vertex-count handle itself is dragged to a higher count — a star's own max radius shrinks with more
  points (tighter concave notches) while the same fixed radius's implied offset simultaneously *grows*
  (sharper tip angle), so an un-clamped offset overshoots further at every step, eventually sending
  the handle flying toward or past the shape's own center. The corner-radius handle itself never hits
  this, since it only reads whatever `cornerRadius` the *current* shape already has — this handle
  uniquely needs to stay correct across a `sides`/`points` value the stored `cornerRadius` was never
  re-validated against.

Same de-duplication as §12's corner-radius trio: `armPolygonVertexCountDrag.ts`/`armStarVertexCountDrag.ts`
are one-line calls into a generic `armVertexCountDrag.ts` (`handlePointerDown/`, takes
`{ bounds, nodeId, rotation, flipX, flipY }` positionally rather than a full state object, since
unlike `armSimpleDrag` there's no per-shape extra field to carry); `disarmPolygonVertexCountDrag.ts`/
`disarmStarVertexCountDrag.ts` go through the same `disarmSimpleDrag.ts` corner-radius already uses.
`continuePolygonVertexCountDrag.ts`/`continueStarVertexCountDrag.ts` supply a generic
`continueVertexCountDrag.ts` (`handlePointerMove/`) with `POLYGON_MIN_SIDES`/`POLYGON_MAX_SIDES` (or
Star's `STAR_MIN_POINTS`/`STAR_MAX_POINTS`) and a `'sides' | 'points'` field discriminator telling it
which key to write on `updateNode`'s `changes`.

**Visibility/hit-testing**: `shouldShowVertexCountHandle.ts` reuses corner-radius's screen-size floor
(`MIN_ELEMENT_SCREEN_SIZE_FOR_RADIUS_HANDLES_PX`) but drops the `cornerRadius`/`isDragging`-driven gap
check entirely (§14) — there's no analogous "radius value" here to collide on. `getPolygonVertexCountHandleAtPoint.ts`/
`getStarVertexCountHandleAtPoint.ts` (`Canvas/utils/`) guard on `node.type` directly rather than a
`has*CornerRadius`-style predicate, since `sides`/`points` are required fields on their node types
(unlike `cornerRadius`, which is optional everywhere) — there's no "does this shape even have the
property" question to ask.

**The count-selection algorithm — nearest-angle snapping, not a distance/easing curve**:
`getVertexCountFromLocalPoint.ts` was rewritten twice before landing here (worth knowing if it looks
like it should have a simpler distance-based shape — it did, twice, and both were wrong):

1. First attempt projected the pointer onto the vertex→center axis and mapped that distance through
   an easing curve (`sqrt`, then a quadratic ease-out) into a count. Both failed for the same
   underlying reason: cramming 58 discrete states into one shape's own (usually tens-of-pixels) local
   geometry makes *any* concave easing curve feel broken near the rest position — a curve step small
   enough to avoid a huge initial jump was still too fine-grained to feel controllable.
2. The actual mechanism (confirmed against real Figma behavior) is **nearest-angle snapping**: each
   candidate count `n ∈ [min, max]` has a fixed target angle `getVertexAngle(n) = 2π/n − π/2` (the
   same formula `getPolygonPoints`/`getStarPoints` use internally for vertex 1 — for Star, vertex
   index `2`'s angle reduces to the identical `2π/points − π/2` shape, which is *why* Star's handle
   math needs no `ratio` at all, see below). Given the pointer's local angle `θ = atan2(localY, localX)`,
   the function just scans `[min, max]` for the `n` minimizing `|θ − getVertexAngle(n)|`. The switch
   threshold between `n` and `n+1` falls out for free at the angle-space midpoint between their two
   target angles — not at `n+1`'s own angle — which is the exact "midpoint of the two positions"
   behavior real Figma has and a naive "reached the target" implementation would get wrong.
3. **Reset condition**: `localX <= 0` (pointer crossed the vertical axis through the shape's local
   center) forces `min`, checked *before* the angle scan. This isn't a special case of the
   angle-nearest logic — all candidate angles live strictly in `(−90°, 90°)` (since `sides`/`points`
   is finite, the target angle for `max` never actually reaches the corner-radius handle's own −90°),
   so a pointer past the axis would otherwise just keep snapping to whichever extreme candidate angle
   is nearest, never resetting. The explicit guard is what makes "drag past center → back to
   minimum" a real, sharp reset instead of Just Happening to fall out of the geometry.

**Star doesn't need `ratio` for this at all** — a design detail that had to be *un*-added after the
fact: the drag-state types originally carried `ratio` (mirroring `TStarCornerRadiusDragState`,
where it's genuinely load-bearing for the radius math), and `armStarVertexCountDrag`/
`getStarVertexCountHandleAtPoint`'s hit result threaded it through — until the angle-snapping
rewrite made it clear the target angle for an *outer* vertex (index 2) never depends on the
inner-radius ratio at all. `ratio` was then removed from `TStarVertexCountDragState`,
`armStarVertexCountDrag`, and the hit-test's returned shape — it only remains (correctly) in
`getStarVertexCountHandlePosition.ts`/`getStarVertexCountHandleAtPoint.ts`/`drawStarVertexCountHandle.ts`,
which still call `getStarPoints(bounds, points, ratio)` and only read index 2 out of the result — that
call still needs a `ratio` argument to satisfy `getStarPoints`'s signature even though the specific
extracted point is provably unaffected by its value, which is why it's still there in those three
files and *not* vestigial-looking evidence of a missed cleanup.

**Gotcha — this is the one place resize does *not* win a tie**: for a regular 4-sided Polygon,
`getVertexAngle(4) = 0°`, which puts the vertex-count handle at the bounding box's exact east
edge-midpoint — precisely where the resize tool's own "e" edge handle sits. Every other overlapping
handle resolves in resize's favor by sitting later in `ARM_RESOLVERS`/`HOVER_RESOLVERS` (§3, §9), but
doing that here would make the vertex-count handle permanently unclickable at exactly `sides === 4`.
Fixed by computing `polygonVertexCountHandleHit`/`starVertexCountHandleHit` **unconditionally** (no
resize gate) and placing `armPolygonVertexCountOnPointerDown`/`armStarVertexCountOnPointerDown` and
`resolvePolygonVertexHover`/`resolveStarVertexHover` *before* the resize resolver in both
`ARM_RESOLVERS` and `HOVER_RESOLVERS` (§3, §9) — the vertex-count handle now wins any coincidental
overlap with resize, the one deliberate exception to "resize wins ties" in this whole subsystem.
`useHoverHighlight.ts` no longer needs the small `getPolygonVertexCountHandleHit.ts`/
`getStarVertexCountHandleHit.ts` wrapper files that existed briefly during development purely to keep
a `resizeHandleHit ? null : ...` gate out of the hook body (§12's convention) — once that gate was
removed, the wrappers added nothing, so the hook calls `getPolygonVertexCountHandleAtPoint`/
`getStarVertexCountHandleAtPoint` directly instead.

**Rendering**: `drawPolygonVertexCountHandle.ts`/`drawStarVertexCountHandle.ts` (`utils/canvas/`,
siblings to the corner-radius draw files) — same white-circle-via-`drawEllipse` shape, same
`RADIUS_HANDLE_SIZE`/`RADIUS_HANDLE_FILL`/`RADIUS_HANDLE_HIT_RADIUS_PX` constants reused rather than
duplicated (the two handles are meant to look and feel identical at rest, only their position and
drag behavior differ). `drawVertexCountHandlesLayer.ts` (`drawScene/`, a sibling to
`drawCornerRadiusHandlesLayer.ts`, called right after it in `drawScene.ts`) gates on
`selectedNodes.length === 1 && hoveredNode?.id === selectedNode.id && (type === polygon || star)`,
then `shouldShowVertexCountHandle`, then dispatches by node type — deliberately a **separate** layer
function rather than folded into `drawCornerRadiusHandlesLayer.ts`, even though the gating looks
almost identical, again to keep the two mechanisms decoupled rather than sharing a switch that would
otherwise need to know about both `cornerRadius` and `sides`/`points` at once.

**Cursor**: `vertices.png` (`assets/icons/cursors/`) — was already present in the repo, unused, before
this feature; wired up via a new `&--vertices` block in `canvas.module.scss` (`setClassName('vertices')`
in `useHoverHighlight.ts`), identical in shape to the existing `&--radius` block.

**Constants**: `POLYGON_MIN_SIDES`/`POLYGON_MAX_SIDES` (3/60, `Canvas/constants.ts`) are new; Star
reuses the pre-existing `STAR_MIN_POINTS`/`STAR_MAX_POINTS` (already 3/60, added earlier but
previously unenforced anywhere — this feature is the first thing that actually reads them). Both
pairs are intended for a future side-panel numeric input, not just this drag handle — same "canvas
drag now, panel later" split as corner-radius (§11).

## 19. Ellipse arc-cutting handles (Sweep, Start, Ratio)

Three handles on a selected+hovered Ellipse, matching Figma's own Arc tool one-for-one: **Sweep**
(`arcEndAngle`, on the perimeter) drags a cut into the shape. **Start** (`arcStartAngle`, also on the
perimeter — distinguished from Sweep only by a small dot drawn inside it, `withDot` param on
`drawEllipseArcHandle.ts`, `RADIUS_HANDLE_DOT_RADIUS_RATIO`) rotates the whole cut, preserving its
sweep width. **Ratio** (`arcRatio`, rests at dead center when 0) hollows the shape into a ring; drag
it past the shape's own angular boundary into the cut-away gap and `arcRatioInverted` flips which of
the two wedges counts as filled. Math for all three lives in `utils/canvas/ellipseArc/`, a sibling to
`utils/canvas/cornerRadius/` and `utils/canvas/vertexCount/`.

**The cut-sweep data model — `arcStartAngle`/`arcEndAngle` are never the filled side directly**:
`getEllipseArcMajorArc(startAngleDeg, endAngleDeg)` is the one function every other piece of this
feature routes through. It treats the raw `endAngleDeg - startAngleDeg` delta as *how much was cut
away*, not what's shown, and resolves that into `{ majorStart, majorSweep }` — the actual filled
majority. A direct cut of e.g. 90° (`arcStartAngle` 0, `arcEndAngle` 90) resolves to
`{ majorStart: 90, majorSweep: 270 }`: the filled 270° starts at the handle (90) and wraps the long
way back to the fixed start (0). The magnitude is tracked **continuously, never re-wrapped** — a full
lap (`|endAngleDeg - startAngleDeg| === 360`, an odd multiple of a full turn) cuts the *entire* shape
away (`majorSweep` collapses to exactly `0`, "fully cut away"), and continuing to drag the same
direction past that un-cuts it again (`=== 720`, an even multiple, is a true non-degenerate full
circle again) — a triangle wave in magnitude, not a plain modulo wrap, so `arcEndAngle` can end up far
outside `[0, 360)` in the store and that's correct, not a bug to normalize away. The anchor
(`majorStart`) flips between these two extremes too: on an even-lap ("cutting") cycle count, the
filled majority grows outward from the handle back to the fixed start; on an odd-lap ("refilling")
cycle count, the newly-filled sliver instead grows outward from that same fixed start — anchoring it
at the handle there would place it wherever the handle has spun on to, disconnected from where the
actual un-cutting is visually happening. `hasEllipseArc(start, end)` (`|majorSweep| < 360`) answers
"does an arc-aware render/hit-test path apply at all" — true for both a genuine partial cut *and* the
fully-cut-away extreme (`majorSweep === 0`, which still needs the arc machinery to render as
"nothing" rather than incorrectly falling back to the plain full-circle path); only an actual full
circle (`majorSweep` at ±360) is false.

**Gotcha this session started from — the Start (rotate) handle was fully built but never wired
in**: `armEllipseArcRotateDrag`/`continueEllipseArcRotateDrag`/`disarmEllipseArcRotateDrag` and their
`TEllipseArcRotateDragState` existed, correct and self-consistent, from an earlier session — but
`handlePointerDown.ts`/`handlePointerMove.ts`/`handlePointerUp.ts`/`useHoverHighlight.ts` never
called any of them, and `useSelectionTool.ts`/`Canvas.tsx` never even created the ref. Dragging the
handle silently did nothing (fell through to whichever priority-switch case came next — usually a
whole-node move) and hovering it showed no cursor at all, with no error anywhere to point at the gap.
Worth remembering as a class of bug: a fully-implemented arm/continue/disarm trio is not evidence
it's reachable — check `ARM_RESOLVERS`/`HOVER_RESOLVERS` (§3, §9) and the hook/`Canvas.tsx` ref
plumbing independently.

**Start's rest position — perimeter, not center, distinguished by a dot**: the first fix attempt
moved Start to the *midpoint* of its own radius so it wouldn't visually collide with Sweep when the
cut is thin. That was wrong — checked against Figma directly, its "Start handle" sits on the
perimeter at the same radius as Sweep, told apart only by a dot drawn inside it (`withDot`, above);
only the separate Ratio handle is actually center-based. `getEllipseArcRotateHandlePosition.ts` is
consequently a thin wrapper that just delegates to `getEllipseArcHandlePosition.ts` (Sweep's own
position function) — the two really do share one formula, only their input angle differs
(`arcStartAngle` vs `arcEndAngle`).

**Ratio (`arcRatio`) turns the shape into a ring**: `drawEllipseArc.ts` computes both an
outer-radius point set and, when `arcRatio > 0`, a second set at `radius × arcRatio`, then fills with
`gl.TRIANGLE_STRIP` interleaving outer/inner points (`[outer0, inner0, outer1, inner1, ...]`) instead
of the plain `gl.TRIANGLE_FAN` from center used at `arcRatio === 0` — a genuinely different topology,
not a parameterized version of the fan, since the center point sits *outside* the filled ring once
there's a hole. The `arcRatio === 0` path is kept as a separate branch rather than unified via a
degenerate zero-radius inner ring specifically so the pre-existing fan behavior is untouched byte-for-
byte, zero regression risk on every shape that doesn't use this feature. The same
outer/inner-band split repeats in the hover outline (`drawThickEllipseArcOutline.ts`'s
`getOpenRingVertices`, a second triangulated band for the hole's own rim) and in hit-testing
(`isPointInEllipse.ts`, `[...outerPoints, ...innerPoints.reverse()]` fed to the existing
`isPointInPolygonVertices.ts` ray-caster — the reversed inner half is what makes the ray-caster treat
the hole as excluded, no special-casing needed in the ray-casting algorithm itself). `arcRatio` is
clamped to `ELLIPSE_ARC_MAX_RATIO` (`constant/canvas.ts`, currently `1` — a full ring where inner and
outer edges coincide is allowed on purpose, see the guide-arc case below).

**Ring-band clamped drag, not slide-from-center**: `continueEllipseArcDrag`/
`continueEllipseArcRotateDrag` project the raw pointer onto a segment for their own "handle visually
follows the drag" feedback (`draggedHandlePosition`, read by `drawEllipseArcHandleLayer` every frame
via the parent-owned refs, §1) — that segment now runs from the **inner** band edge
(`radius × arcRatio`) to the outer edge, not from dead center, so once a ring exists the handle can
only slide within the visible band instead of disappearing toward the hole. At `arcRatio === 0` the
inner edge collapses to center, exactly reproducing the pre-ring behavior — again a deliberately
backward-compatible formula rather than a separate branch.

**`getEffectiveArcAngles` — the trick that makes dragging Ratio into the gap swap sides**: matches
Figma's own behavior (drag the Ratio handle across the cut into the gap, and the gap becomes filled,
the old fill becomes the gap). `continueEllipseArcRatioDrag` computes the pointer's compass angle and
tests it with `isAngleWithinArc(angle, majorStart, majorSweep)` against the **current, un-inverted**
`getEllipseArcMajorArc(arcStartAngle, arcEndAngle)` — inside the majority → `arcRatioInverted: false`;
inside the gap → `true`. Every render/hit-test path that needs "which side is actually filled right
now" then calls `getEffectiveArcAngles(arcStartAngle, arcEndAngle, arcRatioInverted)` before feeding
angles to `getEllipseArcPoints`/`getEllipseArcMajorArc` again: not inverted, it passes the raw angles
through unchanged (identical to every pre-Ratio code path). Inverted, it resolves the *already-computed*
majorArc once, then feeds `(majorStart, majorStart + majorSweep)` back through the exact same
`getEllipseArcMajorArc` — turns out that specific pair is the one raw `(start, end)` input whose own
resolution is exactly the complementary arc (confirmed algebraically before implementing, not just by
trial): feeding a *majorSweep* as if it were a raw cut delta always yields the *complement* of that
majorSweep as the new majority, because `getEllipseArcMajorArc` always returns `360 - |sweep|` as the
new majority regardless of the input's own magnitude. No separate "complement arc" formula was
written by hand — the existing function already computes it, given the right input. This is also why
Ratio's own rest-position bisector (`getEllipseArcRatioHandlePosition.ts`) and every ring-fill/outline/
hit-test call site route through `getEffectiveArcAngles` first rather than branching on
`arcRatioInverted` locally each time — one resolution point, reused everywhere.

**Guide arc at `arcRatio === 1`**: once the ring's inner and outer edges coincide the fill collapses
to zero area — same "otherwise invisible, still needs to be selectable and visually locatable"
problem the pre-existing fully-cut-away state already solved with a straight guide *line*
(`drawEllipseArcGuideLine.ts`, center to the Sweep handle's position, shown whenever `majorSweep === 0`).
`drawEllipseArcRatioGuideArc.ts` is the curved counterpart: it walks the same `getEllipseArcPoints`
output used everywhere else and draws a short `drawLine` segment between every consecutive pair,
tracing the collapsed ring boundary as a curve instead of a straight line (the radius here is real,
only the band's *thickness* collapsed) — shown whenever `arcRatio >= 1 && hasEllipseArc(...)` (guarded
on an actual cut existing; a full circle at max ratio has no separate guide-arc case, the collapsed
full-circle fill already renders as a hairline itself). `isPointInEllipse.ts` mirrors the same
"broad, deliberately generous hit region" as the fully-cut-away case here too — `arcRatio >= 1` is
short-circuited to "the whole outer bound counts as a hit" before the real polygon test ever runs.

**Cursor**: all three handles reuse the existing `'radius'` class (§9) — no new cursor asset, same
visual language as corner-radius.

**Constants**: `ELLIPSE_ARC_MAX_RATIO` (`1`, `constant/canvas.ts`) — deliberately not capped below 1;
`RADIUS_HANDLE_DOT_RADIUS_RATIO` (`0.35`) sizes Start's distinguishing dot relative to the handle's
own `RADIUS_HANDLE_SIZE`, reusing that constant rather than introducing a second handle-size constant.
`ELLIPSE_ARC_LAP_SNAP_DEGREES` (`Canvas/constants.ts`, predates this session) is the existing
full-lap-snap tolerance for Sweep, unrelated to Ratio/Start.

## 20. Ratio handle (Star)

A third single-handle drag on Star, alongside corner-radius (index 0, §15) and vertex-count (index 2,
§18) — sitting on **vertex index 1**, the concave inner vertex physically between the other two on the
outline, and dragging the `ratio` field (inner/outer radius fraction, `STAR_MIN_RATIO`–`STAR_MAX_RATIO`
= 0.001–1) that `getStarPoints`/`getRoundedStarPoints` already consumed but nothing had ever written
post-creation (`ratio` was previously fixed at `STAR_DEFAULT_RATIO` for the node's whole lifetime,
set once by `useDrawStarTool`). Math lives in `utils/canvas/ratio/`, a sibling to `cornerRadius/` and
`vertexCount/`.

**Rest position reuses §18's fix, doesn't repeat it**: `getStarRatioHandlePosition.ts` is a near-copy
of `getStarVertexCountHandlePosition.ts` — same `getVertexCountHandlePositionFromVertices(vertices, 1,
center, cornerRadius, maxRadius, flipX, flipY)` call, just `handleIndex: 1` instead of `2`. Despite the
function's name, its bisector-plus-corner-radius-setback math is fully generic (nothing in its body is
vertex-count-specific), so reusing it directly for a third, unrelated handle kind was preferred over
either renaming the shared file or duplicating its logic — the rename was considered and rejected as
scope creep for this change. This gets the identical "stick to the point" correctness §18 fixed for
free: since `getMaxStarCornerRadius(bounds, points, ratio)` also shrinks/grows with `points`/`ratio`,
a stored `cornerRadius` is re-clamped against the *current* shape every time this handle's position is
computed, exactly like the vertex-count handle.

**The drag itself is a continuous scalar projection, not angle-snapping** (§18's algorithm doesn't
apply — `ratio` isn't a discrete candidate set). `getRatioFromLocalPoint.ts` projects the pointer onto
a fixed axis: the direction from the shape's center to vertex index 1's own **ratio-1 anchor** —
`getStarPoints(bounds, points, 1)[1]`, i.e. where that vertex would sit if the star were fully "rounded
out" (no concave notch at all). This axis is provably stable across the whole drag: vertex 1's angle
(`π/points − π/2`) depends only on `points`, never on `ratio` itself, and because both `x`/`y` scale by
the *same* `ratio` factor along that axis, `vertex1(ratio) = center + ratio · (anchor − center)`
exactly — so the drag math is a single scalar `t` solved by `dot(point − center, anchor − center) /
dot(anchor − center, anchor − center)`, then clamped to `[STAR_MIN_RATIO, STAR_MAX_RATIO]`. No rounding
to an integer (unlike corner-radius's pixel value or vertex-count's discrete counts) — `ratio` is a
continuous `0–1` fraction. Like §18's `continueVertexCountDrag`, this deliberately does **not**
correct for corner-radius setback in the drag computation itself, only in the rest-position render —
matching the established precedent that the value math always operates on the raw, unrounded vertex.

**Drag state**: `TStarRatioDragState` (`types/design/selectionTool/types.ts`) is
`{ bounds, flipX, flipY, nodeId, points, rotation }` — `points` is carried (unlike
`TStarVertexCountDragState`, which needs none of Star's own shape fields) because it's the one value
`continueStarRatioDrag` needs to recompute the fixed ratio-1 anchor at every pointermove; `ratio` itself
is deliberately absent, since it's exactly what's being solved for. Stays an ordinary hook-private ref
(`starRatioDragRef`, `TSelectionToolRefs`) — no `hasMoved` flag, no lift to `Canvas.tsx`'s `TCanvasRefs`
— nothing downstream needs a live "is dragging" feed the way §13's corner-radius zero-state offset did.

**Wiring**: `armStarRatioDrag.ts`/`disarmStarRatioDrag.ts` are one-line calls into the existing generic
`armSimpleDrag.ts`/`disarmSimpleDrag.ts` (no new generic wrapper introduced, since Star is `ratio`'s
only consumer — unlike corner-radius/vertex-count, which share their generic drag helpers across
Polygon and Star). `armStarRatioOnPointerDown`/`resolveStarRatioHover` sit in `ARM_RESOLVERS`/
`HOVER_RESOLVERS` (§3, §9) directly after the vertex-count entries and before Ellipse-arc/resize —
grouped with the other two Star-specific handles, consistent with §18's own placement reasoning (ahead
of resize, in case a low-`points` star's ratio handle ever coincides with a resize handle).

**Rendering**: `drawStarRatioHandle.ts` (`utils/canvas/`) is a near-copy of `drawStarVertexCountHandle.ts`
— same `drawEllipse`/`RADIUS_HANDLE_SIZE`/`RADIUS_HANDLE_FILL` shape. `drawStarRatioHandleLayer.ts`
(`drawScene/`) is a **separate** layer, not folded into `drawVertexCountHandlesLayer.ts`'s existing
Star `case`, even though the gating (`selectedNodes.length === 1 && hoveredNode?.id === selectedNode.id
&& type === star && shouldShowVertexCountHandle`) is nearly identical — same "keep independently-added
handle mechanisms decoupled" reasoning as §18's separate-from-corner-radius layer split. Called from
`drawScene.ts` right after `drawVertexCountHandlesLayer`.

**Cursor**: a new `ratio.png` (`assets/icons/cursors/`), *not* a reuse of `radius.png` (the Ellipse
arc-ratio handle's choice, §19) or `vertices.png` — wired via a new `&--ratio` block in
`canvas.module.scss` (`setClassName`-equivalent `className: 'ratio'` in `resolveStarRatioHover`),
identical in shape to the existing `&--radius`/`&--vertices` blocks.

**Constants**: `STAR_MIN_RATIO`/`STAR_MAX_RATIO` (0.001/1, `Canvas/constants.ts`) predate this feature
— defined alongside `STAR_DEFAULT_RATIO` when Star was first drawable, but unenforced by any clamp
until this handle became the first thing to actually read them, the identical "canvas drag now, panel
later" pattern §18 notes for `STAR_MIN_POINTS`/`STAR_MAX_POINTS`.

## 21. Vector Edit Mode — new resolvers, not a parallel tool

`NodeType.vector` (the Pen tool's Vector Network, full detail in `vector-network.md`) is edited by
**extending** this subsystem's own `ARM_RESOLVERS`/`handlePointerMove.ts`/`handlePointerUp.ts`, the
same arm/continue/disarm shape every mechanism above uses, gated only on `vectorEditingNodeId` (Redux)
rather than on `activeTool`: `armVectorHandleOnPointerDown` (drag a Bezier tangent dot, mirroring the
paired segment's tangent via `getMirroredVectorSegments.ts` when the vertex's `TVertexHandleMode` calls
for it), `armVectorVertexOnPointerDown` (select + drag a vertex — single-vertex only, no multi-select),
`armVectorEdgeInsertOnPointerDown` (click a segment's stroke away from either endpoint to split it).
All three sit at the very top of `ARM_RESOLVERS`, highest priority, mirroring how line-endpoint-drag
already wins over the generic whole-node hit.

Unlike every corner-radius/vertex-count/ellipse-arc handle above, the vertex-drag path needed **no**
ref-lifting to `TCanvasRefs` for the render loop to see it live — `continueVectorVertexDrag.ts`
dispatches a real `updateNode` every `pointermove`, the same rule ordinary node-move already follows
(§3's "committed mutations go through Redux every tick" line), so `store.getState()` in `drawScene.ts`
already reflects the drag with no ref needed. The one genuinely new ref this feature added,
`selectedVectorVertexIdsRef`, is UI-only vertex-selection state with no Redux equivalent — deliberately
kept off `TDesignState` the same way this subsystem already keeps drag-in-progress state off it.

**Tangent-handle selection is a second, mutually-exclusive ref, not a variant of vertex selection.**
`selectedVectorHandleRef` (`TCanvasRefs`, shape `TVectorHandleHover = { end, segmentId }`, the same
shape `hoveredVectorHandleRef` already used for hover) was added alongside `selectedVectorVertexIdsRef`
— asked for directly as "wspólne punkty na wektorze" (vertices and tangent handles are the same kind of
selectable point on the network, so selecting one always clears the other): `armVectorVertexOnPointerDown`
sets the vertex and nulls `selectedVectorHandleRef`; `armVectorHandleOnPointerDown` **and**
`armVectorCornerHandleOnPointerDown` (the Ctrl-pull-a-fresh-handle resolver, §9 of `vector-network.md`)
both set the handle and clear `selectedVectorVertexIdsRef` to `[]`. Both directions are enforced at the
arm site, not derived at render time, so there's never a frame where both are simultaneously non-empty.
`armVectorEditMissOnPointerDown`, `useSelectionTool.ts`'s own cleanup effect (tool switch away), and
`useVectorEditOnDoubleClick.ts`'s "vectorEditingNodeId changed" effect all clear **both** refs together
— every place that already reset the vertex selection needed the identical line added for the handle.

**Tangent handles are hidden by default — visible only once a selected vertex is one of their segment's two
endpoints (Figma's one-hop neighbor reveal, plus one further hop *through* a plain tangent-less corner,
never through a real curve — `vector-network.md` §10's `getOneHopVectorVertexIds.ts`), or the handle itself
is selected.** A later follow-up narrowed `armVectorHandleOnPointerDown` and `resolveVectorTangentHandleHover`'s
own hit-testing to match: both now filter `getVectorHandleAtPoint` candidates through the same
`isVectorSegmentEndpointSelected` predicate the renderer uses (fed the one-hop-expanded vertex set, not the
raw selection), so a handle that isn't drawn can never still be dragged/hovered at its old position.

**Rendering the selected handle mirrors the selected-vertex look, diamond instead of circle.**
`drawVectorTangentHandles.ts` gained a `selectedHandle: TVectorHandleHover | null` parameter (threaded
through `drawVectorEditHandlesLayer.ts`/`drawScene.ts` next to the existing `hoveredHandle`), computing
`isStartSelected`/`isEndSelected` the same way `isStartHovered`/`isEndHovered` already work, and passing
an `isSelected` flag into `drawTangentHandle.ts` — when true it takes precedence over hover entirely
(matching `drawVectorVertexDots.ts`'s own `if (selected) {...} else {...hover...}` shape) and draws a
solid `VECTOR_HANDLE_FILL` connecting line plus a white-then-blue diamond pair at
`VECTOR_VERTEX_SELECTED_SCALE`/`_INNER_SCALE`, the exact same constants the selected-vertex ellipse pair
uses. The rendering itself was split into small single-purpose files rather than kept as branches inside
one function (asked for directly, mirroring the folder-promotion rule in `xigma-module-structure`):
`drawHandleDiamond.ts` (one plain filled rotated-square primitive, reused by both), and
`drawSelectedTangentHandleDot.ts` / `drawDefaultTangentHandleDot.ts` (the two mutually-exclusive dot
styles), leaving `drawTangentHandle.ts` itself as a thin orchestrator that draws the line then dispatches
to whichever dot function applies.

**Cursor**: dragging either a vertex or a tangent handle now switches the cursor to the `move` class
(`&--move` in `canvas.module.scss`, already wired to `move.png` but previously unused anywhere in JS) —
`continueVectorVertexDrag.ts`/`continueVectorHandleDrag.ts` call `setClassName('move')` on every
successful drag tick, and `disarmVectorVertexDrag.ts`/`disarmVectorHandleDrag.ts` reset it to `null` on
release. This meant threading `setClassName` one level deeper than before: `useSelectionTool.ts`'s
`onPointerMove` didn't previously pass it into `handlePointerMove.ts` at all (only `onPointerDown`/
`onPointerUp` did), since no other `continue*Drag` needed it — `continueRotateDrag.ts` sets `canvas.style.cursor`
directly instead, a different, lower-level mechanism from the CSS-class approach used here.

**Multi-selection — both refs became arrays, shift toggles membership, a plain click still replaces.**
`selectedVectorVertexIdsRef` was already an array (per its own name); `selectedVectorHandleRef` became
`selectedVectorHandlesRef: TVectorHandleHover[]` to match. A **plain** click on a vertex/handle still
fully replaces the selection with just that one item and clears the other ref (unchanged from the
single-select behavior above) — the mutual exclusivity only applies to this replace case.
**Shift+click toggles** the clicked vertex/handle into or out of whichever ref it belongs to, via
`toggleSelection.ts` (reused as-is for vertex ids) and a new `toggleVectorHandleSelection.ts` (object
equality on `{end, segmentId}` instead of a plain id), **without** touching the other ref or arming any
drag — mirrors `toggleSelectionOnPointerDown.ts`'s existing whole-node shift-click shape exactly (a
synchronous ref/state edit, gesture ends there). This means a shift+click can leave the selection mixed
— some vertices and some handles selected together — which is the point: "to są wspólne punkty na
wektorze" (they're the same kind of selectable point), asked for directly.

**The group-move box — vertices only, deliberately excludes any selection containing a tangent handle.**
*(Superseded in part, see [[vector-network]] §31: the box gained real resize/rotate corner handles in a
later, separate pass, and its eligibility narrowed from "2+ points, mixed vertices/handles allowed" to
"2+ points, zero tangent handles" — a bounding box with resize/rotate semantics has no clean definition
for a set of tangent-handle control points, and Figma doesn't have one for this case either.)* Originally:
once 2+ points were selected (mixed vertices/handles allowed), `drawVectorMultiSelectBox.ts` drew a plain
stroke rectangle over `getVectorMultiSelectBounds.ts`'s bounds (vertex positions + resolved handle
absolute positions, same `getEffectiveTangentStart`/`tangentEnd` resolution the render/hit-test layers
already use) — no `drawCornerHandles` call, unlike every other bounds-box in this file
(`drawGroupSelectionOutline.ts` included) which all draw corner handles. A handle-only or mixed
multi-selection can still be dragged as a rigid group today — just never via a box interior click, only by
grabbing one of its own already-selected members directly (`armVectorGroupDrag.ts`). Clicking inside that
box (not on a specific point, not shift-held) arms `vectorMultiDragRef` (`TVectorMultiDragState`, a new
type: `vertexOrigins` +
`handleOrigins` — the latter keyed by `` `${end}:${segmentId}` ``, snapshotting the *absolute* tangent
value at arm time since a rigid group translate needs per-point origin+delta, unlike single-handle drag's
absolute recompute-from-vertex shape). `continueVectorMultiDrag.ts` then translates every origin by the
same pixel delta and writes both `vertices` and `segments` in one `updateNode` dispatch. The arm resolver,
`armVectorMultiSelectBoxOnPointerDown.ts`, sits right after `armVectorVertexOnPointerDown` in
`ARM_RESOLVERS` — ahead of `armVectorMarqueeOnPointerDown` (next), since a click inside the box must win
over the "click hit nothing, start a marquee" fallback.

**Marquee-selecting vector points — the old plain miss-resolver became a marquee-arming one.**
`armVectorEditMissOnPointerDown.ts` (miss → immediately deselect, no drag) was replaced outright by
`armVectorMarqueeOnPointerDown.ts`: same trigger (`vectorEditingNodeId && !hit`, plus a new `!event.shiftKey`
guard matching the whole-node marquee's own gate), but instead of just clearing both selection refs, it
also arms a **new**, vector-scoped `vectorMarqueeStartRef` (`TSelectionToolRefs`, paired conceptually with
the existing whole-node `marqueeStartRef` but never the same ref — see below) and captures the pointer. A
plain click with no movement still nets out to "just deselect" (the marquee never collects anything if the
pointer never moves), so this is a strict superset of the old behavior, not a replacement of it.
`continueVectorMarqueeDrag.ts` reads `vectorMarqueeStartRef`, builds a `TDraftRect` via the same
`toDraftRect.ts` the whole-node marquee uses, and calls `getVectorPointsInRect.ts` (new,
`utils/canvas/vectorNetwork/`) to collect every **vertex** whose *point* falls inside — a plain AABB
containment test reimplemented locally in that file rather than importing the feature-local
`Canvas/utils/isPointInRect.ts` from a global util (would violate the global-layer-never-imports-from-
components rule in `xigma-module-structure`); unlike the whole-node marquee there's no touch-vs-fully-
inside Ctrl toggle, since a point has no area — "inside" is unambiguous. Critically, this function writes
straight into `canvasRefs.selectedVectorVertexIdsRef` (plain ref mutation, no `dispatch` at all) rather
than `dispatch(setSelection(...))` the way whole-node `continueMarqueeDrag.ts` does — because vector-point
selection is UI-ref state, not Redux state, same as everywhere else in this section.

**Tangent handles are deliberately excluded from box-drag marquee selection.** A first version had
`getVectorPointsInRect.ts` also collect handles whose resolved absolute position (`getVectorHandlePosition`/
`getEffectiveTangentStart`) fell inside the rect, mirroring the vertex test, and `continueVectorMarqueeDrag.ts`
wrote that result into `selectedVectorHandlesRef`. Reverted — box-dragging over a curve routinely sweeps a
handle's control point along with the vertices it's near, silently mixing a tangent handle into what the user
meant as a plain point selection. `getVectorPointsInRect.ts` now returns a plain `string[]` of vertex ids
only (the `handles`/`TVectorPointsInRect` shape is gone), and `continueVectorMarqueeDrag.ts` unconditionally
sets `canvasRefs.selectedVectorHandlesRef.current = []` on every tick — a marquee drag always clears any
prior handle selection rather than replacing it with a new one. Shift+click toggling a single tangent handle
(above) is unaffected — this only narrows the box-drag path.

**Why a separate start-ref instead of reusing `marqueeStartRef`.** The *visual* rectangle ref
(`TCanvasRefs.marqueeRef`) **is** shared as-is with the whole-node marquee — `drawMarquee.ts` just draws
whatever's in it, generically, regardless of which mechanism populated it. But the *arming* ref could not
be shared: `continueMarqueeDrag.ts` (whole-node) and `continueVectorMarqueeDrag.ts` both run
unconditionally every `pointermove`, each gated only on `if (theirOwnStartRef.current)` — sharing one
start ref would make both fire simultaneously off the same drag, double-processing it (nodes *and* vector
points at once). Mutual exclusivity between the two marquee *kinds* falls out for free from
`ARM_RESOLVERS` ordering instead: `armVectorMarqueeOnPointerDown` sits early (right where the old miss
resolver was) and unconditionally claims any qualifying pointerdown while Vector Edit Mode is active, so
`armMarqueeOnPointerDown` (whole-node, near the very end of the array) never even gets reached in that
state — only one of the two start-refs is ever non-null at a time, by construction, which is what makes
reusing the single shared `marqueeRef` for the visual safe.

## 22. Selection size label (W × H badge)

A blue rounded badge showing `${round(width)} x ${round(height)}` sits just outside the selection,
drawn by `drawSelectionSizeLabel.ts` right after `drawSelectionOutline` in `drawScene`. It gets the
same `selectedNodes` + `vectorEditingNodeIds` and re-applies the same `!vectorEditingNodeIds.includes`
filter, so it never shows in Vector Edit Mode.

- **What it measures.** Single node → `getNodeBounds(node)` (the node's own unrotated w/h) + its
  `rotation` (`0` for a line). Multi-select → `getSelectionBounds(nodes)` (axis-aligned union) with
  `rotation: 0`. This is intentionally the same source the outline uses, so the badge tracks live
  during resize/rotate (plain box transforms dispatch to Redux per `pointermove`; only vector
  transforms freeze to snapshot refs — see [[canvas-vector-performance]]).
- **Placement** (`getSelectionSizeLabelPlacement.ts`, pure/rotation-aware). Take the 4 edge
  midpoints + outward unit normals, rotate both about the rect centre by `rotation`, then dock to the
  edge whose rotated normal has the largest screen-`y` (points most "down"). Badge angle =
  `atan2(normal.y, normal.x)·180/π − 90`. Because the chosen normal always has `y ≥ 0`, the angle
  stays in `[−45, 45]` — the label is always parallel to its edge and never upside-down, and it
  *hops* to the next edge every time rotation crosses 45°/135°/… (this is the "gdy przeskoczymy na
  wyższy kąt zmienia pozycję do linii" behaviour). The badge is always centred on the edge midpoint.
- **Styling / reuse.** Renders through `drawValueLabel` (the variable-width tool's label util),
  extended with an optional trailing `{ angleDeg?, edgeGapPx?, fill? }`. `fill` is set to
  `DRAFT_FRAME_STROKE` (`#337ae1`, the shared canvas/selection blue — same token the outline, handles,
  marquee and vector-edit dots use) instead of the default pink; `angleDeg` rotates both the badge
  rect (via `drawRect`'s rotation arg) and the glyph quads (new `rotateGlyphVertices.ts`, mirrors
  `translateGlyphVertices` with a `degrees === 0` identity fast-path); `edgeGapPx`
  (`SELECTION_SIZE_LABEL_EDGE_GAP_PX = 5`) makes `drawValueLabel` place the badge's *near edge* that
  many screen-px off the anchor (`offset = edgeGapPx/zoom + badgeHeight/2`) rather than its default
  `VALUE_LABEL_OFFSET_PX` centre distance. Padding/font/corner-radius all stay the shared
  `VALUE_LABEL_*` constants, so the badge is never squeezed — its size is derived from text metrics ÷
  zoom.
- **Not shown:** `×` (U+00D7) is absent from the Inter MSDF atlas, so the separator is a lowercase
  `x`.

## 23. Shape contact guides (red X-capped edge lines)

When a single axis-aligned shape's edge value matches another shape's opposite edge value (within
tolerance), a red (`CONTACT_GUIDE_STROKE` `#cd7259`) line with an `×` marker at each end is drawn **on
both shapes' matching edges** — one line spanning the active shape's extent, one spanning the
neighbour's (`drawShapeContactGuides.ts` → `drawXMarker.ts`, right after `drawSelectionSizeLabel` in
`drawScene`). Same seam, two lengths, so you see the overlap between the two footprints. When the two
shapes sit diagonally rather than side by side — same edge value, but no overlap on the other axis, so
there's a real gap between their footprints — a third **bridge** segment connects their nearest corners
across that gap, so the guide doesn't look like it just stops short at each shape independently.

- **Detection** (`getShapeContactGuides.ts`, pure). Inputs are already-resolved AABBs
  (`getRotatedNodeBounds`, correct for 0/90/180/270). Per candidate, a `switch (true)` over eight edge
  pairs, in two families:
  - **Facing** (right↔left, bottom↔top, and their mirrors) — the classic "touching neighbour" case.
    Fires when `|activeEdge − candidateEdge| ≤ CONTACT_GUIDE_TOLERANCE_PX` (0.5px world) **and** the
    other axis's overlap amount is non-zero. Positive (genuinely overlapping) is the normal flush-edge
    case: each shape gets its own full-edge guide, no bridge. Negative (a real gap) means the shapes sit
    diagonally rather than side by side: `getVerticalBridge`/`getHorizontalBridge` add a third segment
    connecting the two shapes' nearest corners across the gap, so the guide doesn't look like it just
    stops short at each shape independently.
  - **Same-side** (top↔top, bottom↔bottom, left↔left, right↔right) — both shapes aligned to the same
    value rather than touching. Fires on the same tolerance check, but only when the other axis's
    overlap is **negative** (a real gap) — unlike the facing family, positive overlap here means the two
    footprints genuinely intersect (both start from the identical matched edge), so — same principle as
    "if the shapes actually intersect, nothing draws" — it's suppressed rather than treated as a flush
    match. When it fires, the guide/bridge shape is identical to the facing family's gap case, just
    reusing the same two bridge helpers with both edges' values passed in.

  Either way, the one thing excluded everywhere is overlap of exactly zero — two shapes that merely
  touch or align at a single corner point — since there's no real "nearest corner" there and a
  full-length guide would overstate a single-point coincidence into a match. Two axis-aligned rects can
  only match on one side at a time (a second shared side just meets at that same corner, excluded per
  above), so it's exactly one `switch` case per contacting pair, never more than one firing per
  candidate. Overlap large enough that the shapes actually intersect on a *facing* pair never reaches
  here either: no edge value is flush in the first place, so nothing draws regardless of the check.
- **Eligibility** (`isContactGuideEligibleNode`): `rectangle · ellipse · polygon · star · text ·
  media · frame · section` — any node with a fixed x/y/width/height footprint — not hidden, rotation
  a multiple of 90°. Excludes only `group` (no footprint of its own, just a bounds computed from
  children) and `line · vector` — the vector network has its own alignment guide (§21 /
  [[vector-network]]). This same predicate gates both the contact guides above and the shape
  alignment-snap (§24), so frame/section got both for free once added here.
- **Trigger** (`resolveShapeContactGuides.ts`, last resolver in the selection-tool `handlePointerMove`
  chain). The "active" ids are: every key in `resizeDragRef.nodeOrigins` → every key in a moved
  `dragStateRef.nodeOrigins` → on `event.altKey`, every currently-selected node id → otherwise none
  (ref cleared). **Multiple active shapes are fully supported** — a multi-selection or a moved/resized
  group (its rigid-transform id list expands to its individual descendants upstream, in
  `getRigidTransformNodes`/`getTransformTargetNodes`, same as the alignment-snap side in §24) each
  contribute their own guides independently, checked against the same candidate set. The group node
  itself is never active or a candidate — `isContactGuideEligibleNode` excludes it — only its
  eligible descendants are, and each active shape is excluded from being a candidate for the *other*
  active shapes (two things moving/selected together never collide with each other). Writes
  `refs.transform.contactGuidesRef` (a `TShapeContactGuide[] | null`, sitting in the transform ref
  group next to the drag/resize id sets).
- **Clearing**: the resolver nulls the ref whenever the trigger doesn't hold (covers Alt-release,
  which `handleAltKeyChange` — the `utils/handleAltKeyChange/` sibling of `handleShiftKeyChange`, wired
  through `useSelectionTool`'s `onAltKeyChange` — re-emits as a synthetic `pointermove` for the
  default/move/scale/shapeBuilder tools); also nulled explicitly in `handlePointerUp`, `onPointerLeave`
  and the tool-teardown effect, since no `pointermove` is guaranteed after those.
- **No undo / no store**: purely a render artifact off a ref, like the vector alignment guide.
- e2e: `e2e/design/selection/shape-contact-guide.spec.ts` (drag-into-contact + Alt-hover).

## 24. Alignment-snap core made shared, and a move-time snap for shapes

The vector-edit point-alignment machinery (§21) was vector-specific in name only — its math never
touched vector concepts. Renamed/relocated with no behaviour change, then reused for whole-shape
dragging:

- `getVectorAlignmentGuide` (single point → nearest same-row/same-column candidate) moved
  `utils/canvas/vectorNetwork/` → `utils/canvas/getAlignmentGuide.ts`, renamed `getAlignmentGuide`.
- `getVectorGroupAlignmentGuide` (best axis match across a set of dragged points →
  `deltaCorrection` + render guide) moved to `components/Design/Canvas/utils/getGroupAlignmentGuide.ts`,
  renamed `getGroupAlignmentGuide` — now also the **home of the `TAlignmentGuide`/
  `TAlignmentAxisGuide` types** (previously defined in `applyVectorPointSnapping.ts`).
  `applyVectorPointSnapping.ts` imports both from there unchanged otherwise.
- `drawVectorAlignmentGuide.ts` → `drawAlignmentGuide.ts` (`drawVectorAlignmentGuide` →
  `drawAlignmentGuide`), still just draws a `TAlignmentGuide | null` — no vector awareness.
- Constants `VECTOR_ALIGNMENT_GUIDE_STROKE`/`VECTOR_ALIGNMENT_SNAP_TOLERANCE_PX` →
  `ALIGNMENT_GUIDE_STROKE`/`ALIGNMENT_SNAP_TOLERANCE_PX` (values unchanged).
- **`vectorAlignmentGuideRef` itself was deliberately NOT renamed/moved** — it's read by ~15
  pen/vector-edit files (mostly nulling it on cleanup) and renaming it bought nothing; only its
  generic type param changed (`TVectorAlignmentGuide` → `TAlignmentGuide`). Shapes get a **separate**
  ref, `refs.transform.alignmentGuideRef`, sitting next to `contactGuidesRef` (§23) — the two never
  fire at once (vector-edit vs. plain selection are mutually exclusive), and `drawScene` draws both
  through the same `drawAlignmentGuide`.

**Shape move-snap** (`getDragAlignmentSnap/`, pure, driven from `continueDrag.ts` — the whole-node
move handler — split into `getDragAlignmentSnap.ts` orchestrator + `getEligibleDraggedEntries.ts` +
`getCandidateShapes.ts` + `extendGuideToFullElement.ts`, each independently unit-tested): each
dragged node id that both (a) has a plain `{x,y}` origin (i.e. a box node, not a
line/vector — those never reach here) and (b) is `isContactGuideEligibleNode` (§23's same
rectangle/ellipse/polygon/star/text/media + axis-aligned + not-hidden filter) contributes 9
`getShapeSnapPoints` — the 4 corners, 4 edge midpoints, and centre of its dragged-to bounds — as
`draggedPoints` into `getGroupAlignmentGuide`; every *other* eligible node's 9 points are the
candidates. The returned `deltaCorrection` is added to the raw pointer delta before it's dispatched,
so a shape dragged within `ALIGNMENT_SNAP_TOLERANCE_PX` of a candidate point on either axis locks
onto it, exactly like the vector multi-drag group-snap (§21) it's a sibling of. A mixed drag (some
eligible shapes, some lines/vectors) still snaps as one rigid group — the correction is computed
from the eligible members only but applied to every dragged node's delta uniformly.

- **The rendered guide line spans the whole matched shape, not just anchor→match.** `getGroupAlignmentGuide`'s own `{anchor, match}` (a short segment between the two specific points that matched) is shape-agnostic — fine for vector vertices, but for shapes `getDragAlignmentSnap` post-processes it: `extendGuideToFullElement` looks up which candidate's 9 snap points contains the matched point (`findMatchedShapeBounds`, exact value match — safe, since every candidate point it can possibly match against was drawn from that same `candidateShapes` list one line above) and stretches the axis line to that shape's full bounds — vertical line running its whole height, horizontal its whole width — rather than a short stub between just the two aligned points. This post-processing is local to the shape path; `drawAlignmentGuide` itself and the vector-drag call sites are untouched.
- No draw-new-shape snap yet (only move + resize, §25) — deliberately deferred.
- No modifier bypass — snap is always active during a move, by design (unlike Figma's none-here
  either, per the request this shipped from).
- Cleared in `disarmDrag.ts`, `onPointerLeave`, and the tool-teardown effect, mirroring §23's
  `contactGuidesRef` cleanup story.
- e2e: `e2e/design/selection/shape-alignment-snap.spec.ts` — screenshot-equality against a control scene
  where the shape is placed directly at the expected snapped/unsnapped position (no drag), the same
  technique §23's e2e already established for proving exact geometry without a state-reading hook.

## 25. Alignment-snap extended to resize

§24's shape snap only fired on move; resize dragging now gets the same treatment, gated much more
narrowly since resize math already branches hard on rotation/single-vs-multi (§4/§19).

- `getResizeAlignmentSnap.ts` (`components/Design/Canvas/utils/`) — a second, smaller orchestrator
  next to `getDragAlignmentSnap/` (imports `getCandidateShapes`/`extendGuideToFullElement` from that
  folder rather than duplicating them). Unlike the move-time snap, resize only ever moves **one**
  query point (the live pointer position that becomes the resize's free corner/edge), so it goes
  straight through `getAlignmentGuide` (§24's single-point matcher), not `getGroupAlignmentGuide` —
  there's no rigid set of dragged points to correct, just the one point whose snapped value then
  drives `getResizeOrScaleFactors` in place of the raw query point.
- **Only wired in for the single-box, unrotated case.** `getResizeDragFrame.ts` gates the whole call
  behind `isSnappableSingleOrigin = !origin || (origin.rotation === 0 && 'width' in origin)` — `origin`
  here is `getSingleRotatableOrigin(originEntries)` (§4), which is non-null only when there's exactly
  one resize origin and it isn't a line. So: `null` (multi-node resize, or a line) → world-space query
  point, always snappable; non-null and `rotation === 0` and it's a box (not a vector) → also
  snappable; non-null with any rotation → skipped outright, snap never engages. A rotated single node
  resizes in **unrotated local space** (`getUnrotatedQueryPoint`) specifically so the box math doesn't
  have to reason about rotation — feeding a world-space-snapped point into that local-space pipeline
  would silently corrupt the resize, so rotation is a hard bypass rather than something snap tries to
  reason about. `excludedIds` is every id in `nodeOrigins` (§23's same "never snap a shape against
  itself/its own selection" rule as move and contact guides).
- Guide storage/lifecycle mirrors move exactly: `continueResizeDrag.ts` writes the returned guide to
  the same `refs.transform.alignmentGuideRef` §24 introduced (move and resize never overlap, so one
  ref suffices), `disarmResizeDrag.ts` clears it alongside `resizedNodeIdsRef`.
- e2e (`e2e/design/selection/shape-resize-snap.spec.ts`) needed a different control-scene shape than §24's
  move test: comparing a resize-produced node screenshot against a node placed by the **draw-new-shape**
  tool at the literal target size is *not* pixel-safe even when the feature is correct — width/height
  are `Math.round`ed in `resizeBoxNode.ts` but the paired x/y (`getResizedPosition.ts`, built from
  `transformCoord`'s anchor+scale math) are not, so a resize-derived node can land at a sub-integer
  screen position a directly-drawn node never would, differing at the byte level despite looking
  identical (confirmed: two screenshots with matching visible pixels but different PNG byte lengths).
  This is pre-existing resize behaviour, not a snap bug — `resize.spec.ts`'s own pixel-exact assertion
  (the rotated-mirror-crossing test) only ever compares two *resize-derived* screenshots against each
  other, never a resize against a draw-tool placement, for the same reason. Fixed by building the
  control the same way: drag A's handle to land exactly on B's edge (no snap needed to get there) and
  compare that against the snap scene's shorter drag that lands 3px short and relies on the snap to
  reach the identical final point — both sides now go through the resize pipeline, so their sub-pixel
  output matches byte-for-byte when snap is working.

## 26. Alignment-snap extended to drawing a new shape

The final leg of the phased snap rollout (§24 move, §25 resize): the live free corner of a
draft rect being drawn from scratch (Rectangle/Frame/Section/Ellipse via `useDrawShapeTool`, plus
`useDrawStarTool`/`useDrawPolygonTool`/`useDrawTextTool`) now snaps against existing shapes too.
`useDrawTextOnPathTool` is deliberately excluded — it creates a `NodeType.path` node, which is a
vector network like line/vector, not a plain box.

- Reuses §25's `getPointAlignmentSnap` directly rather than adding a third orchestrator — draw-tool
  geometry is exactly resize's shape: one live point being dragged, matched against the same
  `getCandidateShapes`/`extendGuideToFullElement` pipeline. `getResizeAlignmentSnap` was renamed to
  `getPointAlignmentSnap` (and `TResizeAlignmentSnap` → `TPointAlignmentSnap`) to reflect that it's now
  shared, the same rename-out-of-a-specific-name move §24 made for the vector-alignment core.
- Each of the four hooks calls it identically in both `handlePointerMove` (to snap the live preview
  written to `draftRef`) and `handlePointerUp` (recomputed from the up-event's point, so the committed
  node matches the last preview exactly) — `excludedIds` is always `[]` since the shape being drawn
  doesn't exist as a node yet, so there's nothing to exclude. The guide goes through the same
  `refs.transform.alignmentGuideRef` §24/§25 already use (draw, move, and resize are mutually
  exclusive gestures), set on every move and cleared alongside `draftRef.current = null` on commit —
  mirroring `draftRef`'s own set/clear lifecycle in each hook rather than introducing a new cleanup
  path.
- Unlike §25, there's no rotation/single-vs-multi gate to worry about here — a draft rect is always a
  single, unrotated box by construction, so every one of the four hooks snaps unconditionally.
- `toDraftRect` already rounds its corners via `Math.round`, so unlike §25's resize case there's no
  sub-pixel x/y mismatch between a snapped draft and a directly-drawn one — both go through the exact
  same rounding.
- e2e (`e2e/design/selection/shape-draw-snap.spec.ts`, rectangle only — the other three hooks are proven at
  the unit level, one set of alignment-snap tests added per hook's own spec file) clips the comparison
  screenshot to just the drawn shapes' bounding box (`page.screenshot({ clip })`, the same technique
  `resize.spec.ts`'s mirror tests use) instead of comparing the full `canvas.screenshot()` — a
  full-canvas capture intermittently picked up a few antialiasing-level pixels differing near the
  toolbar corner, unrelated to either shape, under heavy parallel test-worker/GPU load. `resize.spec.ts`
  needing `mode: 'serial'` for its own multi-test file is the same underlying class of noise; this file
  sets it too.

## 27. Snap candidate shapes cached per gesture, not rescanned every pointer event

None of §24–26's snap call sites are viewport- or spatially-filtered — `getCandidateShapes` walks
every eligible node on the active page unconditionally (candidates outside the current view, or far
from the dragged point, are still iterated; they just never land within `ALIGNMENT_SNAP_TOLERANCE_PX`
so they have no visible effect). This is deliberate for now: this "full scan, no spatial index" shape
is the existing norm across this whole subsystem — hit-testing, hover-resolve, marquee-drag, and
contact guides (§23) all do the same unfiltered `Object.values(nodes)`/ordered-node walk, several of
them on every `pointermove`. A proper shared spatial index (the vector-network crossing detector
already proved out a uniform hash-grid approach for exactly this shape of problem — see
[[canvas-vector-performance]] §5.4) would benefit all of them at once, but that's a separate, larger
initiative, not started.

What *did* ship here is the cheap, no-new-infrastructure half of that: `getCandidateShapes` was being
called **on every `pointermove` (and `pointerup`)** of a move/resize/draw gesture, even though the set
of "other" nodes on the page essentially never changes mid-gesture. Each gesture's arm site now calls
it exactly **once**, caching the result on the gesture's own state:

- `armDrag.ts` → `TDragState.candidateShapes`, consumed by `getDragAlignmentSnap` (§24) via
  `continueDrag.ts`.
- `armPlainResizeDrag.ts`/`armRotatedGroupResizeDrag.ts` → `TResizeDragState.candidateShapes`,
  consumed by `getResizeDragFrame.ts` (§25) via `continueResizeDrag.ts`. Computed unconditionally in
  both arm sites even though a rotated group resize's `isSnappableSingleOrigin` gate means it's never
  actually read — arming is a one-time O(n) cost regardless, and keeping the field non-optional avoids
  a null-check at every read site for a case that's cheap to just compute anyway.
- The four draw-tool hooks (§26) have no arm/continue split in the same sense `TCanvasRefs` gives
  move/resize, so each gets its own **local** `candidateShapesRef = useRef<TCandidateShape[]>([])`,
  populated in `handlePointerDown` and read (never recomputed) in `handlePointerMove`/`handlePointerUp`.
- `getResizeAlignmentSnap`/`getPointAlignmentSnap` (§25) and `getDragAlignmentSnap` (§24) themselves
  were both **narrowed to pure functions over an already-computed `TCandidateShape[]`** — neither takes
  `nodes`/`excludedIds` for candidates any more (`getDragAlignmentSnap` still takes `nodes` alone, but
  only to look up the *dragged* nodes' own type/rotation for `getEligibleDraggedEntries`, an O(k) lookup
  over the handful of dragged ids, not an O(n) scan). This is also why `getResizeAlignmentSnap` was
  renamed `getPointAlignmentSnap` back in §26 — once it stopped taking `nodes`/`excludedIds`, "resize"
  was no longer accurate to what the function does.
- Test fallout: every hand-built `TDragState`/`TResizeDragState` fixture across the affected spec files
  needed a `candidateShapes` field. The two big shared-store integration specs
  (`continueDrag.spec.ts`, `continueResizeDrag.spec.ts`) gained a factory default of `candidateShapes: []`
  (override-able per test) so only the handful of tests that actually exercise snapping need to compute
  a real value via `getCandidateShapes(...)` themselves — mirroring exactly what the production arm site
  does, rather than relying on the old "scans the live store" behavior. Two now-redundant assertions
  (excluded-id and group-type filtering, previously duplicated at the `getDragAlignmentSnap`/
  `getPointAlignmentSnap` level) were dropped in favor of `getCandidateShapes.spec.ts`'s own dedicated
  coverage, since that filtering logic now lives in exactly one place.

## 28. Equal-spacing guides (Figma's "Smart selection" gap indicator) — passive display, plus an active snap while dragging

Roadmap Stage 13's "smart guides ... with the distance shown" gap: if a shape has one neighbour on
each side of an axis with matching gaps (within tolerance), a pink line + `${gap}px` label is drawn
in each gap — Figma's "equal spacing between 3 elements" indicator. **v1 is this indicator plus a
single-shape drag-time snap** — no full Smart Selection *mode* (pink handles, drag-to-reorder within
the pattern, duplicate/delete-with-reflow, resize-others to keep spacing); those are a separate,
larger feature if this is extended later.

Two genuinely different behaviours share the same geometry, split into **parallel mechanisms**
(this subsystem's established answer whenever "same shape, different guarantee" comes up — see the
file-structure note at the top of this doc) rather than one:

- **Passive display** (resize, Alt-hover) — report a pattern that *already* exists; there's no delta
  to correct (resize has its own factor pipeline, Alt-hover has no drag at all), so showing anything
  other than the shape's real current gaps would be misleading.
- **Active snap** (a plain move drag) — like §24's edge alignment-snap, *pull* the dragged shape into
  the equal-spacing position when it's close, then show the guide at that corrected position.

- `Canvas/utils/getEqualSpacingGuides/` — pure, mirroring this subsystem's "small single-purpose
  file" convention:
  - `findHorizontalNeighbors.ts`/`findVerticalNeighbors.ts` — one pass over the candidate list each,
    returning the *nearest* eligible neighbour on each side (`{left, right}`/`{top, bottom}`) that
    has positive overlap with the active shape on the perpendicular axis — the same overlap
    requirement §24's shape alignment-snap and §23's contact guides both already encode, and the
    same "layers must ... overlap on either the x or y axis" rule the Figma help article for Smart
    Selection states explicitly. `TEqualSpacingCandidate` is just `{bounds}` (no `id` — never read),
    kept structurally compatible with §24-27's own `TCandidateShape` (`{bounds, points}`) so the
    drag-time snap (below) can reuse the alignment-snap family's already-cached candidate list
    directly instead of a second per-pointermove `Object.values(nodes)` scan.
  - `getHorizontalEqualSpacingGuide.ts`/`getVerticalEqualSpacingGuide.ts` (**passive**) — given the
    active shape's edges and one axis's neighbour pair, compute both gaps and bail unless both are
    strictly positive (a real gap, not flush contact — that's §23's job) and within
    `EQUAL_SPACING_TOLERANCE_PX` (0.5 world px) of each other; the guide is built from the shape's
    *actual* position, unmoved.
  - `getHorizontalEqualSpacingSnap.ts`/`getVerticalEqualSpacingSnap.ts` (**active**) — same neighbour
    shape, but the check is "how far is the *ideal* centred position from where the shape already
    is" (`mismatch`), gated by the larger, drag-catchment `EQUAL_SPACING_SNAP_TOLERANCE_PX` (4 world
    px, matching `ALIGNMENT_SNAP_TOLERANCE_PX`'s own value/feel). Within tolerance, returns the
    `deltaX`/`deltaY` that lands exactly on the ideal position, and builds the guide from *that*
    corrected position (so the drawn numbers always match what the shape actually snapped to).
  - Both flavours build each gap's line+label by **directly reusing**
    `getDistanceGuides/getHorizontalGuide.ts`/`getVerticalGuide.ts` (the distance-guide family)
    rather than reimplementing the "which shape is closer, handle the three overlap cases" logic a
    third time — the band coordinate (the fixed y for a horizontal gap, x for a vertical one) is
    computed per pair with the exact same `(max(...) + min(...)) / 2` formula
    `getHorizontalOverlapGuides.ts`/`getVerticalOverlapGuides.ts` already use, just inlined here since
    the wrapping "side insets" those two add are specific to the Alt-hover distance-measurement visual
    language, not wanted for this guide.
  - `getEqualSpacingGuides.ts` (passive orchestrator) / `getEqualSpacingSnap.ts` (active orchestrator)
    — each combines both axes' results into one `{labels, lines}` (`TDistanceGuideLabel[]`/
    `TDistanceGuideLine[]`, **reused verbatim from `getDistanceGuides/types.ts`**, not a parallel
    type — both are already exactly `{anchor, offsetDirection, text}`/`{dashed, x1, x2, y1, y2}`
    shaped); `getEqualSpacingSnap.ts` additionally returns the combined `{x, y}` delta.
- **Passive trigger**: `resolveEqualSpacingGuides.ts` (`useSelectionTool/utils/handlePointerMove/`) —
  a sibling of `resolveShapeContactGuides.ts`, called right after it in `handlePointerMove.ts`. Same
  per-pointermove `Object.values(nodes)` candidate scan as contact guides (no caching — §27 only
  caches the *alignment-snap* family's own list). **Explicitly no-ops (`return` before touching the
  ref) whenever `dragStateRef.current?.hasMoved`** — a moved drag is `continueDrag.ts`'s case
  entirely now (below); this resolver only still owns resize and Alt-hover.
- **Active trigger**: `getEqualSpacingDragSnap.ts` (`useSelectionTool/utils/handlePointerMove/`,
  called from `continueDrag.ts` right after §24's `getDragAlignmentSnap`) — gated to **exactly one**
  dragged node (`Object.keys(dragState.nodeOrigins).length === 1`) that's `isContactGuideEligibleNode`
  and has a plain `{x, y}` origin (excludes lines/vectors/groups — Smart Selection-style spacing is a
  single-shape-in-a-row concept, same as Figma's own real behaviour, not a whole-selection one). Reads
  the live node's `width`/`height` from the store (a plain move never changes them, only `x`/`y` do,
  so this is safe) to build the shape's alignment-snap-corrected draft rect, then runs
  `getEqualSpacingSnap` against `dragState.candidateShapes`. Its `delta` is added **on top of** the
  alignment-snap delta before the final dispatch — both corrections can apply on the same gesture
  (e.g. top-edge alignment plus left/right equal-spacing simultaneously), each computed from the
  *other's* already-applied correction so they compose rather than fight.
- Both write `refs.transform.equalSpacingGuidesRef` (`TEqualSpacingGuides | null`, new field next to
  `contactGuidesRef` in `TTransformRefs`) — `continueDrag.ts` sets it directly every frame (mirroring
  exactly how it already owns `alignmentGuideRef`), unconditionally (including nulling it when the
  single-node gate isn't met), so a stale guide from a previous gesture never lingers.
- **Cleared** in `disarmEqualSpacingGuides.ts` (`handlePointerUp.ts`, right after
  `disarmShapeContactGuides`), `useSelectionTool.ts`'s `onPointerLeave` and tool-teardown effect —
  same three sites §23's own `contactGuidesRef` cleanup already needed, extended by one line each.
- **Render**: `drawEqualSpacingGuides.ts` (`drawScene.ts`, right after `drawShapeContactGuides`) — a
  solid line per gap (`EQUAL_SPACING_GUIDE_STROKE`) plus `drawValueLabel` per gap
  (`EQUAL_SPACING_GUIDE_LABEL_FILL`) — both new constants, but the same hex (`#ff2fc2`) `VALUE_LABEL_FILL`
  already uses as `drawValueLabel`'s own default fill, since that's this codebase's established
  "pink" for this kind of value-callout, not an invented new color. One draw path serves both the
  passive and active guide, since both are the same `TEqualSpacingGuides` shape.
- **No undo/no store**: purely a render artifact off a ref, like §23/§24 — no reducer, no dispatch;
  the snap *delta* itself flows through the exact same `updateNode`/history machinery any other drag
  already uses, nothing new there either.
- Verified live against the running dev server, both flavours: three rectangles, dragging the middle
  one until its gaps match (guide appears); dragging it to a position a few px short of the ideal
  spot and confirming it visibly snaps in — the drawn numbers match even though the raw pointer
  position didn't, proving the *correction* fired, not just detection of an already-matching state
  (see [[canvas-rendering-pipeline]] for why a live check matters here over trusting the unit suite
  alone: this whole file class is screen-space geometry feeding straight into WebGL draw calls,
  exactly the kind of code the ColorPicker session's postmortem flagged as needing a real render to
  catch what a headless assertion can't).
- No e2e yet — this is intentionally the smallest possible first slice; add
  `e2e/design/selection/equal-spacing-guide.spec.ts` (screenshot-equality against a control scene,
  §24's technique) if/when the feature grows past v1.

## Related

[[design-tool-architecture]] — what happens *before* this: drawing the node in the first place.
[[design-store-architecture]] — §5's ref-vs-Redux split (this subsystem is its biggest consumer: 12
separate drag-state refs plus the marquee/drag-move dispatch-per-pointermove nuance; seven of those —
`cornerRadiusDragRef`/`polygonCornerRadiusDragRef`/`starCornerRadiusDragRef`/`ellipseArcDragRef`/
`ellipseArcRotateDragRef`/`ellipseArcRatioDragRef`/`vectorMultiDragRef` — are now parent-owned like the
ephemeral render refs rather than hook-private, per §13/§19/[[vector-network]] §35).
[[canvas-rendering-pipeline]] — how selection outlines/handles/cursors actually get drawn once this
subsystem decides what's selected/hovered; §2's `marqueeRef`/`hoverRef`/`sliceRef` ref-drilling
pattern is exactly what §13 extends to the three corner-radius drag refs.
[[vector-network]] — §21 above in full: the Pen tool, the Vector Network data model, and the rest of
Vector Edit Mode (double-click entry, Delete/Backspace, the Pen-tool-specific pointer handlers) that
lives outside this subsystem entirely.
[[group-nodes]] — Etap 12a's group-specific layer on top of this subsystem's hit-testing/arm-resolver
mechanics: the click-selects-group-vs-Ctrl-bypasses-to-child rules (§3), and the rigid-body/bounds-sync
invariants a group adds on top of plain multi-select.
[[canvas-vector-performance]] — the frozen-snapshot arm→continue→disarm variant this subsystem's own
drag/resize/rotate resolvers grow into for vector nodes specifically (§4), and why it's a `TCanvasRefs`
snapshot map rather than a Redux dispatch per `pointermove`, same "don't invalidate every downstream
cache on every pointer event" reasoning this doc's own dispatch-per-pointermove nuance already flags
above.
