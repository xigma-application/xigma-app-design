import { RefObject } from 'react';

// types
import { TVectorMultiDragState } from 'types/design/selectionTool/types';

export const disarmVectorMultiDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  vectorMultiDragRef: RefObject<TVectorMultiDragState | null>,
  setClassName: (className: string | null) => void,
): void => {
  if (vectorMultiDragRef.current) {
    canvas.releasePointerCapture(event.pointerId);
    vectorMultiDragRef.current = null;
    setClassName(null);
  }
};
