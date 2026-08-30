// types
import { TSceneNode } from 'types/design/types';

export const getTopLevelAncestor = (node: TSceneNode, nodesById: Record<string, TSceneNode>): TSceneNode => {
  let current = node;

  while (current.parentId) {
    const parent = nodesById[current.parentId];

    if (!parent) {
      return current;
    }

    current = parent;
  }

  return current;
};
