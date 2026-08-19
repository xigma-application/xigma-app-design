import { RefObject } from 'react';

// types
import { TVectorHandleDragState } from 'types/design/selectionTool/types';

export const disarmVectorHandleDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  vectorHandleDragRef: RefObject<TVectorHandleDragState | null>,
): void => {
  if (vectorHandleDragRef.current) {
    canvas.releasePointerCapture(event.pointerId);
    vectorHandleDragRef.current = null;
  }
};
