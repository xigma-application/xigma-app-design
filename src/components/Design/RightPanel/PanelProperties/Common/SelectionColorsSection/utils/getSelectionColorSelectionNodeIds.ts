// types
import { TSceneNode } from 'types/design/types';
import { TSelectionColorOccurrence } from '../types';

const hasMatchingAncestor = (nodeId: string, idSet: Set<string>, nodesById: Record<string, TSceneNode>): boolean => {
  let current = nodesById[nodeId];

  while (current?.parentId) {
    if (idSet.has(current.parentId)) {
      return true;
    }

    current = nodesById[current.parentId];
  }

  return false;
};

export const getSelectionColorSelectionNodeIds = (
  occurrences: TSelectionColorOccurrence[],
  nodesById: Record<string, TSceneNode>,
): string[] => {
  const nodeIds = Array.from(new Set(occurrences.map((occurrence) => occurrence.nodeId)));
  const idSet = new Set(nodeIds);

  return nodeIds.filter((nodeId) => !hasMatchingAncestor(nodeId, idSet, nodesById));
};
