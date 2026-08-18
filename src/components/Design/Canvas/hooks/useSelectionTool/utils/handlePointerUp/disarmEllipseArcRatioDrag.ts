import { RefObject } from 'react';
import { TEllipseArcRatioDragState } from 'types/design/canvas/types';

// types

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
