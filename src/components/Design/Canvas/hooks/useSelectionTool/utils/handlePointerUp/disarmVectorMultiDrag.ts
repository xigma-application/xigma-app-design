import { RefObject } from 'react';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TVectorMultiDragState } from 'types/design/selectionTool/types';

const applyPendingClickAction = (canvasRefs: TCanvasRefs, dragState: TVectorMultiDragState): void => {
  const { pendingClickAction } = dragState;

  if (pendingClickAction) {
    switch (pendingClickAction.kind) {
      case 'vertex':
        canvasRefs.selectedVectorVertexIdsRef.current = [pendingClickAction.id];
        canvasRefs.selectedVectorHandlesRef.current = [];
        canvasRefs.selectedVectorSegmentIdsRef.current = [];
        break;
      case 'handle':
        canvasRefs.selectedVectorHandlesRef.current = [{ end: pendingClickAction.end, segmentId: pendingClickAction.segmentId }];
        canvasRefs.selectedVectorVertexIdsRef.current = [];
        canvasRefs.selectedVectorSegmentIdsRef.current = [];
        break;
      case 'segment':
        canvasRefs.selectedVectorSegmentIdsRef.current = [pendingClickAction.id];
        canvasRefs.selectedVectorVertexIdsRef.current = [];
        canvasRefs.selectedVectorHandlesRef.current = [];
        break;
      // no default
    }
  }
};

export const disarmVectorMultiDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  canvasRefs: TCanvasRefs,
  vectorMultiDragRef: RefObject<TVectorMultiDragState | null>,
  setClassName: (className: string | null) => void,
): void => {
  const dragState = vectorMultiDragRef.current;

  if (dragState) {
    if (!dragState.hasMoved) {
      applyPendingClickAction(canvasRefs, dragState);
    }

    canvas.releasePointerCapture(event.pointerId);
    vectorMultiDragRef.current = null;
    setClassName(null);
  }
};
