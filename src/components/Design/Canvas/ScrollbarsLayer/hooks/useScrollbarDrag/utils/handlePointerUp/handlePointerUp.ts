import { RefObject } from 'react';

// types
import { TDragAnchor } from '../../types';
import { TFrozenAxisRange } from '../../../../types';

export const handlePointerUp = (
  thumb: HTMLDivElement,
  event: PointerEvent,
  frozenRangeRef: RefObject<TFrozenAxisRange>,
  draggingRef: RefObject<boolean>,
  anchorRef: RefObject<TDragAnchor | null>,
): void => {
  anchorRef.current = null;
  frozenRangeRef.current = null;
  draggingRef.current = false;
  thumb.releasePointerCapture(event.pointerId);
};
