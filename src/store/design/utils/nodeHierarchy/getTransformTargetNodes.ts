// types
import { TSceneNode } from 'types/design/types';

// utils
import { getGroupLeafNodes } from './getGroupLeafNodes';

export const getTransformTargetNodes = (selectedNodes: TSceneNode[], nodesById: Record<string, TSceneNode>): TSceneNode[] => {
  const seen = new Set<string>();
  const targets: TSceneNode[] = [];

  selectedNodes.forEach((node) => {
    getGroupLeafNodes(node, nodesById).forEach((leaf) => {
      if (!seen.has(leaf.id)) {
        seen.add(leaf.id);
        targets.push(leaf);
      }
    });
  });

  return targets;
};
