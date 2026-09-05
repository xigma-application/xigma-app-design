// types
import { TSceneNode } from 'types/design/types';

// utils
import { getRenderedVectorNode } from 'utils/canvas/render/getRenderedVectorNode';
import { getVectorEditingNode } from '../../../../../utils/getVectorEditingNode';

export const getBakedVectorEditingNodes = (
  nodes: Record<string, TSceneNode>,
  vectorEditingNodeIds: string[],
): Record<string, TSceneNode> => {
  const bakedNodes = { ...nodes };

  vectorEditingNodeIds.forEach((nodeId) => {
    const editingNode = getVectorEditingNode(nodes, nodeId);

    if (editingNode) {
      bakedNodes[nodeId] = getRenderedVectorNode(editingNode);
    }
  });

  return bakedNodes;
};
