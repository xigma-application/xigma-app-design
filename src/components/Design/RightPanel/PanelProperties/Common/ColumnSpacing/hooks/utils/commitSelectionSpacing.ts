// store
import { AppDispatch } from 'store';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// types
import { TSpacingAxis } from '../../types';

// utils
import { applySelectionSpacing } from './applySelectionSpacing';

export const commitSelectionSpacing = (dispatch: AppDispatch, groupIds: string[][], axis: TSpacingAxis, gap: number): void => {
  dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
  applySelectionSpacing(dispatch, groupIds, axis, gap);
  dispatch(endHistoryGesture());
};
