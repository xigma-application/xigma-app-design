import { RefObject } from 'react';

// types
import { TAutoLayoutPaddingDragState } from 'types/design/canvas/types';

export const disarmAutoLayoutPaddingDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  paddingDragRef: RefObject<TAutoLayoutPaddingDragState | null>,
): void => {
  if (paddingDragRef.current) {
    paddingDragRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
  }
};
