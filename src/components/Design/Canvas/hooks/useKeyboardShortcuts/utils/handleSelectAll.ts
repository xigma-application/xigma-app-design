// store
import { setSelection } from 'store/design/slice';
import { selectOrderedNodes } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

export const handleSelectAll = (dispatch: AppDispatch): void => {
  const state = store.getState();

  if (state.design.vectorEditingNodeIds.length === 0) {
    dispatch(setSelection(selectOrderedNodes(state).map((node) => node.id)));
  }
};
