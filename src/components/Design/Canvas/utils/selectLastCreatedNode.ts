// store
import { setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { AppDispatch, AppStore } from 'store';

export const selectLastCreatedNode = (dispatch: AppDispatch, appStore: AppStore): void => {
  const { rootOrder } = selectActivePage(appStore.getState());

  dispatch(setSelection([rootOrder[rootOrder.length - 1]]));
};
