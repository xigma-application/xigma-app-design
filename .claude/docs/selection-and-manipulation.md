# Selection & manipulation

What happens to a node **after** it's drawn: hit-testing, selecting it, moving it, resizing it,
rotating it. The single most complex interactive subsystem in this app — companion to
`design-tool-architecture.md` (how a tool draws a node in the first place).

The roadmap's prose (Etap 5) describes an earlier, simpler shape of this code (one shared
`dragStateRef` with a `pendingClickAction`). That core state machine is still exactly accurate (see
§3), but the file list has grown substantially since Etap 10 added resize/rotate/line-endpoint/
path-text-offset handling as siblings, and since then three corner-radius handle drags joined them
too (Rectangle, §11; Polygon, §12; Star, §15 — the latter two added as *parallel* mechanisms rather
than sharing Rectangle's, since neither ever has a multi-candidate collision to resolve) — nine
separate drag-state refs, not one, each with its own `arm*`/`continue*`/`disarm*` files, all funneled
through three top-level orchestrators.

## 1. File structure

`Canvas/hooks/useSelectionTool/`:
- `useSelectionTool.ts` — active only when `activeTool === default || activeTool === scale` (the
  **Scale tool fully reuses this hook** — see §5) and text-caret editing isn't active
  (`shouldUseCanvasCaretEditing`). Owns six refs internally — `dragStateRef`, `endpointDragRef`,
  `pathOffsetDragRef`, `resizeDragRef`, `rotateDragRef`, `marqueeStartRef` — and three native
  `PointerEvent` listeners. `cornerRadiusDragRef`/`polygonCornerRadiusDragRef`/`starCornerRadiusDragRef`
  are the odd three out: lifted to `Canvas.tsx` and passed in as parameters (same "parent-owned,
  ref-drilled" shape as `marqueeRef`/`hoverRef`/`sliceRef` — see `canvas-rendering-pipeline.md` §2),
  specifically so `useCanvasRenderLoop` can also read them every frame (§13's "mid-drag zero" fix
  needs to know whether a corner-radius drag is *currently* in progress, which only these three
  refs' own arm/disarm sites can answer).
- `types.ts` — `TDragState`, `TEndpointDragState`, `TPathOffsetDragState`, `TResizeDragState`,
  `TRotateDragState`, `TCornerRadiusDragState`, `TPolygonCornerRadiusDragState`,
  `TStarCornerRadiusDragState`, `TPendingClickAction`, `TLineEndpoint`,
  `TNodeOrigin`/`TResizeNodeOrigin`/`TRotateNodeOrigin`.

`utils/handlePointerDown/` — one `arm*.ts` per interaction kind, dispatched by a priority `switch`
in `handlePointerDown.ts` (full table in §3): `armPathOffsetDrag`, `armResizeDrag`,
`armCornerRadiusDrag` (§11), `armPolygonCornerRadiusDrag` (§12), `armStarCornerRadiusDrag` (§15),
`armRotateDrag`, `armLineEndpointDrag` (→ `armEndpointDrag`), `armHitDrag` (→ `armDrag`),
`armGroupBoundsDrag` (→ `armDrag`), `armMarqueeDrag`.

`utils/handlePointerMove/` — one `continue*.ts` per kind. **All nine run unconditionally on every
pointermove** — `handlePointerMove.ts` just calls all nine in sequence; each is a no-op guarded by
`if (dragState)` on its own ref, so only the one actually armed does anything: `continueDrag`,
`continueEndpointDrag`, `continuePathOffsetDrag`, `continueResizeDrag/` (its own sub-folder, §5),
`continueRotateDrag`, `continueCornerRadiusDrag` (§11), `continuePolygonCornerRadiusDrag` (§12),
`continueStarCornerRadiusDrag` (§15), `continueMarqueeDrag`.

`utils/handlePointerUp/` — mirror image, `disarm*.ts` per kind, each clears its own ref and releases
pointer capture: `disarmDrag` (**resolves `pendingClickAction`**, see §3), `disarmEndpointDrag`,
`disarmPathOffsetDrag` (also resets cursor to `'hand'`), `disarmResizeDrag`, `disarmRotateDrag`,
`disarmCornerRadiusDrag`, `disarmPolygonCornerRadiusDrag`, `disarmStarCornerRadiusDrag`,
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
Topmost-wins via reversing `selectOrderedNodes` (last-drawn = last in `rootOrder` = topmost).

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
- `isPointInEllipse.ts` — normalized `(x/rx)² + (y/ry)² ≤ 1`.
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

`handlePointerDown.ts`'s full priority table (topmost case wins):
```ts
switch (true) {
  case Boolean(pathOffsetHandleHit):                          armPathOffsetDrag(...); break;
  case Boolean(resizeHandleHit):                               armResizeDrag(...); break;
  case Boolean(cornerRadiusHandleHit):                         armCornerRadiusDrag(...); break;
  case Boolean(polygonCornerRadiusHandleHit):                  armPolygonCornerRadiusDrag(...); break;
  case Boolean(starCornerRadiusHandleHit):                     armStarCornerRadiusDrag(...); break;
  case Boolean(rotateHandleHit):                               armRotateDrag(...); break;
  case Boolean(lineEndpointHit) && !event.shiftKey:            armLineEndpointDrag(...); break;
  case Boolean(hit) && event.shiftKey:                         dispatch(setSelection(toggleSelection(currentSelection, hit.id))); break;
  case Boolean(hit):                                           armHitDrag(...); break;
  case !event.shiftKey && isPointInSelectedTextBounds(...):    armHitDrag(canvas, event, dispatch, dragStateRef, selectedNodes[0], ...); break;
  case !event.shiftKey && isPointInGroupBounds(point, selectedNodes): armGroupBoundsDrag(...); break;
  case !event.shiftKey:                                        armMarqueeDrag(...); break;
  default: break;
}
```
**Handle priority**: path-offset → resize → corner-radius (§11) → polygon corner-radius (§12) → star
corner-radius (§15) → rotate → **line endpoint (only if not shift)** → shift toggle → plain hit →
text-fixed-bounds fallback → group-gap → marquee. `cornerRadiusHandleHit`, `polygonCornerRadiusHandleHit`,
and `starCornerRadiusHandleHit` are each computed as `resizeHandleHit ? null : get*CornerRadiusHandleAtPoint(...)`
right where they're read, so resize wins any tie deterministically rather than relying on switch-case
ordering alone — a node is never more than one of Rectangle/Polygon/Star at once, so the three
hit-tests never actually compete with each other, only each independently with resize.
Line-endpoint hit-testing is checked *before* the generic whole-node `hit` branch, which is why
grabbing a line's own endpoint always wins over a whole-line drag even when both technically match
the same point.

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
Checked *before* the generic whole-node `hit` case in §3's priority switch — this is why clicking
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
guarded by `event.buttons === 0` (inert mid-drag), with its own priority switch mirroring
`handlePointerDown`'s hit-test order (line endpoint → path-offset handle → editing-text caret →
resize handle → rotate handle → default node hover). The Scale-vs-plain-resize cursor swap is
decided right here too:
```ts
case Boolean(resizeHandleHit): {
  const getCursorUrl = activeTool === ToolName.scale ? getRotatedScaleCursorUrl : getRotatedResizeCursorUrl;
  canvas.style.cursor = getCursorUrl(getResizeCursorAngle(resizeHandleHit.handle, resizeHandleHit.rotation)) ?? '';
  hoverRef.current = null;
  break;
}
```
`hoverRef` (a ref — pure rendering concern) is only set in the fallback branch (plain node hover, no
handle); `drawHoverOutline.ts` reads it to draw the hover outline without corner handles, separately
from `drawSelectionOutline.ts`.

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
`getSignedScale`/`resizeNode`/...) has its own `test/*.spec.ts` sibling, 100%-coverage granularity.
`useSelectionTool.spec.tsx` (~30 `it` blocks) is effectively the canonical enumeration of the state
machine in §3 — good source list if re-deriving the decision tree from scratch.

e2e (`e2e/pages/design/`):
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
field since there's nothing to disambiguate) and its own `arm*`/`continue*`/`disarm*` trio.

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
- `getPolygonCornerRadiusHandlePosition.ts` — from the top vertex (local/unflipped/unrotated space),
  moved toward the bounding-box center by `cornerRadius * setbackMultiplier` world units (§16). Same
  zero-state zoom-aware offset formula as Rectangle's `getCornerRadiusHandlePositions.ts`
  (`ZERO_RADIUS_HANDLE_OFFSET_PX`/`MIN_RADIUS_HANDLE_GAP_PX`), but the zero-state ceiling is
  `maxRadius * setbackMultiplier`, not `maxRadius` alone, since it's being compared against a setback
  distance, not a raw radius. Deliberately ignores `flipX`/`flipY` — local/unflipped space only, kept
  simple; the render layer stays consistent by not un-flipping either, so hit-test and drawn position
  never disagree with each other even though neither accounts for flip.
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
private `useRef`s, invisible outside the hook) up to `Canvas.tsx`, which now creates them and passes
the *same* ref objects into both `useSelectionTool` (which still arms/disarms them exactly as
before — `armCornerRadiusDrag.ts` et al. are unchanged) and `useCanvasRenderLoop` (new trailing
params) — the same "parent-owned, ref-drilled" shape `Canvas.tsx` already uses for `marqueeRef`/
`hoverRef`/`sliceRef` (`canvas-rendering-pipeline.md` §2), just applied to refs that used to be
selection-tool-private (a third, `starCornerRadiusDragRef`, joined the same way once Star's handle
was added, §15). From there the flag is a plain dereference-and-OR, matching how `hoverRef` etc. get
dereferenced to plain values before reaching `drawScene`:

