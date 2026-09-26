// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';

export const getEffectiveOpacityFromLookup = (node: TSceneNode, getNode: (id: string) => TSceneNode | undefined): number => {
  let opacity = 1;
  let current: TSceneNode | undefined = node;

  while (current) {
    opacity *= isBoxSceneNode(current) || current.type === NodeType.vector ? (current.opacity ?? 1) : 1;
    current = current.parentId ? getNode(current.parentId) : undefined;
  }

  return opacity;
};
