import { RefObject } from 'react';
import { TCornerRadiusDragState } from 'types/design/canvas/types';

// types

export const disarmCornerRadiusDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  cornerRadiusDragRef: RefObject<TCornerRadiusDragState | null>,
): void => {
  if (cornerRadiusDragRef.current) {
    cornerRadiusDragRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
  }
};
