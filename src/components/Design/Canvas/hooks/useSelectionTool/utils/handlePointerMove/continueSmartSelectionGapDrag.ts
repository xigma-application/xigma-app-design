import { RefObject } from 'react';

// others
import { SMART_SELECTION_GAP_SHIFT_SNAP_STEP_PX } from 'constant/canvas';

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
    const pointerDelta = dragState.axis === 'x' ? worldPoint.x - dragState.pointerStart.x : worldPoint.y - dragState.pointerStart.y;
    const draggedGapMidpointShiftPerGapUnit = dragState.gapIndex + 0.5;
    const rawGap = Math.max(0, dragState.originalGapValue + pointerDelta / draggedGapMidpointShiftPerGapUnit);
    const newGap = event.shiftKey
      ? Math.round(rawGap / SMART_SELECTION_GAP_SHIFT_SNAP_STEP_PX) * SMART_SELECTION_GAP_SHIFT_SNAP_STEP_PX
      : rawGap;

    dragState.badgeAnchor = worldPoint;
    dragState.currentGapValue = newGap;
    dispatchSmartSelectionGapUpdates(dispatch, dragState, newGap);
  }
};
