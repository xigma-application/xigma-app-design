// others
import { EMPTY_VECTOR_POINT_SELECTION } from '../constants';

// types
import { TDesignState } from '../types';

// utils
import { bakeEnteringVectorRotations } from './bakeEnteringVectorRotations';
import { handleDeleteNode } from './handleDeleteNode/handleDeleteNode';
import { isEmptyVectorNode } from './isEmptyVectorNode';

export const handleSetVectorEditingNodeIds = (state: TDesignState, nextVectorEditingNodeIds: string[]): void => {
  const previousVectorEditingNodeIds = state.vectorEditingNodeIds;

  state.vectorEditingNodeIds = nextVectorEditingNodeIds;
  state.vectorPointSelection = EMPTY_VECTOR_POINT_SELECTION;
  bakeEnteringVectorRotations(
    state,
    nextVectorEditingNodeIds.filter((id) => !previousVectorEditingNodeIds.includes(id)),
  );

  if (nextVectorEditingNodeIds.length === 0) {
    state.lastMoreTool = null;
  }

  previousVectorEditingNodeIds
    .filter((id) => !nextVectorEditingNodeIds.includes(id) && isEmptyVectorNode(state, id))
    .forEach((id) => handleDeleteNode(state, id));
};
