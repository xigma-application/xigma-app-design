// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// store
import { AppDispatch } from 'store';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';

// types
import { TGroupNode } from 'types/design/types';

export const commitOnGroups = (dispatch: AppDispatch, groups: TGroupNode[], commitGroup: TFunc<[TGroupNode]>): void => {
  if (groups.length > 0) {
    dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
    groups.forEach(commitGroup);
    dispatch(endHistoryGesture());
  }
};
