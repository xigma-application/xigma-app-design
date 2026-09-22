// types
import { TSceneNode } from 'types/design/types';

const hasAncestorInSet = (nodeId: string, idSet: Set<string>, nodesById: Record<string, TSceneNode>): boolean => {
  let current = nodesById[nodeId];
  let found = false;

  while (current?.parentId && !found) {
    if (idSet.has(current.parentId)) {
      found = true;
    } else {
      current = nodesById[current.parentId];
    }
  }

  return found;
};

export const getTopLevelIds = (ids: string[], nodesById: Record<string, TSceneNode>): string[] => {
  const idSet = new Set(ids);

  return ids.filter((id) => !hasAncestorInSet(id, idSet, nodesById));
};
