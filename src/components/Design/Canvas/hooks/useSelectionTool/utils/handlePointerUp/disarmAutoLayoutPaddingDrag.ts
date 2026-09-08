import { RefObject } from 'react';

// store
import { startAutoLayoutPaddingEdit } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TAutoLayoutPaddingDragState } from 'types/design/canvas/types';

export const disarmAutoLayoutPaddingDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  paddingDragRef: RefObject<TAutoLayoutPaddingDragState | null>,
): void => {
  const dragState = paddingDragRef.current;

  if (dragState) {
    if (!dragState.hasMoved) {
      dispatch(startAutoLayoutPaddingEdit({ frameId: dragState.frameId, point: dragState.point, side: dragState.side }));
    }

    paddingDragRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
  }
};
