// store
import { AppDispatch } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { applyPendingClickAction } from './applyPendingClickAction';

export const disarmVectorMultiDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  canvasRefs: TCanvasRefs,
  setClassName: (className: string | null) => void,
): void => {
  const dragState = canvasRefs.vectorMultiDragRef.current;

  if (dragState) {
    if (!dragState.hasMoved) {
      applyPendingClickAction(dispatch, canvasRefs, dragState);
    }

    canvas.releasePointerCapture(event.pointerId);
    canvasRefs.vectorMultiDragRef.current = null;
    canvasRefs.vectorAlignmentGuideRef.current = null;
    canvasRefs.draggedVectorFillFacesRef.current = null;
    setClassName(null);
  }
};
