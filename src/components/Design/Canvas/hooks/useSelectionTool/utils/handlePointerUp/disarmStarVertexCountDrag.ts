import { RefObject } from 'react';

// types
import { TStarVertexCountDragState } from '../../types';

export const disarmStarVertexCountDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  starVertexCountDragRef: RefObject<TStarVertexCountDragState | null>,
): void => {
  if (starVertexCountDragRef.current) {
    starVertexCountDragRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
  }
};
