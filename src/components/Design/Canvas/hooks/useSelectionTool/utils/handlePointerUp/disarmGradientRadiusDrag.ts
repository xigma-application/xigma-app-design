import { RefObject } from 'react';

// types
import { TGradientRadiusDragState } from 'types/design/canvas/types';

export const disarmGradientRadiusDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  gradientRadiusDragRef: RefObject<TGradientRadiusDragState | null>,
): void => {
  if (gradientRadiusDragRef.current) {
    canvas.releasePointerCapture(event.pointerId);

    setTimeout(() => {
      gradientRadiusDragRef.current = null;
    }, 0);
  }
};
