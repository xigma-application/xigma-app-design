import { RefObject } from 'react';

// types
import { TVectorEraseDragState } from 'types/design/selectionTool/types';

export const disarmVectorEraseDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  vectorEraseDragRef: RefObject<TVectorEraseDragState | null>,
  setClassName: (className: string | null) => void,
): void => {
  if (vectorEraseDragRef.current) {
    canvas.releasePointerCapture(event.pointerId);
    vectorEraseDragRef.current = null;
    setClassName('erase');
  }
};
