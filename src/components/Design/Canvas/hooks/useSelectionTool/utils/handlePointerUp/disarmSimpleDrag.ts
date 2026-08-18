import { RefObject } from 'react';

export const disarmSimpleDrag = <T>(canvas: HTMLCanvasElement, event: PointerEvent, dragRef: RefObject<T | null>): void => {
  if (dragRef.current) {
    dragRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
  }
};
