# Selection & manipulation

What happens to a node **after** it's drawn: hit-testing, selecting it, moving it, resizing it,
rotating it. The single most complex interactive subsystem in this app — companion to
`design-tool-architecture.md` (how a tool draws a node in the first place).

The roadmap's prose (Etap 5) describes an earlier, simpler shape of this code (one shared
`dragStateRef` with a `pendingClickAction`). That core state machine is still exactly accurate (see
§3), but the file list has grown substantially since Etap 10 added resize/rotate/line-endpoint/
path-text-offset handling as siblings, and since then a corner-radius handle drag joined them too
(see §11) — seven separate drag-state refs, not one, each with its own `arm*`/`continue*`/`disarm*`
files, all funneled through three top-level orchestrators.

## 1. File structure

`Canvas/hooks/useSelectionTool/`:
- `useSelectionTool.ts` — active only when `activeTool === default || activeTool === scale` (the
  **Scale tool fully reuses this hook** — see §5) and text-caret editing isn't active
  (`shouldUseCanvasCaretEditing`). Owns seven refs — `dragStateRef`, `endpointDragRef`,
  `pathOffsetDragRef`, `resizeDragRef`, `rotateDragRef`, `cornerRadiusDragRef`, `marqueeStartRef` —
  and three native `PointerEvent` listeners.
- `types.ts` — `TDragState`, `TEndpointDragState`, `TPathOffsetDragState`, `TResizeDragState`,
  `TRotateDragState`, `TCornerRadiusDragState`, `TPendingClickAction`, `TLineEndpoint`,
  `TNodeOrigin`/`TResizeNodeOrigin`/`TRotateNodeOrigin`.

`utils/handlePointerDown/` — one `arm*.ts` per interaction kind, dispatched by a priority `switch`
in `handlePointerDown.ts` (full table in §3): `armPathOffsetDrag`, `armResizeDrag`,
`armCornerRadiusDrag` (§11), `armRotateDrag`, `armLineEndpointDrag` (→ `armEndpointDrag`),
`armHitDrag` (→ `armDrag`), `armGroupBoundsDrag` (→ `armDrag`), `armMarqueeDrag`.

`utils/handlePointerMove/` — one `continue*.ts` per kind. **All seven run unconditionally on every
pointermove** — `handlePointerMove.ts` just calls all seven in sequence; each is a no-op guarded by
`if (dragState)` on its own ref, so only the one actually armed does anything: `continueDrag`,
`continueEndpointDrag`, `continuePathOffsetDrag`, `continueResizeDrag/` (its own sub-folder, §5),
`continueRotateDrag`, `continueCornerRadiusDrag` (§11), `continueMarqueeDrag`.

`utils/handlePointerUp/` — mirror image, `disarm*.ts` per kind, each clears its own ref and releases
pointer capture: `disarmDrag` (**resolves `pendingClickAction`**, see §3), `disarmEndpointDrag`,
`disarmPathOffsetDrag` (also resets cursor to `'hand'`), `disarmResizeDrag`, `disarmRotateDrag`,
`disarmCornerRadiusDrag`, `disarmMarqueeDrag`.

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
- `isPointInRect.ts` — plain AABB (rectangle/frame/media/default).
- `isPointInEllipse.ts` — normalized `(x/rx)² + (y/ry)² ≤ 1`.
- `isPointInPolygon.ts` / `isPointInStar.ts` — ray-casting over generated vertices, **flip-aware**:
  calls `flipPoint(point, center, flipX, flipY)` before testing (see §8).
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
**Handle priority**: path-offset → resize → corner-radius (§11) → rotate → **line endpoint (only if
not shift)** → shift toggle → plain hit → text-fixed-bounds fallback → group-gap → marquee.
`cornerRadiusHandleHit` is computed as `resizeHandleHit ? null : getCornerRadiusHandleAtPoint(...)`
right where it's read, so resize wins any tie deterministically rather than relying on switch-case
ordering alone. Line-endpoint hit-testing is checked *before* the generic whole-node `hit` branch,
which is why grabbing a line's own endpoint
always wins over a whole-line drag even when both technically match the same point.

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
- `corner-radius.spec.ts` (§11) — handles render only when selected+hovered; pure-left and pure-down
  drags each independently drive the radius to max.

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

## Related

[[design-tool-architecture]] — what happens *before* this: drawing the node in the first place.
[[design-store-architecture]] — §5's ref-vs-Redux split (this subsystem is its biggest consumer: 7
separate drag-state refs plus the marquee/drag-move dispatch-per-pointermove nuance).
[[canvas-rendering-pipeline]] — how selection outlines/handles/cursors actually get drawn once this
subsystem decides what's selected/hovered.
