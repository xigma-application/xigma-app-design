// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

export const commitSmoothingChange = (dispatch: AppDispatch, id: string, percentage: number): void => {
  dispatch(updateNode({ changes: { cornerSmoothing: percentage / 100 }, id }));
};
