// store
import { selectNodes } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { commitVectorWidthPointDrag } from './commitVectorWidthPointDrag';

export const disarmVectorWidthPointDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  canvasRefs: TCanvasRefs,
  setClassName: (className: string | null) => void,
): void => {
  const drag = canvasRefs.vectorWidthPointDragRef.current;

  if (drag) {
    commitVectorWidthPointDrag(dispatch, selectNodes(store.getState()), drag);

    canvasRefs.vectorWidthPointDragRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
    setClassName(null);
  }
};
