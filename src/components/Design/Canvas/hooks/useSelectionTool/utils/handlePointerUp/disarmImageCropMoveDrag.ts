import { RefObject } from 'react';

// types
import { TImageCropMoveDragState } from 'types/design/canvas/types';

export const disarmImageCropMoveDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  imageCropMoveDragRef: RefObject<TImageCropMoveDragState | null>,
): void => {
  if (imageCropMoveDragRef.current) {
    canvas.releasePointerCapture(event.pointerId);

    setTimeout(() => {
      imageCropMoveDragRef.current = null;
    }, 0);
  }
};
