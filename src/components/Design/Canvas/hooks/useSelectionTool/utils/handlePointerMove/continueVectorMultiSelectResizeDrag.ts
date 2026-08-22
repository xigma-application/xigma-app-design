import { RefObject } from 'react';

// store
import { updateNode } from 'store/design/slice';
import { selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TPoint } from 'types/canvas';
import { TVectorMultiSelectResizeDragState } from 'types/design/selectionTool/types';
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getResizeCursorAngle } from 'utils/math/getResizeCursorAngle';
import {
  getScaledVectorMultiSelectBounds,
  getVectorMultiSelectResizeScale,
  repositionRotatedVectorMultiSelectBounds,
} from '../../../../utils/getVectorMultiSelectResizeTransform';
import { getRotatedResizeCursorUrl } from 'utils/canvas/getRotatedResizeCursorUrl';
import { getVectorEditingNode } from '../../../../utils/getVectorEditingNode';
import { rotatePoint } from 'utils/math/rotatePoint';
import { screenToWorld } from '../../../../utils/screenToWorld';

const ORIGIN: TPoint = { x: 0, y: 0 };

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
    const node = getVectorEditingNode(state.design.nodes, dragState.nodeId);

    if (node) {
      const viewport = selectViewport(state);
      const point = screenToWorld(getPointerPosition(canvas, event), viewport);
      const { bounds, handle, rotation } = dragState;
      const { anchor, pivot, scaleX, scaleY } = getVectorMultiSelectResizeScale(bounds, handle, rotation, point);
      const vertices = { ...node.vertices, ...scaleVectorVertices(dragState.vertexOrigins, pivot, rotation, anchor, scaleX, scaleY) };
      const segments = scaleVectorHandles(node.segments, dragState.handleOrigins, rotation, scaleX, scaleY);

      const scaledBounds = getScaledVectorMultiSelectBounds(bounds, anchor, scaleX, scaleY);

      dragState.liveBounds = repositionRotatedVectorMultiSelectBounds(scaledBounds, dragState.anchor, dragState.anchorWorld, rotation);
      canvas.style.cursor = getRotatedResizeCursorUrl(getResizeCursorAngle(handle, rotation)) ?? canvas.style.cursor;
      dispatch(updateNode({ changes: { segments, vertices }, id: dragState.nodeId }));
    }
  }
};
