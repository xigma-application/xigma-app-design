import { RefObject } from 'react';

// types
import { TAutoLayoutGapDragState } from 'types/design/canvas/types';

export const disarmAutoLayoutGapDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  gapDragRef: RefObject<TAutoLayoutGapDragState | null>,
): void => {
  if (gapDragRef.current) {
    gapDragRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
  }
};
