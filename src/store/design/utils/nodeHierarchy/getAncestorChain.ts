// types
import { TSceneNode } from 'types/design/types';

export const getAncestorChain = (node: TSceneNode, nodesById: Record<string, TSceneNode>): TSceneNode[] => {
  const ancestors: TSceneNode[] = [];
  let current = node;

  while (current.parentId) {
    const parent = nodesById[current.parentId];

    if (!parent) {
      break;
    }

    ancestors.push(parent);
    current = parent;
  }

  return ancestors;
};
