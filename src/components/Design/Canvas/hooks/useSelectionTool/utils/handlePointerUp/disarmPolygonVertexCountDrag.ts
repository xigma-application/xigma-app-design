import { RefObject } from 'react';

// types
import { TPolygonVertexCountDragState } from '../../types';

export const disarmPolygonVertexCountDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  polygonVertexCountDragRef: RefObject<TPolygonVertexCountDragState | null>,
): void => {
  if (polygonVertexCountDragRef.current) {
    polygonVertexCountDragRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
  }
};
