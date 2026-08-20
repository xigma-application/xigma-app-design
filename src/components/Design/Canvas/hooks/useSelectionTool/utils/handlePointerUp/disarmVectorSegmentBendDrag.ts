import { RefObject } from 'react';

// types
import { TVectorSegmentBendDragState } from 'types/design/selectionTool/types';

export const disarmVectorSegmentBendDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  vectorSegmentBendDragRef: RefObject<TVectorSegmentBendDragState | null>,
  setClassName: (className: string | null) => void,
): void => {
  if (vectorSegmentBendDragRef.current) {
    canvas.releasePointerCapture(event.pointerId);
    vectorSegmentBendDragRef.current = null;
    setClassName(null);
  }
};
