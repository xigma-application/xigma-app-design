import { RefObject } from 'react';

// types
import { TPoint } from 'types/canvas';

export const clearVectorSegmentHover = (
  event: PointerEvent,
  hoveredVectorSegmentIdRef: RefObject<string | null>,
  hoveredVectorEdgeInsertPointRef: RefObject<TPoint | null>,
): void => {
  hoveredVectorSegmentIdRef.current = null;

  if (event.buttons === 0) {
    hoveredVectorEdgeInsertPointRef.current = null;
  }
};
