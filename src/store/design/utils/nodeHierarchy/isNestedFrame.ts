// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

export const isNestedFrame = (node: TSceneNode, nodesById: Record<string, TSceneNode>): boolean => {
  if (node.type === NodeType.frame) {
    const parent = node.parentId ? nodesById[node.parentId] : null;
    return parent?.type === NodeType.frame;
  }

  return false;
};
