// store
import { bringSelectionToFront } from 'store/design/slice';
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

export const handleBringToFront = (dispatch: AppDispatch): void => {
  if (selectVectorEditingNodeIds(store.getState()).length === 0) {
    dispatch(bringSelectionToFront());
  }
};
