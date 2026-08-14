import { RefObject } from 'react';

// types
import { TPathOffsetDragState } from '../../types';

export const disarmPathOffsetDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  pathOffsetDragRef: RefObject<TPathOffsetDragState | null>,
): void => {
  if (pathOffsetDragRef.current) {
    pathOffsetDragRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
  }
};
