// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TPaddingPatch } from '../types';

export const commitPaddingChange = (dispatch: AppDispatch, id: string, patch: TPaddingPatch): void => {
  dispatch(updateNode({ changes: patch, id }));
};
