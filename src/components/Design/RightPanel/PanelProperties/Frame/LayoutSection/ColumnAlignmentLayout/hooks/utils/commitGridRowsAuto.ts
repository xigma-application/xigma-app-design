// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TFrameNode } from 'types/design/types';

export const commitGridRowsAuto = (dispatch: AppDispatch, frameNode: TFrameNode | undefined): void => {
  if (frameNode) {
    dispatch(updateNode({ changes: { gridRowCount: undefined }, id: frameNode.id }));
  }
};
