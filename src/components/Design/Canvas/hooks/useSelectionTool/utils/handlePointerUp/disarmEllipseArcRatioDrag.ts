import { RefObject } from 'react';

// types
import { TEllipseArcRatioDragState } from '../../types';

export const disarmEllipseArcRatioDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  ellipseArcRatioDragRef: RefObject<TEllipseArcRatioDragState | null>,
): void => {
  if (ellipseArcRatioDragRef.current) {
    ellipseArcRatioDragRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
  }
};
