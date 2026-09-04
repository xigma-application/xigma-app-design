// types
import { TSceneNode } from 'types/design/types';

export const getSelectionAncestorIds = (selectedIds: string[], nodes: Record<string, TSceneNode>): Set<string> => {
  const ancestorIds = new Set<string>();

  selectedIds.forEach((id) => {
    let parentId = nodes[id]?.parentId ?? null;

    while (parentId && !ancestorIds.has(parentId)) {
      ancestorIds.add(parentId);
      parentId = nodes[parentId]?.parentId ?? null;
    }
  });

  return ancestorIds;
};
