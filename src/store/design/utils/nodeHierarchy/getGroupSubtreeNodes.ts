// types
import { TSceneNode } from 'types/design/types';

// utils
import { isContainerNode } from './isContainerNode';

export const getGroupSubtreeNodes = (node: TSceneNode, nodesById: Record<string, TSceneNode>): TSceneNode[] => {
  if (!isContainerNode(node)) {
    return [node];
  }

  return [node, ...node.childIds.flatMap((childId) => (nodesById[childId] ? getGroupSubtreeNodes(nodesById[childId], nodesById) : []))];
};
