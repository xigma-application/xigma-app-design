// store
import { AppDispatch } from 'store/store';
import { updateNode } from 'store/design/slice';

// types
import { TEffect } from 'types/design/types';

export const commitEffects = (dispatch: AppDispatch, nodeId: string | undefined, effects: TEffect[]): void => {
  if (nodeId) {
    dispatch(updateNode({ changes: { effects }, id: nodeId }));
  }
};
