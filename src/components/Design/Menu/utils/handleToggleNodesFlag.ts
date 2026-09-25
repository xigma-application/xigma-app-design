// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { selectNodes } from 'store/design/selectors';
import { toggleNodeHidden, toggleNodeLocked } from 'store/design/slice';
import { AppDispatch, store } from 'store';

const setNodesFlag = (dispatch: AppDispatch, ids: string[], flag: 'hidden' | 'locked', nextValue: boolean): void => {
  const toggle = flag === 'hidden' ? toggleNodeHidden : toggleNodeLocked;

  ids.forEach((id) => {
    const node = selectNodes(store.getState())[id];

    if (node && Boolean(node[flag]) !== nextValue) {
      dispatch(toggle(id));
    }
  });
};

export const handleToggleNodesFlag = (dispatch: AppDispatch, ids: string[], flag: 'hidden' | 'locked'): void => {
  const nextValue = !ids.every((id) => Boolean(selectNodes(store.getState())[id]?.[flag]));

  dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
  setNodesFlag(dispatch, ids, flag, nextValue);
  dispatch(endHistoryGesture());
};
