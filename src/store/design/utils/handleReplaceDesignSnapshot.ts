// types
import { TDesignSnapshot, TDesignState } from '../types';
import { NodeType, ToolName } from 'types/design/enums';

export const handleReplaceDesignSnapshot = (state: TDesignState, snapshot: TDesignSnapshot): void => {
  state.nodes = snapshot.nodes;
  state.rootOrder = snapshot.rootOrder;
  state.selectedIds = snapshot.selectedIds;

  const hadVectorEditingNodeIds = state.vectorEditingNodeIds.length > 0;
  const validVectorEditingNodeIds = state.vectorEditingNodeIds.filter((id) => state.nodes[id]?.type === NodeType.vector);

  if (validVectorEditingNodeIds.length !== state.vectorEditingNodeIds.length) {
    state.vectorEditingNodeIds = validVectorEditingNodeIds;

    if (hadVectorEditingNodeIds && validVectorEditingNodeIds.length === 0) {
      state.activeTool = ToolName.default;
    }
  }

  const primaryEditingNode = state.nodes[state.vectorEditingNodeIds[0]];

  if (primaryEditingNode?.type === NodeType.vector && state.penActiveVertexId && !primaryEditingNode.vertices[state.penActiveVertexId]) {
    state.penActiveVertexId = null;
  } else if (!primaryEditingNode) {
    state.penActiveVertexId = null;
  }
};
