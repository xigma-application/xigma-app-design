// types
import { TDesignState } from '../../types';

// utils
import { handleDeleteNode } from '../handleDeleteNode/handleDeleteNode';
import { isEmptyVectorNode } from '../isEmptyVectorNode';

export const exitVectorEditingIfNeeded = (state: TDesignState, nextSelectedIds: string[]): void => {
  const exitedIds = state.vectorEditingNodeIds.filter((id) => !nextSelectedIds.includes(id));

  if (exitedIds.length > 0) {
    state.vectorEditingNodeIds = state.vectorEditingNodeIds.filter((id) => !exitedIds.includes(id));
    state.penActiveVertexId = null;

    exitedIds.filter((id) => isEmptyVectorNode(state, id)).forEach((id) => handleDeleteNode(state, id));
  }
};
