import { RefObject } from 'react';

// types
import { TImageCropRotateDragState } from 'types/design/canvas/types';

export const disarmImageCropRotateDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  imageCropRotateDragRef: RefObject<TImageCropRotateDragState | null>,
): void => {
  if (imageCropRotateDragRef.current) {
    canvas.releasePointerCapture(event.pointerId);

    setTimeout(() => {
      imageCropRotateDragRef.current = null;
    }, 0);
  }
};
