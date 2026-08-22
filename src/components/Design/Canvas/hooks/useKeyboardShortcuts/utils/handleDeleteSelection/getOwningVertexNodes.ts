// types
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { findVectorEditingNodeForVertex } from '../../../../utils/findVectorEditingNodeForVertex';

export const getOwningVertexNodes = (
  vectorEditingNodeIds: string[],
  nodes: Record<string, TSceneNode>,
  vertexIds: string[],
): TVectorNode[] => {
  const owningNodesById = new Map<string, TVectorNode>();

  vertexIds.forEach((id) => {
    const node = findVectorEditingNodeForVertex(vectorEditingNodeIds, nodes, id);

    if (node) {
      owningNodesById.set(node.id, node);
    }
  });

  return Array.from(owningNodesById.values());
};
