import { RefObject } from 'react';
import { TPathOffsetDragState } from 'types/design/selectionTool/types';

// types

export const disarmPathOffsetDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  pathOffsetDragRef: RefObject<TPathOffsetDragState | null>,
  setClassName: (className: string | null) => void,
): void => {
  if (pathOffsetDragRef.current) {
    pathOffsetDragRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
    setClassName('hand');
  }
};
