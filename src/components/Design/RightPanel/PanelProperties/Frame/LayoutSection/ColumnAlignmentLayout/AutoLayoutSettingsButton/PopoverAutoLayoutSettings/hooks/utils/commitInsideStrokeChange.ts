// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TInsideStroke } from '../../types';
import { TFrameNode } from 'types/design/types';

export const commitInsideStrokeChange = (dispatch: AppDispatch, frameNode: TFrameNode | undefined, value: TInsideStroke): void => {
  if (frameNode) {
    dispatch(updateNode({ changes: { insideStroke: value }, id: frameNode.id }));
  }
};
