import { RefObject } from 'react';
import { TEndpointDragState } from 'types/design/selectionTool/types';

// types

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
