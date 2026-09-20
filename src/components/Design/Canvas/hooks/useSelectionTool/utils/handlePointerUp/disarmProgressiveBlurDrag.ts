import { RefObject } from 'react';

// types
import { TCanvasRefs, TProgressiveBlurDragState } from 'types/design/canvas/types';

export const disarmProgressiveBlurDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dragRef: RefObject<TProgressiveBlurDragState | null>,
  canvasRefs: TCanvasRefs,
): void => {
  if (dragRef.current) {
    canvas.releasePointerCapture(event.pointerId);
    canvasRefs.transform.alignmentGuideRef.current = null;

    setTimeout(() => {
      dragRef.current = null;
    }, 0);
  }
};
