import { RefObject } from 'react';

// types
import { MouseButton } from 'types/enums';
import { TPoint } from 'types/canvas';

// utils
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';

export const handlePointerDown = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  lastPointRef: RefObject<TPoint | null>,
  setClassName: (className: string | null) => void,
): void => {
  if (event.button === MouseButton.primary) {
    lastPointRef.current = getPointerPosition(canvas, event);
    canvas.setPointerCapture(event.pointerId);
    setClassName('pressing');
  }
};
