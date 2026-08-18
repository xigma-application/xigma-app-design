import { RefObject } from 'react';
import { TEllipseArcDragState } from 'types/design/canvas/types';

// types

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
