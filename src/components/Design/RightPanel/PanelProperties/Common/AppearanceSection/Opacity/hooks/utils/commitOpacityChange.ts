// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

export const commitOpacityChange = (dispatch: AppDispatch, id: string, percentage: number): void => {
  dispatch(updateNode({ changes: { opacity: percentage / 100 }, id }));
};
