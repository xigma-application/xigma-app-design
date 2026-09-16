import { RefObject } from 'react';

// types
import { TImageCropResizeDragState } from 'types/design/canvas/types';

export const disarmImageCropResizeDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  imageCropResizeDragRef: RefObject<TImageCropResizeDragState | null>,
): void => {
  if (imageCropResizeDragRef.current) {
    canvas.releasePointerCapture(event.pointerId);

    setTimeout(() => {
      imageCropResizeDragRef.current = null;
    }, 0);
  }
};
