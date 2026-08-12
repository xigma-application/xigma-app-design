import { RefObject } from 'react';

// store
import { setSelection } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TPoint } from 'types/canvas';

export const armMarqueeDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  marqueeStartRef: RefObject<TPoint | null>,
  point: TPoint,
): void => {
  dispatch(setSelection([]));
  marqueeStartRef.current = point;
  canvas.setPointerCapture(event.pointerId);
};
