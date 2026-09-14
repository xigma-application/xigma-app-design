import { RefObject } from 'react';

// types
import { TCanvasRefs, TGradientRotateDragState } from 'types/design/canvas/types';

export const disarmGradientRotateDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  gradientRotateDragRef: RefObject<TGradientRotateDragState | null>,
  canvasRefs: TCanvasRefs,
): void => {
  if (gradientRotateDragRef.current) {
    canvas.releasePointerCapture(event.pointerId);
    canvasRefs.transform.alignmentGuideRef.current = null;

    setTimeout(() => {
      gradientRotateDragRef.current = null;
    }, 0);
  }
};
