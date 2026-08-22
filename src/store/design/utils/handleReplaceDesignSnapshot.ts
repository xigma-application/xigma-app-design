// types
import { TDesignSnapshot, TDesignState } from '../types';
import { NodeType } from 'types/design/enums';

export const handleReplaceDesignSnapshot = (state: TDesignState, snapshot: TDesignSnapshot): void => {
  state.nodes = snapshot.nodes;
  state.rootOrder = snapshot.rootOrder;
  state.selectedIds = snapshot.selectedIds;

  state.vectorEditingNodeIds = state.vectorEditingNodeIds.filter((id) => state.nodes[id]?.type === NodeType.vector);

  const primaryEditingNode = state.nodes[state.vectorEditingNodeIds[0]];

  if (primaryEditingNode?.type === NodeType.vector && state.penActiveVertexId && !primaryEditingNode.vertices[state.penActiveVertexId]) {
    state.penActiveVertexId = null;
  } else if (!primaryEditingNode) {
    state.penActiveVertexId = null;
  }
};
