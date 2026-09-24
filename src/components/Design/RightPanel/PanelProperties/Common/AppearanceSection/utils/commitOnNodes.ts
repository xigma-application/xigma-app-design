// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// store
import { AppDispatch } from 'store';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';

export const commitOnNodes = <TNode>(dispatch: AppDispatch, nodes: TNode[], commit: TFunc<[TNode]>): void => {
  if (nodes.length > 1) {
    dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
    nodes.forEach(commit);
    dispatch(endHistoryGesture());
  } else {
    nodes.forEach(commit);
  }
};
