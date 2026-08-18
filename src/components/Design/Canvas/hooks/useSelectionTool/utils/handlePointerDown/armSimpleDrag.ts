import { RefObject } from 'react';

export const armSimpleDrag = <T>(canvas: HTMLCanvasElement, event: PointerEvent, dragRef: RefObject<T | null>, state: T): void => {
  dragRef.current = state;
  canvas.setPointerCapture(event.pointerId);
};
