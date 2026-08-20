import { RefObject } from 'react';

// store
import { updateNode } from 'store/design/slice';
import { selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TPoint } from 'types/canvas';
import { TVectorMultiDragState } from 'types/design/selectionTool/types';
import { TVectorMultiSelectBox } from 'types/design/canvas/types';
import { TVectorSegment } from 'types/design/types';

// utils
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getVectorEditingNode } from '../../../../utils/getVectorEditingNode';
import { screenToWorld } from '../../../../utils/screenToWorld';
import { translateVectorVertices } from '../../../../utils/translateVectorVertices';

const translateVectorHandles = (
  segments: Record<string, TVectorSegment>,
  handleOrigins: Record<string, TPoint>,
  deltaX: number,
  deltaY: number,
): Record<string, TVectorSegment> =>
  Object.entries(handleOrigins).reduce((nextSegments, [key, origin]) => {
    const [end, segmentId] = key.split(':') as ['end' | 'start', string];
    const segment = nextSegments[segmentId];
    const field = end === 'start' ? 'tangentStart' : 'tangentEnd';

    return {
      ...nextSegments,
      [segmentId]: { ...segment, [field]: { x: Math.round(origin.x + deltaX), y: Math.round(origin.y + deltaY) } },
    };
  }, segments);

export const continueVectorMultiDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  vectorMultiDragRef: RefObject<TVectorMultiDragState | null>,
  vectorMultiSelectBoxRef: RefObject<TVectorMultiSelectBox | null>,
  setClassName: (className: string | null) => void,
): void => {
  const dragState = vectorMultiDragRef.current;

  if (dragState) {
    const state = store.getState();
    const node = getVectorEditingNode(state.design.nodes, dragState.nodeId);

    if (node) {
      dragState.hasMoved = true;

      const point = screenToWorld(getPointerPosition(canvas, event), selectViewport(state));
      const deltaX = point.x - dragState.pointerStart.x;
      const deltaY = point.y - dragState.pointerStart.y;
      const vertices = { ...node.vertices, ...translateVectorVertices(dragState.vertexOrigins, deltaX, deltaY) };
      const segments = translateVectorHandles(node.segments, dragState.handleOrigins, deltaX, deltaY);

      if (dragState.boxOrigin && vectorMultiSelectBoxRef.current) {
        vectorMultiSelectBoxRef.current = {
          ...vectorMultiSelectBoxRef.current,
          bounds: { ...dragState.boxOrigin, x: dragState.boxOrigin.x + deltaX, y: dragState.boxOrigin.y + deltaY },
        };
      }

      dispatch(updateNode({ changes: { segments, vertices }, id: dragState.nodeId }));
      setClassName('move');
    }
  }
};
