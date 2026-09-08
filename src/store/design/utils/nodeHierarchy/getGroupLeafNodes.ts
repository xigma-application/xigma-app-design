// types
import { TSceneNode } from 'types/design/types';

// utils
import { isGroupLikeNode } from './isGroupLikeNode';

export const getGroupLeafNodes = (group: TSceneNode, nodesById: Record<string, TSceneNode>): TSceneNode[] => {
  if (!isGroupLikeNode(group)) {
    return [group];
  }

  return group.childIds.flatMap((childId) => {
    const child = nodesById[childId];
    return child ? getGroupLeafNodes(child, nodesById) : [];
  });
};
