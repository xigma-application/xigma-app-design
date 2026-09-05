// types
import { TSceneNode } from 'types/design/types';

// utils
import { isAutoLayoutFrame } from './isAutoLayoutFrame';

export const isNodeAutoLayoutChild = (node: TSceneNode, nodesById: Record<string, TSceneNode>): boolean => {
  const parent = node.parentId ? nodesById[node.parentId] : undefined;
  return parent !== undefined && isAutoLayoutFrame(parent);
};
