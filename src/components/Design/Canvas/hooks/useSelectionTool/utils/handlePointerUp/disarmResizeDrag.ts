import { RefObject } from 'react';

// store
import { AppDispatch } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TResizeDragState } from 'types/design/selectionTool/types';

// utils
import { commitResizedVectorNodeSnapshots } from './commitResizedVectorNodeSnapshots';

export const disarmResizeDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  resizeDragRef: RefObject<TResizeDragState | null>,
  canvasRefs: TCanvasRefs,
): void => {
  const resizeDragState = resizeDragRef.current;

  if (resizeDragState) {
    commitResizedVectorNodeSnapshots(dispatch, resizeDragState, canvasRefs);
    canvasRefs.resizedNodeIdsRef.current = null;
    resizeDragRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
  }
};
