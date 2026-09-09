// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TAlignTextBaseline } from '../../types';
import { TFrameNode } from 'types/design/types';

export const commitAlignTextBaselineChange = (
  dispatch: AppDispatch,
  frameNode: TFrameNode | undefined,
  value: TAlignTextBaseline,
): void => {
  if (frameNode) {
    dispatch(updateNode({ changes: { alignTextBaseline: value }, id: frameNode.id }));
  }
};
