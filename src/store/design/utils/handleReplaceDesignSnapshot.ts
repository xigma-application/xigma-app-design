// types
import { TDesignSnapshot, TDesignState } from '../types';
import { NodeType, ToolName } from 'types/design/enums';

// utils
import { getActivePage } from './getActivePage';

export const handleReplaceDesignSnapshot = (state: TDesignState, snapshot: TDesignSnapshot): void => {
  const page = getActivePage(state);

  page.nodes = snapshot.nodes;
  page.rootOrder = snapshot.rootOrder;
  state.selectedIds = snapshot.selectedIds;

  const hadVectorEditingNodeIds = state.vectorEditingNodeIds.length > 0;
  const validVectorEditingNodeIds = state.vectorEditingNodeIds.filter((id) => page.nodes[id]?.type === NodeType.vector);

  if (validVectorEditingNodeIds.length !== state.vectorEditingNodeIds.length) {
    state.vectorEditingNodeIds = validVectorEditingNodeIds;

    if (hadVectorEditingNodeIds && validVectorEditingNodeIds.length === 0) {
      state.activeTool = ToolName.default;
    }
  }

  const primaryEditingNode = page.nodes[state.vectorEditingNodeIds[0]];

  if (primaryEditingNode?.type === NodeType.vector && state.penActiveVertexId && !primaryEditingNode.vertices[state.penActiveVertexId]) {
    state.penActiveVertexId = null;
  } else if (!primaryEditingNode) {
    state.penActiveVertexId = null;
  }
};
