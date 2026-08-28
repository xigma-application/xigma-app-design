// store
import { setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { AppDispatch, AppStore } from 'store';

export const appendLastCreatedNodeToSelection = (dispatch: AppDispatch, appStore: AppStore): void => {
  const state = appStore.getState();
  const { rootOrder } = selectActivePage(state);
  const { selectedIds } = state.design;

  dispatch(setSelection([...selectedIds, rootOrder[rootOrder.length - 1]]));
};
