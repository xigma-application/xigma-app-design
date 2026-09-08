// types
import { TSceneNode } from 'types/design/types';

// utils
import { isGroupLikeNode } from './isGroupLikeNode';

export const getGroupLikeParentIds = (nodes: Record<string, TSceneNode>, ids: string[]): Set<string> => {
  const idSet = new Set(ids);
  const groupLikeParentIds = new Set<string>();

  idSet.forEach((id) => {
    const parentId = nodes[id]?.parentId;
    const parent = parentId ? nodes[parentId] : null;

    if (parentId && !idSet.has(parentId) && parent && isGroupLikeNode(parent)) {
      groupLikeParentIds.add(parentId);
    }
  });

  return groupLikeParentIds;
};
