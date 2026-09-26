// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TVectorNode } from 'types/design/types';

// utils
import { getBakedVectorRotationChanges } from 'utils/canvas/vectorNetwork/getBakedVectorRotationChanges';

export const bakeEditingNodeRotation = (dispatch: AppDispatch, editingNode: TVectorNode | null): void => {
  if (editingNode && editingNode.rotation) {
    dispatch(updateNode({ changes: getBakedVectorRotationChanges(editingNode), id: editingNode.id }));
  }
};
