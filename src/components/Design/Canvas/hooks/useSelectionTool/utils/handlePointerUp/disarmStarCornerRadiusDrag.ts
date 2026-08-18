import { RefObject } from 'react';
import { TStarCornerRadiusDragState } from 'types/design/canvas/types';

// types

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
