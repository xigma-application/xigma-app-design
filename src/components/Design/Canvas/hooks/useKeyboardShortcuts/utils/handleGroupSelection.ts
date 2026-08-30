// store
import { groupNodes } from 'store/design/slice';
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

export const handleGroupSelection = (dispatch: AppDispatch): void => {
  if (selectVectorEditingNodeIds(store.getState()).length === 0) {
    dispatch(groupNodes());
  }
};
