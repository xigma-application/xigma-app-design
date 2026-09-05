import { RefObject } from 'react';

// types
import { TPoint } from 'types/canvas';

export const handlePointerUp = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  lastPointRef: RefObject<TPoint | null>,
  setClassName: (className: string | null) => void,
): void => {
  if (lastPointRef.current) {
    lastPointRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
    setClassName('hand');
  }
};
