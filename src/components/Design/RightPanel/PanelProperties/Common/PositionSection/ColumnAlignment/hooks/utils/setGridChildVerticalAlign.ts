// store
import { AppDispatch } from 'store';
import { updateNode } from 'store/design/slice';

// types
import { AlignmentVertical } from 'types/design/enums';
import { TBoxSceneNode } from 'types/design/types';

export const setGridChildVerticalAlign = (dispatch: AppDispatch, node: TBoxSceneNode | undefined, value: AlignmentVertical): void => {
  if (node) {
    dispatch(updateNode({ changes: { gridChildVerticalAlign: value }, id: node.id }));
  }
};
