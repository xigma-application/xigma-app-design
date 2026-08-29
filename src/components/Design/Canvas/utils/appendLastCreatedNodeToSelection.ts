// store
import { setSelection } from 'store/design/slice';
import { selectActivePage, selectSelectedIds } from 'store/design/selectors';
import { AppDispatch, AppStore } from 'store';

export const appendLastCreatedNodeToSelection = (dispatch: AppDispatch, appStore: AppStore): void => {
  const state = appStore.getState();
  const { rootOrder } = selectActivePage(state);
  const selectedIds = selectSelectedIds(state);

  dispatch(setSelection([...selectedIds, rootOrder[rootOrder.length - 1]]));
};
