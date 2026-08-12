import { RefObject } from 'react';

// types
import { TEndpointDragState } from '../../types';

export const disarmEndpointDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  endpointDragRef: RefObject<TEndpointDragState | null>,
): void => {
  if (endpointDragRef.current) {
    endpointDragRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
  }
};
