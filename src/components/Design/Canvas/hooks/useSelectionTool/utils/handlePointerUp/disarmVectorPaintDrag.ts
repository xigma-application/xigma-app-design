// store
import { setPaintBlendMode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { BlendMode } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';

export const disarmVectorPaintDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  canvasRefs: TCanvasRefs,
  setClassName: (className: string | null) => void,
): void => {
  if (canvasRefs.vectorPaint.vectorPaintPathRef.current) {
    const wasRemoving = canvasRefs.vectorPaint.isVectorPaintRemoveRef.current;

    canvasRefs.vectorPaint.vectorPaintPathRef.current = null;
    canvasRefs.vectorPaint.touchedVectorPaintLoopKeysRef.current = {};
    canvasRefs.vectorPaint.vectorPaintTouchedFacesRef.current = null;
    canvasRefs.vectorPaint.isVectorPaintRemoveRef.current = false;
    canvas.releasePointerCapture(event.pointerId);
    setClassName('paint');

    if (!wasRemoving) {
      dispatch(setPaintBlendMode(BlendMode.normal));
    }
  }
};
