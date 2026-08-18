import { RefObject } from 'react';
import { TPolygonVertexCountDragState } from 'types/design/selectionTool/types';

// types

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
