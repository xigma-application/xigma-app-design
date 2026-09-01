// types
import { TSceneNode } from 'types/design/types';

export const isAncestorNode = (ancestorId: string, node: TSceneNode, nodesById: Record<string, TSceneNode>): boolean => {
  let current: TSceneNode | undefined = node.parentId ? nodesById[node.parentId] : undefined;

  while (current) {
    if (current.id === ancestorId) {
      return true;
    }

    current = current.parentId ? nodesById[current.parentId] : undefined;
  }

  return false;
};
