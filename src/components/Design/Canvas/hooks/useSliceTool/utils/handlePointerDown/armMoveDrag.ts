import { RefObject } from 'react';

// types
import { TPoint } from 'types/canvas';
import { TSliceMoveDragState } from '../../types';
import { TSliceDraft } from 'types/design/canvas/types';

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
