// types
import { TMatchingScope } from './types';
import { TSceneNode } from 'types/design/types';

// utils
import { getSameNameChildren } from './getSameNameChildren';

export const findMatchingNode = (
  { path, top }: TMatchingScope,
  candidateTop: TSceneNode,
  nodesById: Record<string, TSceneNode>,
): TSceneNode | null => {
  let sourceParent = top;
  let candidate: TSceneNode | null = candidateTop;

  for (const pathNode of path) {
    if (candidate) {
      const occurrenceIndex = getSameNameChildren(sourceParent, pathNode.name, nodesById).indexOf(pathNode);

      candidate = getSameNameChildren(candidate, pathNode.name, nodesById)[occurrenceIndex] ?? null;
      sourceParent = pathNode;
    }
  }

  return candidate;
};
