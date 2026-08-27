// store
import { selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';

// utils
import { commitVectorErase } from '../../commitVectorErase';

export const disarmVectorEraseDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  canvasRefs: TCanvasRefs,
  selectionRefs: TSelectionToolRefs,
  setClassName: (className: string | null) => void,
): void => {
  const strokePath = canvasRefs.vectorEraseStrokeRef.current;

  if (selectionRefs.vectorEraseDragRef.current && strokePath) {
    const radius = canvasRefs.eraserDiameterRef.current / 2 / selectViewport(store.getState()).zoom;

    commitVectorErase(dispatch, strokePath, radius);
    canvas.releasePointerCapture(event.pointerId);
    selectionRefs.vectorEraseDragRef.current = null;
    canvasRefs.vectorEraseStrokeRef.current = null;
    setClassName('erase');
  }
};
