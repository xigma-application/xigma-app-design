import { RefObject } from 'react';

// types
import { TSliceMoveDragState } from '../../types';

export const disarmMoveDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  moveDragRef: RefObject<TSliceMoveDragState | null>,
): void => {
  if (moveDragRef.current) {
    moveDragRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
  }
};