```
Canvas.tsx: creates cornerRadiusDragRef/polygonCornerRadiusDragRef/starCornerRadiusDragRef via useRef
  → useSelectionTool(canvasRef, marqueeRef, cornerRadiusDragRef, polygonCornerRadiusDragRef, starCornerRadiusDragRef)
      (arms/disarms them exactly as before — no behavior change here)
  → useCanvasRenderLoop(..., cornerRadiusDragRef, polygonCornerRadiusDragRef, starCornerRadiusDragRef)
      → startRenderLoop's tick(): isDraggingCornerRadius =
          Boolean(cornerRadiusDragRef?.current) || Boolean(polygonCornerRadiusDragRef?.current) || Boolean(starCornerRadiusDragRef?.current)
        → drawScene(..., isDraggingCornerRadius)
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
`cornerRadius` (`TStarNode.cornerRadius?: number`) applied to every vertex, same parallel
`armStarCornerRadiusDrag`/`continueStarCornerRadiusDrag`/`disarmStarCornerRadiusDrag` trio and
`TStarCornerRadiusDragState = { bounds, nodeId, points, ratio, rotation }` drag-state shape, same
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

## Related

[[design-tool-architecture]] — what happens *before* this: drawing the node in the first place.
[[design-store-architecture]] — §5's ref-vs-Redux split (this subsystem is its biggest consumer: 9
separate drag-state refs plus the marquee/drag-move dispatch-per-pointermove nuance; three of those —
`cornerRadiusDragRef`/`polygonCornerRadiusDragRef`/`starCornerRadiusDragRef` — are now parent-owned
like the ephemeral render refs rather than hook-private, per §13).
[[canvas-rendering-pipeline]] — how selection outlines/handles/cursors actually get drawn once this
subsystem decides what's selected/hovered; §2's `marqueeRef`/`hoverRef`/`sliceRef` ref-drilling
pattern is exactly what §13 extends to the three corner-radius drag refs.
