// types
import { TDesignSnapshot, TDesignState } from '../types';
import { NodeType } from 'types/design/enums';

export const handleReplaceDesignSnapshot = (state: TDesignState, snapshot: TDesignSnapshot): void => {
  state.nodes = snapshot.nodes;
  state.rootOrder = snapshot.rootOrder;
  state.selectedIds = snapshot.selectedIds;

  const editingNode = state.vectorEditingNodeId ? state.nodes[state.vectorEditingNodeId] : undefined;

  if (!editingNode || editingNode.type !== NodeType.vector) {
    state.vectorEditingNodeId = null;
    state.penActiveVertexId = null;
  } else if (state.penActiveVertexId && !editingNode.vertices[state.penActiveVertexId]) {
    state.penActiveVertexId = null;
  }
};
