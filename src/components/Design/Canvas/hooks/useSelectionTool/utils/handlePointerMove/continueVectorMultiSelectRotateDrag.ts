import { RefObject } from 'react';

// store
import { updateNode } from 'store/design/slice';
import { selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TPoint } from 'types/canvas';
import { TVectorMultiSelectRotateDragState } from 'types/design/selectionTool/types';
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { getAngleBetweenPoints } from 'utils/math/getAngleBetweenPoints';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getRotatedRotateCursorUrl } from 'utils/canvas/getRotatedRotateCursorUrl';
import { getVectorEditingNode } from '../../../../utils/getVectorEditingNode';
import { rotatePoint } from 'utils/math/rotatePoint';
import { screenToWorld } from '../../../../utils/screenToWorld';

const ORIGIN: TPoint = { x: 0, y: 0 };

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
    const node = getVectorEditingNode(state.design.nodes, dragState.nodeId);

    if (node) {
      const viewport = selectViewport(state);
      const point = screenToWorld(getPointerPosition(canvas, event), viewport);
      const deltaDegrees = getAngleBetweenPoints(dragState.pivot, point) - dragState.startAngle;

      dragState.deltaDegrees = deltaDegrees;
      canvas.style.cursor = getRotatedRotateCursorUrl(dragState.cursorAngle + deltaDegrees) ?? canvas.style.cursor;

      const vertices = { ...node.vertices, ...rotateVectorVertices(dragState.vertexOrigins, dragState.pivot, deltaDegrees) };
      const segments = rotateVectorHandles(node.segments, dragState.handleOrigins, deltaDegrees);

      dispatch(updateNode({ changes: { segments, vertices }, id: dragState.nodeId }));
    }
  }
};
