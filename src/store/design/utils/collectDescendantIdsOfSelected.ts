// types
import { TSceneNode } from 'types/design/types';

// utils
import { getGroupSubtreeNodes } from './nodeHierarchy/getGroupSubtreeNodes';

export const collectDescendantIdsOfSelected = (selectedNodes: TSceneNode[], nodes: Record<string, TSceneNode>): Set<string> => {
  const descendantIds = new Set<string>();

  selectedNodes.filter(Boolean).forEach((node) => {
    getGroupSubtreeNodes(node, nodes)
      .slice(1)
      .forEach((descendant) => descendantIds.add(descendant.id));
  });

  return descendantIds;
};
