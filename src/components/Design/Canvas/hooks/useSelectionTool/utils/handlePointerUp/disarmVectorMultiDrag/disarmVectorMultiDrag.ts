// store
import { AppDispatch } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { applyPendingClickAction } from './applyPendingClickAction';
import { flushThrottledDispatch } from 'components/Design/Canvas/utils/flushThrottledDispatch';

export const disarmVectorMultiDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  canvasRefs: TCanvasRefs,
  setClassName: (className: string | null) => void,
): void => {
  const dragState = canvasRefs.vectorMultiSelect.vectorMultiDragRef.current;

  if (dragState) {
    flushThrottledDispatch(dragState.dispatchThrottle);

    if (!dragState.hasMoved) {
      applyPendingClickAction(dispatch, canvasRefs, dragState);
    }

    canvas.releasePointerCapture(event.pointerId);
    canvasRefs.vectorMultiSelect.vectorMultiDragRef.current = null;
    canvasRefs.vectorEdit.vectorAlignmentGuideRef.current = null;
    canvasRefs.vectorSnapshots.draggedVectorFillFacesRef.current = null;
    setClassName(null);
  }
};
