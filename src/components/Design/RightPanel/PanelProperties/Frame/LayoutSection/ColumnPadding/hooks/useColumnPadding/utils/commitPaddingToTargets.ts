// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// store
import { AppDispatch } from 'store';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';

// types
import { TPaddingPatch, TPaddingTarget } from '../types';

// utils
import { commitPaddingChange } from './commitPaddingChange';

export const commitPaddingToTargets = (
  dispatch: AppDispatch,
  targets: TPaddingTarget[],
  getPatch: TFunc<[TPaddingTarget], TPaddingPatch>,
): void => {
  if (targets.length > 1) {
    dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
    targets.forEach((target) => commitPaddingChange(dispatch, target.id, getPatch(target)));
    dispatch(endHistoryGesture());
  } else {
    targets.forEach((target) => commitPaddingChange(dispatch, target.id, getPatch(target)));
  }
};
