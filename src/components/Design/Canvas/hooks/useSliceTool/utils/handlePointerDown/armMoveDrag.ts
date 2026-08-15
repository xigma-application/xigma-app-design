import { RefObject } from 'react';

// types
import { TPoint } from 'types/canvas';
import { TSliceDraft, TSliceMoveDragState } from '../../types';

export const armMoveDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  moveDragRef: RefObject<TSliceMoveDragState | null>,
  origin: TSliceDraft,
  pointerStart: TPoint,
): void => {
  moveDragRef.current = { origin, pointerStart };
  canvas.setPointerCapture(event.pointerId);
};
