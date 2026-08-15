import { RefObject } from 'react';

// types
import { TSliceResizeDragState } from '../../types';

export const disarmResizeDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  resizeDragRef: RefObject<TSliceResizeDragState | null>,
): void => {
  if (resizeDragRef.current) {
    resizeDragRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
  }
};
