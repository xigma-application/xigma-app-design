import { RefObject } from 'react';

// store
import { AppDispatch } from 'store';

// types
import { TSmartSelectionGapDragState } from 'types/design/canvas/types';

// utils
import { flushThrottledDispatch } from 'components/Design/Canvas/utils/flushThrottledDispatch';
import { resyncSmartSelectionGapAutoLayout } from './resyncSmartSelectionGapAutoLayout';

export const disarmSmartSelectionGapDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  gapDragRef: RefObject<TSmartSelectionGapDragState | null>,
): void => {
  const dragState = gapDragRef.current;

  if (dragState) {
    flushThrottledDispatch(dragState.dispatchThrottle);
    resyncSmartSelectionGapAutoLayout(dispatch, dragState);
    gapDragRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
  }
};
