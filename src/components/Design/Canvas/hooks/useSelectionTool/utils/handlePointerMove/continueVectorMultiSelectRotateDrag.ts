import { RefObject } from 'react';

// store
import { updateNode } from 'store/design/slice';
import { selectVectorEditingNodeIds, selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TPoint } from 'types/canvas';
import { TVectorMultiSelectRotateDragState } from 'types/design/selectionTool/types';
import { TSceneNode, TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { dispatchAsOneGestureIfMultiNode } from '../../../../utils/dispatchAsOneGestureIfMultiNode';
import { getAngleBetweenPoints } from 'utils/math/getAngleBetweenPoints';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getRotatedCursorUrl } from 'utils/canvas/createCursorRotator/getRotatedCursorUrl';
import { getVectorEditingNode } from '../../../../utils/getVectorEditingNode';
import { groupVectorMultiSelectOriginsByNode } from '../../../../utils/groupVectorMultiSelectOriginsByNode';
import { rotatePoint } from 'utils/math/rotatePoint';
import { screenToWorld } from '../../../../utils/screenToWorld';

const ORIGIN: TPoint = { x: 0, y: 0 };

const pickOrigins = (origins: Record<string, TPoint>, ids: string[]): Record<string, TPoint> =>
  Object.fromEntries(ids.map((id) => [id, origins[id]]));

const rotateVectorVertices = (origins: Record<string, TPoint>, pivot: TPoint, deltaDegrees: number): Record<string, TVectorVertex> =>
  Object.fromEntries(
    Object.entries(origins).map(([id, origin]) => {
      const rotated = rotatePoint(origin, pivot, deltaDegrees);

      return [id, { id, x: Math.round(rotated.x), y: Math.round(rotated.y) }];
    }),
  );

const rotateVectorHandles = (
  segments: Record<string, TVectorSegment>,
  handleOrigins: Record<string, TPoint>,
  deltaDegrees: number,
): Record<string, TVectorSegment> =>
  Object.entries(handleOrigins).reduce((nextSegments, [key, origin]) => {
    const [end, segmentId] = key.split(':') as ['end' | 'start', string];
    const segment = nextSegments[segmentId];
    const field = end === 'start' ? 'tangentStart' : 'tangentEnd';
    const rotated = rotatePoint(origin, ORIGIN, deltaDegrees);

    return { ...nextSegments, [segmentId]: { ...segment, [field]: { x: Math.round(rotated.x), y: Math.round(rotated.y) } } };
  }, segments);

export const continueVectorMultiSelectRotateDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  vectorMultiSelectRotateDragRef: RefObject<TVectorMultiSelectRotateDragState | null>,
): void => {
  const dragState = vectorMultiSelectRotateDragRef.current;

  if (dragState) {
    const state = store.getState();
    const nodes: Record<string, TSceneNode> = state.design.pages[state.design.activePageId].nodes;
    const vectorEditingNodeIds = selectVectorEditingNodeIds(state);
    const viewport = selectViewport(state);
    const point = screenToWorld(getPointerPosition(canvas, event), viewport);
    const deltaDegrees = getAngleBetweenPoints(dragState.pivot, point) - dragState.startAngle;

    dragState.deltaDegrees = deltaDegrees;
    canvas.style.cursor = getRotatedCursorUrl('rotate', dragState.cursorAngle + deltaDegrees) ?? canvas.style.cursor;

    const groups = groupVectorMultiSelectOriginsByNode(nodes, vectorEditingNodeIds, dragState.vertexOrigins, dragState.handleOrigins);

    dispatchAsOneGestureIfMultiNode(dispatch, Object.keys(groups).length, () => {
      Object.entries(groups).forEach(([nodeId, group]) => {
        const node = getVectorEditingNode(nodes, nodeId);

        /* v8 ignore if -- groups only ever contains node ids groupVectorMultiSelectOriginsByNode already resolved against this same `nodes` object, so the lookup can't fail here */
        if (node) {
          const vertexOrigins = pickOrigins(dragState.vertexOrigins, group.vertexIds);
          const handleOrigins = pickOrigins(dragState.handleOrigins, group.handleKeys);
          const vertices = { ...node.vertices, ...rotateVectorVertices(vertexOrigins, dragState.pivot, deltaDegrees) };
          const segments = rotateVectorHandles(node.segments, handleOrigins, deltaDegrees);

          dispatch(updateNode({ changes: { segments, vertices }, id: nodeId }));
        }
      });
    });
  }
};
