import { RefObject } from 'react';

// store
import { endHistoryGesture } from 'store/history/actions';
import { AppDispatch } from 'store';

// types
import { TPenDragOrigin } from '../../types';
import { TPoint } from 'types/canvas';

export const handlePointerCancel = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  dragOriginRef: RefObject<TPenDragOrigin | null>,
  dragStartRef: RefObject<TPoint | null>,
  penDraggedHandlePositionRef: RefObject<TPoint | null>,
): void => {
  dragOriginRef.current = null;
  dragStartRef.current = null;
  penDraggedHandlePositionRef.current = null;
  canvas.releasePointerCapture(event.pointerId);
  dispatch(endHistoryGesture());
};
