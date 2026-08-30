// types
import { TSceneNode } from 'types/design/types';

export const getIsDescendantOfMovedNodes = (
  targetParentId: string | null,
  movedNodeIds: string[],
  nodesById: Record<string, TSceneNode>,
): boolean => {
  const movedIdSet = new Set(movedNodeIds);
  let current = targetParentId ? nodesById[targetParentId] : undefined;

  while (current) {
    if (movedIdSet.has(current.id)) {
      return true;
    }

    current = current.parentId ? nodesById[current.parentId] : undefined;
  }

  return false;
};
