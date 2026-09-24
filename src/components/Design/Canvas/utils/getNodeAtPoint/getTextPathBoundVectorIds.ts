import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

const idsBySource = new WeakMap<TSceneNode[], Set<string>>();

export const getTextPathBoundVectorIds = (nodes: TSceneNode[]): Set<string> => {
  const cached = idsBySource.get(nodes);

  if (!cached) {
    const boundVectorIds = new Set<string>();

    nodes.forEach((node) => {
      if (node.type === NodeType.text && node.pathId) {
        boundVectorIds.add(node.pathId);
      }
    });
    idsBySource.set(nodes, boundVectorIds);

    return boundVectorIds;
  }

  return cached;
};
