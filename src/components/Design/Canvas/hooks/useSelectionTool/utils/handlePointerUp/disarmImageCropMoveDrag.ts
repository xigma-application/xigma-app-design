import { RefObject } from 'react';

// types
import { TCanvasRefs, TImageCropMoveDragState } from 'types/design/canvas/types';

export const disarmImageCropMoveDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  imageCropMoveDragRef: RefObject<TImageCropMoveDragState | null>,
  canvasRefs: TCanvasRefs,
): void => {
  if (imageCropMoveDragRef.current) {
    canvas.releasePointerCapture(event.pointerId);
    canvasRefs.transform.alignmentGuideRef.current = null;

    setTimeout(() => {
      imageCropMoveDragRef.current = null;
    }, 0);
  }
};
