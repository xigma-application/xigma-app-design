import { RefObject } from 'react';

// types
import { TCanvasRefs, TGradientEndpointMoveDragState } from 'types/design/canvas/types';

export const disarmGradientEndpointMoveDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  gradientEndpointMoveDragRef: RefObject<TGradientEndpointMoveDragState | null>,
  canvasRefs: TCanvasRefs,
): void => {
  if (gradientEndpointMoveDragRef.current) {
    canvas.releasePointerCapture(event.pointerId);
    canvasRefs.transform.alignmentGuideRef.current = null;

    setTimeout(() => {
      gradientEndpointMoveDragRef.current = null;
    }, 0);
  }
};
