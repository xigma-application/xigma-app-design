// types
import { TCanvasRefs } from 'types/design/canvas/types';

export const disarmVectorLassoDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  canvasRefs: TCanvasRefs,
  setClassName: (className: string | null) => void,
): void => {
  if (canvasRefs.vectorLassoPathRef.current) {
    canvasRefs.vectorLassoPathRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
    setClassName(null);
  }
};
