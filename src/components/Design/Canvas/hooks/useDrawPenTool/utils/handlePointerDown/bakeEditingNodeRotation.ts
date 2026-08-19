// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TVectorNode } from 'types/design/types';

// utils
import { bakeVectorNodeRotation } from '../../../../utils/bakeVectorNodeRotation';

export const bakeEditingNodeRotation = (dispatch: AppDispatch, editingNode: TVectorNode | null): void => {
  if (editingNode && editingNode.rotation) {
    dispatch(updateNode({ changes: bakeVectorNodeRotation(editingNode), id: editingNode.id }));
  }
};
