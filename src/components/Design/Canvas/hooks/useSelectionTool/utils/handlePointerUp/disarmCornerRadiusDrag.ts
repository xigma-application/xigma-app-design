import { RefObject } from 'react';

// types
import { TCornerRadiusDragState } from '../../types';

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
