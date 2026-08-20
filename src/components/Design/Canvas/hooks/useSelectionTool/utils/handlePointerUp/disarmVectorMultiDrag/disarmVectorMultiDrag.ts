import { RefObject } from 'react';

// store
import { AppDispatch } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TVectorMultiDragState } from 'types/design/selectionTool/types';

// utils
import { applyPendingClickAction } from './applyPendingClickAction';

export const disarmVectorMultiDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  canvasRefs: TCanvasRefs,
  vectorMultiDragRef: RefObject<TVectorMultiDragState | null>,
  setClassName: (className: string | null) => void,
): void => {
  const dragState = vectorMultiDragRef.current;

  if (dragState) {
    if (!dragState.hasMoved) {
      applyPendingClickAction(dispatch, canvasRefs, dragState);
    }

    canvas.releasePointerCapture(event.pointerId);
    vectorMultiDragRef.current = null;
    setClassName(null);
  }
};
