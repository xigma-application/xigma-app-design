// store
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { wrapInSection } from 'store/design/slice';
import { AppDispatch, store } from 'store';

export const handleWrapSelectionInSection = (dispatch: AppDispatch): void => {
  if (selectVectorEditingNodeIds(store.getState()).length === 0) {
    dispatch(wrapInSection());
  }
};
