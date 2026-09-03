// store
import { AppDispatch } from 'store';

// types
import { TSmartSelectionGapDragState } from 'types/design/canvas/types';

// utils
import { applySmartSelectionGapCascade } from '../../../../utils/applySmartSelectionGapCascade';
import { scheduleThrottledDispatch } from 'components/Design/Canvas/utils/scheduleThrottledDispatch';

export const dispatchSmartSelectionGapUpdates = (dispatch: AppDispatch, dragState: TSmartSelectionGapDragState, newGap: number): void => {
  scheduleThrottledDispatch(dragState.dispatchThrottle, () => {
    applySmartSelectionGapCascade(dispatch, dragState, dragState.axis, dragState.nodeOrigins, newGap);
  });
};
