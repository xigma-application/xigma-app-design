// store
import { setSelection } from 'store/design/slice';
import { AppDispatch, AppStore } from 'store';

export const selectLastCreatedNode = (dispatch: AppDispatch, appStore: AppStore): void => {
  const { rootOrder } = appStore.getState().design;

  dispatch(setSelection([rootOrder[rootOrder.length - 1]]));
};
