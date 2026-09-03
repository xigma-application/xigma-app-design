import { RefObject } from 'react';

// store
import { AppDispatch } from 'store';

// types
import { TSmartSelectionSwapDragState } from 'types/design/canvas/types';

// utils
import { dispatchSmartSelectionSwapUpdates } from '../handlePointerMove/dispatchSmartSelectionSwapUpdates';
import { flushThrottledDispatch } from 'components/Design/Canvas/utils/flushThrottledDispatch';
import { getReorderedSwapPositions } from 'components/Design/Canvas/utils/getReorderedSwapPositions';

export const disarmSmartSelectionSwapDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  swapDragRef: RefObject<TSmartSelectionSwapDragState | null>,
): void => {
  const dragState = swapDragRef.current;

  if (dragState) {
    const draggedSlot = dragState.slots[dragState.fromIndex];

    if (dragState.hasMoved && draggedSlot.id !== null) {
      const draggedTarget = getReorderedSwapPositions(dragState.slots, dragState.fromIndex, dragState.targetIndex)[draggedSlot.id];

      dispatchSmartSelectionSwapUpdates(
        dispatch,
        dragState,
        (draggedTarget?.x ?? draggedSlot.bounds.x) - draggedSlot.bounds.x,
        (draggedTarget?.y ?? draggedSlot.bounds.y) - draggedSlot.bounds.y,
      );
    }

    flushThrottledDispatch(dragState.dispatchThrottle);
    swapDragRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
  }
};
