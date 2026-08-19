import { RefObject } from 'react';

// types
import { TVectorVertexDragState } from 'types/design/selectionTool/types';

export const disarmVectorVertexDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  vectorVertexDragRef: RefObject<TVectorVertexDragState | null>,
): void => {
  if (vectorVertexDragRef.current) {
    canvas.releasePointerCapture(event.pointerId);
    vectorVertexDragRef.current = null;
  }
};
