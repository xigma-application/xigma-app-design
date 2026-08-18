import { RefObject } from 'react';
import { TStarVertexCountDragState } from 'types/design/selectionTool/types';

// types

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
