// types
import { TSceneNode } from 'types/design/types';

export const getNodesById = (nodes: TSceneNode[]): Record<string, TSceneNode> => {
  const nodesById: Record<string, TSceneNode> = {};

  nodes.forEach((node) => {
    nodesById[node.id] = node;
  });

  return nodesById;
};
