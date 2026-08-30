// types
import { TSceneNode } from 'types/design/types';

// utils
import { getGroupSubtreeNodes } from '../nodeHierarchy/getGroupSubtreeNodes';

export const dropDescendantsOfSelected = (selectedIds: string[], nodes: Record<string, TSceneNode>): string[] => {
  const selectedIdSet = new Set(selectedIds);
  const redundantIds = new Set<string>();

  selectedIds.forEach((id) => {
    const node = nodes[id];

    if (node) {
      getGroupSubtreeNodes(node, nodes)
        .slice(1)
        .forEach((descendant) => {
          if (selectedIdSet.has(descendant.id)) {
            redundantIds.add(descendant.id);
          }
        });
    }
  });

  return selectedIds.filter((id) => !redundantIds.has(id));
};
