// types
import { TCanvasRefs } from 'types/design/canvas/types';

export const disarmVectorLassoDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  canvasRefs: TCanvasRefs,
  setClassName: (className: string | null) => void,
): void => {
  if (canvasRefs.lassoMarquee.vectorLassoPathRef.current) {
    canvasRefs.lassoMarquee.vectorLassoPathRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
    setClassName(null);
  }
};
