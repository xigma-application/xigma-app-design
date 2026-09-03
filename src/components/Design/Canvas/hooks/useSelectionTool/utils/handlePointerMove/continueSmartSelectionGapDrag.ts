import { RefObject } from 'react';

// store
import { selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TSmartSelectionGapDragState } from 'types/design/canvas/types';

// utils
import { dispatchSmartSelectionGapUpdates } from './dispatchSmartSelectionGapUpdates';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { screenToWorld } from '../../../../utils/screenToWorld';

export const continueSmartSelectionGapDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  gapDragRef: RefObject<TSmartSelectionGapDragState | null>,
): void => {
  const dragState = gapDragRef.current;

  if (dragState) {
    dragState.hasMoved = true;

    const worldPoint = screenToWorld(getPointerPosition(canvas, event), selectViewport(store.getState()));
    const delta = dragState.axis === 'x' ? worldPoint.x - dragState.pointerStart.x : worldPoint.y - dragState.pointerStart.y;
    const newGap = Math.max(0, dragState.originalGapValue + delta);

    dragState.currentGapValue = newGap;
    dispatchSmartSelectionGapUpdates(dispatch, dragState, newGap);
  }
};
