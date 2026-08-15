// store
import { setSelection } from 'store/design/slice';
import { AppDispatch, AppStore } from 'store';

export const appendLastCreatedNodeToSelection = (dispatch: AppDispatch, appStore: AppStore): void => {
  const { rootOrder, selectedIds } = appStore.getState().design;

  dispatch(setSelection([...selectedIds, rootOrder[rootOrder.length - 1]]));
};
