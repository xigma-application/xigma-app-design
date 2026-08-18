import { RefObject } from 'react';
import { TRotateDragState } from 'types/design/selectionTool/types';

// types

export const disarmRotateDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  rotateDragRef: RefObject<TRotateDragState | null>,
): void => {
  if (rotateDragRef.current) {
    rotateDragRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
  }
};
