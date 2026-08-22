// types
import { TDesignState } from '../types';

// utils
import { handleDeleteNode } from './handleDeleteNode';
import { isEmptyVectorNode } from './isEmptyVectorNode';

export const handleSetVectorEditingNodeIds = (state: TDesignState, nextVectorEditingNodeIds: string[]): void => {
  const previousVectorEditingNodeIds = state.vectorEditingNodeIds;

  state.vectorEditingNodeIds = nextVectorEditingNodeIds;

  previousVectorEditingNodeIds
    .filter((id) => !nextVectorEditingNodeIds.includes(id) && isEmptyVectorNode(state, id))
    .forEach((id) => handleDeleteNode(state, id));
};
