// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isClickThroughFrame } from 'store/design/utils/nodeHierarchy/isClickThroughFrame';

type TCandidateCache = {
  nodes: TSceneNode[];
  nodesById: Record<string, TSceneNode>;
  rootOrder: string[];
};

let cache: TCandidateCache | null = null;

const collectFrom = (id: string, nodesById: Record<string, TSceneNode>, includeLeaves: boolean): TSceneNode[] => {
  const node = nodesById[id];

  if (node) {
    if (node.type === NodeType.frame) {
      const isCT = isClickThroughFrame(node, nodesById);
      return [node, ...node.childIds.flatMap((childId) => collectFrom(childId, nodesById, isCT))];
    }

    return includeLeaves ? [node] : [];
  }
  return [];
};

export const getMarqueeCandidateNodes = (rootOrder: string[], nodesById: Record<string, TSceneNode>): TSceneNode[] => {
  if (!cache || cache.rootOrder !== rootOrder || cache.nodesById !== nodesById) {
    const nodes = rootOrder.flatMap((id) => collectFrom(id, nodesById, true));
    cache = { nodes, nodesById, rootOrder };

    return nodes;
  }

  return cache.nodes;
};
