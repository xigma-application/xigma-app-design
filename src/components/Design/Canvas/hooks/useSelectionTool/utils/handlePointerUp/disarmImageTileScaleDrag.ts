import { RefObject } from 'react';

// types
import { TImageTileScaleDragState } from 'types/design/canvas/types';

export const disarmImageTileScaleDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  imageTileScaleDragRef: RefObject<TImageTileScaleDragState | null>,
): void => {
  if (imageTileScaleDragRef.current) {
    canvas.releasePointerCapture(event.pointerId);

    setTimeout(() => {
      imageTileScaleDragRef.current = null;
    }, 0);
  }
};
