import { RefObject } from 'react';
import { TResizeDragState } from 'types/design/selectionTool/types';

// types

export const disarmResizeDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  resizeDragRef: RefObject<TResizeDragState | null>,
): void => {
  if (resizeDragRef.current) {
    resizeDragRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
  }
};
