import { RefObject } from 'react';

// types
import { TAutoLayoutGapDragState } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';

export const armAutoLayoutGapDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  gapDragRef: RefObject<TAutoLayoutGapDragState | null>,
  axis: 'horizontal' | 'vertical',
  frameId: string,
  originalGapValue: number,
  point: TPoint,
): void => {
  gapDragRef.current = { axis, frameId, originalGapValue, point, pointerStart: point };
  canvas.setPointerCapture(event.pointerId);
};
