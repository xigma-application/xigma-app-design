import { RefObject } from 'react';

// types
import { TStarCornerRadiusDragState } from '../../types';

export const disarmStarCornerRadiusDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  starCornerRadiusDragRef: RefObject<TStarCornerRadiusDragState | null>,
): void => {
  if (starCornerRadiusDragRef.current) {
    starCornerRadiusDragRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
  }
};
