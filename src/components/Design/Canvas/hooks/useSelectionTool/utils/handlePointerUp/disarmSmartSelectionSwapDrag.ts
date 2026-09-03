import { RefObject } from 'react';

// types
import { TSmartSelectionSwapDragState } from 'types/design/canvas/types';

// utils
import { flushThrottledDispatch } from 'components/Design/Canvas/utils/flushThrottledDispatch';

export const disarmSmartSelectionSwapDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  swapDragRef: RefObject<TSmartSelectionSwapDragState | null>,
): void => {
  const dragState = swapDragRef.current;

  if (dragState) {
    flushThrottledDispatch(dragState.dispatchThrottle);
    swapDragRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
  }
};
