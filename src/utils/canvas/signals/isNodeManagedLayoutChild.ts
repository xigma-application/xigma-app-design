// types
import { TSceneNode } from 'types/design/types';

// utils
import { isManagedLayoutFrame } from './isManagedLayoutFrame';

export const isNodeManagedLayoutChild = (node: TSceneNode, nodesById: Record<string, TSceneNode>): boolean => {
  const parent = node.parentId ? nodesById[node.parentId] : undefined;
  return parent !== undefined && isManagedLayoutFrame(parent);
};
