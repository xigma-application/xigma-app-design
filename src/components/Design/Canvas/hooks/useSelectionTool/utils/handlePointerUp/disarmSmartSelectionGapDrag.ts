import { RefObject } from 'react';

// types
import { TSmartSelectionGapDragState } from 'types/design/canvas/types';

// utils
import { flushThrottledDispatch } from 'components/Design/Canvas/utils/flushThrottledDispatch';

export const disarmSmartSelectionGapDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  gapDragRef: RefObject<TSmartSelectionGapDragState | null>,
): void => {
  const dragState = gapDragRef.current;

  if (dragState) {
    flushThrottledDispatch(dragState.dispatchThrottle);
    gapDragRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
  }
};
