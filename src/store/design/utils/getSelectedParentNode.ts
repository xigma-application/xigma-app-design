// types
import { TSceneNode } from 'types/design/types';

export const getSelectedParentNode = (selectedNodes: TSceneNode[], nodes: Record<string, TSceneNode>): TSceneNode | undefined => {
  const [selectedNode] = selectedNodes;
  return selectedNode?.parentId ? nodes[selectedNode.parentId] : undefined;
};
