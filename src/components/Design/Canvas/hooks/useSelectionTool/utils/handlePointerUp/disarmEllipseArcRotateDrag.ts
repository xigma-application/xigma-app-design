import { RefObject } from 'react';
import { TEllipseArcRotateDragState } from 'types/design/canvas/types';

// types

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
