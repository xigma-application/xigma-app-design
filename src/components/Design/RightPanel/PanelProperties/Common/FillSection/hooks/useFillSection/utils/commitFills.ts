// store
import { AppDispatch } from 'store/store';
import { updateNode } from 'store/design/slice';

// types
import { TPaint } from 'types/design/paint/types';

export const commitFills = (dispatch: AppDispatch, nodeId: string | undefined, nextFills: TPaint[]): void => {
  if (nodeId) {
    dispatch(updateNode({ changes: { fills: nextFills }, id: nodeId }));
  }
};
