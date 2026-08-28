// types
import { TCanvasRefs } from 'types/design/canvas/types';

export const disarmVectorPaintDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  canvasRefs: TCanvasRefs,
  setClassName: (className: string | null) => void,
): void => {
  if (canvasRefs.vectorPaint.vectorPaintPathRef.current) {
    canvasRefs.vectorPaint.vectorPaintPathRef.current = null;
    canvasRefs.vectorPaint.touchedVectorPaintLoopKeysRef.current = {};
    canvasRefs.vectorPaint.vectorPaintTouchedFacesRef.current = null;
    canvasRefs.vectorPaint.isVectorPaintRemoveRef.current = false;
    canvas.releasePointerCapture(event.pointerId);
    setClassName('paint');
  }
};
