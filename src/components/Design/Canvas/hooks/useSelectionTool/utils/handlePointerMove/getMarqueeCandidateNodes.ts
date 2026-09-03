// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

const collectFrom = (id: string, nodesById: Record<string, TSceneNode>): TSceneNode[] => {
  const node = nodesById[id];

  if (node) {
    return node.type === NodeType.frame && node.childIds.length > 0
      ? [node, ...node.childIds.flatMap((childId) => collectFrom(childId, nodesById))]
      : [node];
  }

  return [];
};

export const getMarqueeCandidateNodes = (rootOrder: string[], nodesById: Record<string, TSceneNode>): TSceneNode[] =>
  rootOrder.flatMap((id) => collectFrom(id, nodesById));
