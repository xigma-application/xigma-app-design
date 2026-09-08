// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

export const getIsMaskChild = (node: TSceneNode, nodes: Record<string, TSceneNode>): boolean => {
  const parent = node.parentId ? nodes[node.parentId] : null;

  return Boolean(parent && parent.type === NodeType.mask && parent.childIds[parent.childIds.length - 1] === node.id);
};
