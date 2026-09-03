import { RefObject } from 'react';

// store
import { selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TSmartSelectionSwapDragState } from 'types/design/canvas/types';

// utils
import { dispatchSmartSelectionSwapUpdates } from './dispatchSmartSelectionSwapUpdates';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { screenToWorld } from '../../../../utils/screenToWorld';

const getNearestSlotIndex = (slots: TSmartSelectionSwapDragState['slots'], pointX: number, pointY: number): number => {
  let nearestIndex = 0;
  let nearestDistance = Infinity;

  slots.forEach(({ bounds }, index) => {
    const distance = Math.hypot(pointX - (bounds.x + bounds.width / 2), pointY - (bounds.y + bounds.height / 2));

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  });

  return nearestIndex;
};

export const continueSmartSelectionSwapDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  swapDragRef: RefObject<TSmartSelectionSwapDragState | null>,
): void => {
  const dragState = swapDragRef.current;

  if (dragState) {
    dragState.hasMoved = true;

    const worldPoint = screenToWorld(getPointerPosition(canvas, event), selectViewport(store.getState()));
    const targetIndex = getNearestSlotIndex(dragState.slots, worldPoint.x, worldPoint.y);

    if (targetIndex !== dragState.targetIndex) {
      dragState.targetIndex = targetIndex;
      dispatchSmartSelectionSwapUpdates(dispatch, dragState);
    }
  }
};
