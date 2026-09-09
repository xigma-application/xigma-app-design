// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TCanvasStacking } from '../../types';
import { TFrameNode } from 'types/design/types';

export const commitCanvasStackingChange = (dispatch: AppDispatch, frameNode: TFrameNode | undefined, value: TCanvasStacking): void => {
  if (frameNode) {
    dispatch(updateNode({ changes: { canvasStacking: value }, id: frameNode.id }));
  }
};
