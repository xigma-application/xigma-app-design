import { RefObject } from 'react';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';

export const disarmVectorMarqueeDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  canvasRefs: TCanvasRefs,
  vectorMarqueeStartRef: RefObject<TPoint | null>,
): void => {
  if (vectorMarqueeStartRef.current) {
    vectorMarqueeStartRef.current = null;
    canvasRefs.marqueeRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
  }
};
