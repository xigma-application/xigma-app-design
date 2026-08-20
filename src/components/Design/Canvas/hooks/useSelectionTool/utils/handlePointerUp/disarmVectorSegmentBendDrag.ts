import { RefObject } from 'react';

// store
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TVectorSegmentBendDragState } from 'types/design/selectionTool/types';

// utils
import { commitVectorBendSegment } from '../../../../utils/commitVectorBendSegment';
import { getVectorEditingNode } from '../../../../utils/getVectorEditingNode';

export const disarmVectorSegmentBendDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  canvasRefs: TCanvasRefs,
  vectorSegmentBendDragRef: RefObject<TVectorSegmentBendDragState | null>,
  setClassName: (className: string | null) => void,
): void => {
  const dragState = vectorSegmentBendDragRef.current;

  if (dragState) {
    if (dragState.status === 'pending') {
      const node = getVectorEditingNode(store.getState().design.nodes, dragState.nodeId);

      if (node) {
        commitVectorBendSegment(
          node,
          dragState.candidates[0].segmentId,
          dragState.dragStart,
          dispatch,
          canvasRefs,
          vectorSegmentBendDragRef,
        );
      }
    }

    canvas.releasePointerCapture(event.pointerId);
    vectorSegmentBendDragRef.current = null;
    setClassName(null);
  }
};
