import { RefObject } from 'react';

// types
import { TRotateDragState } from '../../types';

export const disarmRotateDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  rotateDragRef: RefObject<TRotateDragState | null>,
): void => {
  if (rotateDragRef.current) {
    rotateDragRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
  }
};
