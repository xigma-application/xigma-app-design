// types
import { TSceneNode } from 'types/design/types';

// utils
import { hasBooleanAncestor } from 'store/design/utils/nodeHierarchy/hasBooleanAncestor';

const cache = new WeakMap<TSceneNode[], TSceneNode[]>();

export const getBooleanOperandFreeNodes = (sceneNodes: TSceneNode[], nodesById: Record<string, TSceneNode>): TSceneNode[] => {
  const cached = cache.get(sceneNodes);

  if (!cached) {
    const result = sceneNodes.filter((node) => !hasBooleanAncestor(node, nodesById));
    cache.set(sceneNodes, result);

    return result;
  }

  return cached;
};
