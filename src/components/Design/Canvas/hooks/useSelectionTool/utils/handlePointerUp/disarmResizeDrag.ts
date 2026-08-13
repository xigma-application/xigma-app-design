import { RefObject } from 'react';

// types
import { TResizeDragState } from '../../types';

export const disarmResizeDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  resizeDragRef: RefObject<TResizeDragState | null>,
): void => {
  if (resizeDragRef.current) {
    resizeDragRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
  }
};
