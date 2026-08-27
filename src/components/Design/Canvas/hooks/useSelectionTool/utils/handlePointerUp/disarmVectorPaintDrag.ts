// types
import { TCanvasRefs } from 'types/design/canvas/types';

export const disarmVectorPaintDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  canvasRefs: TCanvasRefs,
  setClassName: (className: string | null) => void,
): void => {
  if (canvasRefs.vectorPaintPathRef.current) {
    canvasRefs.vectorPaintPathRef.current = null;
    canvasRefs.touchedVectorPaintLoopKeysRef.current = {};
    canvasRefs.vectorPaintTouchedFacesRef.current = null;
    canvasRefs.isVectorPaintRemoveRef.current = false;
    canvas.releasePointerCapture(event.pointerId);
    setClassName('paint');
  }
};
