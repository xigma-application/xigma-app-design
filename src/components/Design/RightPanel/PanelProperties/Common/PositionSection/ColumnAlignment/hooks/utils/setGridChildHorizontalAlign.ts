// store
import { AppDispatch } from 'store';
import { updateNode } from 'store/design/slice';

// types
import { AlignmentHorizontal } from 'types/design/enums';
import { TBoxSceneNode } from 'types/design/types';

export const setGridChildHorizontalAlign = (dispatch: AppDispatch, node: TBoxSceneNode | undefined, value: AlignmentHorizontal): void => {
  if (node) {
    dispatch(updateNode({ changes: { gridChildHorizontalAlign: value }, id: node.id }));
  }
};
