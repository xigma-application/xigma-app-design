// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TFrameNode } from 'types/design/types';
import { TLayoutVersion } from '../../types';

export const commitLayoutVersionChange = (dispatch: AppDispatch, frameNode: TFrameNode | undefined, value: TLayoutVersion): void => {
  if (frameNode) {
    dispatch(updateNode({ changes: { layoutVersion: value }, id: frameNode.id }));
  }
};
