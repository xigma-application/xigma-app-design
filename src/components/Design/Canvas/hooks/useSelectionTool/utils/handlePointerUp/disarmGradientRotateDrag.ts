import { RefObject } from 'react';

// types
import { TGradientRotateDragState } from 'types/design/canvas/types';

export const disarmGradientRotateDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  gradientRotateDragRef: RefObject<TGradientRotateDragState | null>,
): void => {
  if (gradientRotateDragRef.current) {
    canvas.releasePointerCapture(event.pointerId);

    setTimeout(() => {
      gradientRotateDragRef.current = null;
    }, 0);
  }
};
