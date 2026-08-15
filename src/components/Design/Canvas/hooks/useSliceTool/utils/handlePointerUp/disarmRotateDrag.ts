import { RefObject } from 'react';

// types
import { TSliceRotateDragState } from '../../types';

export const disarmRotateDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  rotateDragRef: RefObject<TSliceRotateDragState | null>,
): void => {
  if (rotateDragRef.current) {
    rotateDragRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
  }
};
