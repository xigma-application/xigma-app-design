// types
import { TSceneNode } from 'types/design/types';

// utils
import { getGroupSubtreeNodes } from './getGroupSubtreeNodes';

export const getRigidTransformNodes = (selectedNodes: TSceneNode[], nodesById: Record<string, TSceneNode>): TSceneNode[] => {
  const seen = new Set<string>();
  const nodes: TSceneNode[] = [];

  selectedNodes.forEach((selectedNode) => {
    getGroupSubtreeNodes(selectedNode, nodesById).forEach((node) => {
      if (!seen.has(node.id)) {
        seen.add(node.id);
        nodes.push(node);
      }
    });
  });

  return nodes;
};
