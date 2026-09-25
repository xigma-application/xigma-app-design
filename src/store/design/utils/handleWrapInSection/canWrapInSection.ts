// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

export const canWrapInSection = (selectedNodes: (TSceneNode | undefined)[], nodes: Record<string, TSceneNode>): boolean => {
  const [firstNode] = selectedNodes;

  if (firstNode && selectedNodes.every((node) => node !== undefined && node.parentId === firstNode.parentId)) {
    return firstNode.parentId === null || nodes[firstNode.parentId]?.type === NodeType.section;
  }

  return false;
};
