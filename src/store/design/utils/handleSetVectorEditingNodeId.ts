// types
import { TDesignState } from '../types';

// utils
import { handleDeleteNode } from './handleDeleteNode';
import { isEmptyVectorNode } from './isEmptyVectorNode';

export const handleSetVectorEditingNodeId = (state: TDesignState, nextVectorEditingNodeId: string | null): void => {
  const previousVectorEditingNodeId = state.vectorEditingNodeId;

  state.vectorEditingNodeId = nextVectorEditingNodeId;

  if (
    previousVectorEditingNodeId &&
    previousVectorEditingNodeId !== nextVectorEditingNodeId &&
    isEmptyVectorNode(state, previousVectorEditingNodeId)
  ) {
    handleDeleteNode(state, previousVectorEditingNodeId);
  }
};
