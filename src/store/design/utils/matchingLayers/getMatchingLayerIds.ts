// types
import { TSceneNode } from 'types/design/types';

// utils
import { findMatchingNode } from './findMatchingNode';
import { getCandidateTops } from './getCandidateTops';
import { getMatchingScope } from './getMatchingScope';

const collectMatchingIds = (nodeId: string, nodesById: Record<string, TSceneNode>, rootOrder: string[]): string[] => {
  const node = nodesById[nodeId];
  const scope = node ? getMatchingScope(node, nodesById) : null;

  if (scope) {
    return getCandidateTops(scope.top, nodesById, rootOrder)
      .map((candidateTop) => findMatchingNode(scope, candidateTop, nodesById))
      .filter((match): match is TSceneNode => match !== null)
      .map((match) => match.id);
  }

  return [];
};

export const getMatchingLayerIds = (selectedIds: string[], nodesById: Record<string, TSceneNode>, rootOrder: string[]): string[] => [
  ...new Set([...selectedIds, ...selectedIds.flatMap((nodeId) => collectMatchingIds(nodeId, nodesById, rootOrder))]),
];
