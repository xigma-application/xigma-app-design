// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

export const hasBooleanAncestor = (node: TSceneNode, nodesById: Record<string, TSceneNode>): boolean => {
  let parent = node.parentId ? nodesById[node.parentId] : undefined;

  while (parent) {
    if (parent.type === NodeType.boolean) {
      return true;
    }

    parent = parent.parentId ? nodesById[parent.parentId] : undefined;
  }

  return false;
};
