// types
import { ToolName } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

export const getEraseAwareNodesById = (
  nodesById: Record<string, TSceneNode>,
  sceneNodes: TSceneNode[],
  vectorEditingNodeIds: string[],
  activeTool: ToolName,
): Record<string, TSceneNode> => {
  if (activeTool !== ToolName.erase) {
    return nodesById;
  }

  const eraseAwareNodesById = { ...nodesById };

  vectorEditingNodeIds.forEach((id) => {
    const previewNode = sceneNodes.find((node) => node.id === id);

    if (previewNode) {
      eraseAwareNodesById[id] = previewNode;
    }
  });

  return eraseAwareNodesById;
};
