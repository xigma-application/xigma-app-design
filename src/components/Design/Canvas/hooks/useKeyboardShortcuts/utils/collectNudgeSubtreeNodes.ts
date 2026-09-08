// store
import { getGroupSubtreeNodes } from 'store/design/utils/nodeHierarchy/getGroupSubtreeNodes';

// types
import { TSceneNode } from 'types/design/types';

export const collectNudgeSubtreeNodes = (roots: TSceneNode[], nodesById: Record<string, TSceneNode>): TSceneNode[] => {
  const byId = new Map<string, TSceneNode>();

  roots.forEach((root) => {
    getGroupSubtreeNodes(root, nodesById).forEach((node) => byId.set(node.id, node));
  });

  return [...byId.values()];
};
