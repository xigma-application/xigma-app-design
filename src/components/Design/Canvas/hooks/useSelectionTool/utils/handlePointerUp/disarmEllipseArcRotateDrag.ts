import { RefObject } from 'react';

// types
import { TEllipseArcRotateDragState } from '../../types';

export const disarmEllipseArcRotateDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  ellipseArcRotateDragRef: RefObject<TEllipseArcRotateDragState | null>,
): void => {
  if (ellipseArcRotateDragRef.current) {
    ellipseArcRotateDragRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
  }
};
