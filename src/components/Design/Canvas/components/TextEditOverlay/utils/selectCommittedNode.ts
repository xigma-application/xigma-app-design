// store
import { setSelection } from 'store/design/slice';
import { AppDispatch, AppStore } from 'store';

// utils
import { selectLastCreatedNode } from '../../../utils/selectLastCreatedNode';

export const selectCommittedNode = (dispatch: AppDispatch, appStore: AppStore, editingNodeId: string | null): void => {
  if (editingNodeId) {
    dispatch(setSelection([editingNodeId]));
  } else {
    selectLastCreatedNode(dispatch, appStore);
  }
};
