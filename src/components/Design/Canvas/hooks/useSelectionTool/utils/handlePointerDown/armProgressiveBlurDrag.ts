import { RefObject } from 'react';

// types
import { TProgressiveBlurDragState } from 'types/design/canvas/types';

export const armProgressiveBlurDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dragRef: RefObject<TProgressiveBlurDragState | null>,
  dragState: TProgressiveBlurDragState,
): void => {
  dragRef.current = dragState;
  canvas.setPointerCapture(event.pointerId);
};
