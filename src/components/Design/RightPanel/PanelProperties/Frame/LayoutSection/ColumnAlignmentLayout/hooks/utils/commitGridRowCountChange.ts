// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TFrameNode } from 'types/design/types';

export const commitGridRowCountChange = (dispatch: AppDispatch, frameNode: TFrameNode | undefined, value: number): void => {
  if (frameNode) {
    dispatch(updateNode({ changes: { gridRowCount: value }, id: frameNode.id }));
  }
};
