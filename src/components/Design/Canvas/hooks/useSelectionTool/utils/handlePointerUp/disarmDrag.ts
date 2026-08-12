import { RefObject } from 'react';

// store
import { setSelection } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TDragState } from '../../types';

export const disarmDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  dragStateRef: RefObject<TDragState | null>,
): void => {
  const dragState = dragStateRef.current;

  if (dragState) {
    const { hasMoved, pendingClickAction } = dragState;

    if (pendingClickAction?.kind === 'collapse' && !hasMoved) {
      dispatch(setSelection([pendingClickAction.id]));
    } else if (pendingClickAction?.kind === 'deselect' && !hasMoved) {
      dispatch(setSelection([]));
    }

    dragStateRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
  }
};
