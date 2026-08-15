import { RefObject } from 'react';

// types
import { TPoint } from 'types/canvas';
import { TSliceDrawDragState } from '../../types';

export const armDrawDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  drawDragRef: RefObject<TSliceDrawDragState | null>,
  start: TPoint,
): void => {
  drawDragRef.current = { start };
  canvas.setPointerCapture(event.pointerId);
};
