// types
import { TDesignState } from '../types';

// utils
import { handleDeleteNode } from './handleDeleteNode/handleDeleteNode';
import { isEmptyVectorNode } from './isEmptyVectorNode';

export const handleSetVectorEditingNodeIds = (state: TDesignState, nextVectorEditingNodeIds: string[]): void => {
  const previousVectorEditingNodeIds = state.vectorEditingNodeIds;

  state.vectorEditingNodeIds = nextVectorEditingNodeIds;

  if (nextVectorEditingNodeIds.length === 0) {
    state.lastMoreTool = null;
  }

  previousVectorEditingNodeIds
    .filter((id) => !nextVectorEditingNodeIds.includes(id) && isEmptyVectorNode(state, id))
    .forEach((id) => handleDeleteNode(state, id));
};
