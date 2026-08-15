// types
import { TDesignState } from '../types';
import { NodeType } from 'types/design/enums';

export const handleDeleteNode = (state: TDesignState, id: string): void => {
  const node = state.nodes[id];

  if (node) {
    delete state.nodes[id];
    state.rootOrder = state.rootOrder.filter((nodeId) => nodeId !== id);
    state.selectedIds = state.selectedIds.filter((nodeId) => nodeId !== id);

    if (node.type === NodeType.text && node.pathId) {
      handleDeleteNode(state, node.pathId);
    }
  }
};
