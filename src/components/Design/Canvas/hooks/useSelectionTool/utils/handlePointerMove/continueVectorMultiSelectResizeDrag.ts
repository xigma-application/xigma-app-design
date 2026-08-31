import { RefObject } from 'react';

// store
import { updateNode } from 'store/design/slice';
import { selectVectorEditingNodeIds, selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TPoint } from 'types/canvas';
import { TVectorMultiSelectResizeDragState } from 'types/design/selectionTool/types';
import { TSceneNode, TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { dispatchAsOneGestureIfMultiNode } from '../../../../utils/dispatchAsOneGestureIfMultiNode';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getResizeCursorAngle } from 'utils/math/getResizeCursorAngle';
import {
  getScaledVectorMultiSelectBounds,
  getVectorMultiSelectResizeScale,
  repositionRotatedVectorMultiSelectBounds,
} from '../../../../utils/getVectorMultiSelectResizeTransform';
import { getRotatedCursorUrl } from 'utils/canvas/createCursorRotator/getRotatedCursorUrl';
import { getVectorEditingNode } from '../../../../utils/getVectorEditingNode';
import { groupVectorMultiSelectOriginsByNode } from '../../../../utils/groupVectorMultiSelectOriginsByNode';
import { rotatePoint } from 'utils/math/rotatePoint';
import { screenToWorld } from '../../../../utils/screenToWorld';

const ORIGIN: TPoint = { x: 0, y: 0 };

const pickOrigins = (origins: Record<string, TPoint>, ids: string[]): Record<string, TPoint> =>
  Object.fromEntries(ids.map((id) => [id, origins[id]]));

const scaleVectorVertices = (
  origins: Record<string, TPoint>,
  pivot: TPoint,
  rotation: number,
  anchor: { x: number | null; y: number | null },
  scaleX: number,
  scaleY: number,
): Record<string, TVectorVertex> =>
  Object.fromEntries(
    Object.entries(origins).map(([id, origin]) => {
      const local = rotatePoint(origin, pivot, -rotation);
      const scaledLocal = {
        x: anchor.x === null ? local.x : anchor.x + (local.x - anchor.x) * scaleX,
        y: anchor.y === null ? local.y : anchor.y + (local.y - anchor.y) * scaleY,
      };
      const world = rotatePoint(scaledLocal, pivot, rotation);

      return [id, { id, x: Math.round(world.x), y: Math.round(world.y) }];
    }),
  );

const scaleVectorHandles = (
  segments: Record<string, TVectorSegment>,
  handleOrigins: Record<string, TPoint>,
  rotation: number,
  scaleX: number,
  scaleY: number,
): Record<string, TVectorSegment> =>
  Object.entries(handleOrigins).reduce((nextSegments, [key, origin]) => {
    const [end, segmentId] = key.split(':') as ['end' | 'start', string];
    const segment = nextSegments[segmentId];
    const field = end === 'start' ? 'tangentStart' : 'tangentEnd';
    const local = rotatePoint(origin, ORIGIN, -rotation);
    const scaledLocal = { x: local.x * scaleX, y: local.y * scaleY };
    const world = rotatePoint(scaledLocal, ORIGIN, rotation);

    return { ...nextSegments, [segmentId]: { ...segment, [field]: { x: Math.round(world.x), y: Math.round(world.y) } } };
  }, segments);

export const continueVectorMultiSelectResizeDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  vectorMultiSelectResizeDragRef: RefObject<TVectorMultiSelectResizeDragState | null>,
): void => {
  const dragState = vectorMultiSelectResizeDragRef.current;

  if (dragState) {
    const state = store.getState();
    const nodes: Record<string, TSceneNode> = state.design.pages[state.design.activePageId].nodes;
    const vectorEditingNodeIds = selectVectorEditingNodeIds(state);
    const viewport = selectViewport(state);
    const point = screenToWorld(getPointerPosition(canvas, event), viewport);
    const { bounds, handle, rotation } = dragState;
    const { anchor, pivot, scaleX, scaleY } = getVectorMultiSelectResizeScale(bounds, handle, rotation, point);
    const groups = groupVectorMultiSelectOriginsByNode(nodes, vectorEditingNodeIds, dragState.vertexOrigins, dragState.handleOrigins);

    dispatchAsOneGestureIfMultiNode(dispatch, Object.keys(groups).length, () => {
      Object.entries(groups).forEach(([nodeId, group]) => {
        const node = getVectorEditingNode(nodes, nodeId);

        /* v8 ignore if -- groups only ever contains node ids groupVectorMultiSelectOriginsByNode already resolved against this same `nodes` object, so the lookup can't fail here */
        if (node) {
          const vertexOrigins = pickOrigins(dragState.vertexOrigins, group.vertexIds);
          const handleOrigins = pickOrigins(dragState.handleOrigins, group.handleKeys);
          const vertices = { ...node.vertices, ...scaleVectorVertices(vertexOrigins, pivot, rotation, anchor, scaleX, scaleY) };
          const segments = scaleVectorHandles(node.segments, handleOrigins, rotation, scaleX, scaleY);

          dispatch(updateNode({ changes: { segments, vertices }, id: nodeId }));
        }
      });
    });

    const scaledBounds = getScaledVectorMultiSelectBounds(bounds, anchor, scaleX, scaleY);

    dragState.liveBounds = repositionRotatedVectorMultiSelectBounds(scaledBounds, dragState.anchor, dragState.anchorWorld, rotation);
    canvas.style.cursor = getRotatedCursorUrl('resize', getResizeCursorAngle(handle, rotation)) ?? canvas.style.cursor;
  }
};
