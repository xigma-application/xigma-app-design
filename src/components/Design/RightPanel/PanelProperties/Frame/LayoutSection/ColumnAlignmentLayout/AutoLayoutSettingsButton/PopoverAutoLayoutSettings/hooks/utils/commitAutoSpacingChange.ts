// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TAutoSpacing } from '../../types';
import { TFrameNode } from 'types/design/types';

export const commitAutoSpacingChange = (dispatch: AppDispatch, frameNode: TFrameNode | undefined, value: TAutoSpacing): void => {
  if (frameNode) {
    dispatch(updateNode({ changes: { autoSpacing: value }, id: frameNode.id }));
  }
};
