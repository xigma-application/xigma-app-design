import { TSceneNode } from 'types/design/types';

export const getIsDescendantOfMovedIdSet = (
  targetParentId: string | null,
  movedIdSet: ReadonlySet<string>,
  nodesById: Record<string, TSceneNode>,
): boolean => {
  let current = targetParentId ? nodesById[targetParentId] : undefined;

  while (current) {
    if (movedIdSet.has(current.id)) {
      return true;
    }

    current = current.parentId ? nodesById[current.parentId] : undefined;
  }

  return false;
};
