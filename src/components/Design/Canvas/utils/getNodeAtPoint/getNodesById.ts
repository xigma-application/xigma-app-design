// types
import { TSceneNode } from 'types/design/types';

const nodesByIdBySource = new WeakMap<TSceneNode[], Record<string, TSceneNode>>();

export const getNodesById = (nodes: TSceneNode[]): Record<string, TSceneNode> => {
  const cached = nodesByIdBySource.get(nodes);

  if (!cached) {
    const nodesById: Record<string, TSceneNode> = {};

    nodes.forEach((node) => {
      nodesById[node.id] = node;
    });
    nodesByIdBySource.set(nodes, nodesById);

    return nodesById;
  }

  return cached;
};
