// types
import { TSceneNode } from 'types/design/types';

// utils
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';

export const getEffectiveOpacity = (node: TSceneNode, nodesById: Record<string, TSceneNode>): number => {
  let opacity = 1;
  let current: TSceneNode | undefined = node;

  while (current) {
    opacity *= isBoxSceneNode(current) ? (current.opacity ?? 1) : 1;
    current = current.parentId ? nodesById[current.parentId] : undefined;
  }

  return opacity;
};
