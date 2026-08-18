import { RefObject } from 'react';

// types
import { TEllipseArcDragState } from '../../types';

export const disarmEllipseArcDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  ellipseArcDragRef: RefObject<TEllipseArcDragState | null>,
): void => {
  if (ellipseArcDragRef.current) {
    ellipseArcDragRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
  }
};
