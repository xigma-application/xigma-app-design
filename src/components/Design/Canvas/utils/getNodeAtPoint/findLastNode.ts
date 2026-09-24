// types
import { TSceneNode } from 'types/design/types';

export const findLastNode = (nodes: TSceneNode[], predicate: (node: TSceneNode) => boolean): TSceneNode | null => {
  for (let index = nodes.length - 1; index >= 0; index -= 1) {
    if (predicate(nodes[index])) {
      return nodes[index];
    }
  }

  return null;
};
