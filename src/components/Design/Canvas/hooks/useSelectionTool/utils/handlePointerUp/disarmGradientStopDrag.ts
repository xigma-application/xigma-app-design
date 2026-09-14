import { RefObject } from 'react';

// types
import { TGradientStopDragState } from 'types/design/canvas/types';

export const disarmGradientStopDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  gradientStopDragRef: RefObject<TGradientStopDragState | null>,
): void => {
  if (gradientStopDragRef.current) {
    canvas.releasePointerCapture(event.pointerId);

    setTimeout(() => {
      gradientStopDragRef.current = null;
    }, 0);
  }
};
