import { RefObject } from 'react';

// types
import { TAutoLayoutPaddingDragState } from 'types/design/canvas/types';
import { TAutoLayoutPaddingSide } from 'utils/canvas/autoLayoutPadding/types';
import { TPoint } from 'types/canvas';

export const armAutoLayoutPaddingDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  paddingDragRef: RefObject<TAutoLayoutPaddingDragState | null>,
  side: TAutoLayoutPaddingSide,
  frameId: string,
  originalPaddingValue: number,
  point: TPoint,
): void => {
  paddingDragRef.current = {
    frameId,
    mode: originalPaddingValue === 0 ? 'absolute' : 'delta',
    originalPaddingValue,
    point,
    pointerStart: point,
    side,
  };
  canvas.setPointerCapture(event.pointerId);
};
