// store
import { createMaskGroup } from 'store/design/slice';
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

export const handleUseSelectionAsMask = (dispatch: AppDispatch): void => {
  if (selectVectorEditingNodeIds(store.getState()).length === 0) {
    dispatch(createMaskGroup());
  }
};
