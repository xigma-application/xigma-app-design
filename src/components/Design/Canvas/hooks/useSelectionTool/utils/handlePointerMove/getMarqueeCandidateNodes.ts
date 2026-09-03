// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isClickThroughFrame } from 'store/design/utils/nodeHierarchy/isClickThroughFrame';

const collectFrom = (id: string, nodesById: Record<string, TSceneNode>, includeLeaves: boolean): TSceneNode[] => {
  const node = nodesById[id];

  if (!node) {
    return [];
  }
  if (node.type === NodeType.frame) {
    const isCT = isClickThroughFrame(node, nodesById);
    return [node, ...node.childIds.flatMap((childId) => collectFrom(childId, nodesById, isCT))];
  }

  return includeLeaves ? [node] : [];
};

export const getMarqueeCandidateNodes = (rootOrder: string[], nodesById: Record<string, TSceneNode>): TSceneNode[] =>
  rootOrder.flatMap((id) => collectFrom(id, nodesById, true));
