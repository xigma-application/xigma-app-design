import { RefObject } from 'react';

// types
import { TDraftRect, TPoint } from 'types/canvas';

export const disarmMarqueeDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  marqueeStartRef: RefObject<TPoint | null>,
  marqueeRef: RefObject<TDraftRect | null>,
): void => {
  if (marqueeStartRef.current) {
    marqueeStartRef.current = null;
    marqueeRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
  }
};
