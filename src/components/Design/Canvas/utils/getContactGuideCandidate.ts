import { TSceneNode } from 'types/design/types';

import { getStrokedRotatedNodeBounds } from './getStrokedRotatedNodeBounds';
import { TContactGuideCandidate } from './getShapeContactGuides';

const candidateByNode = new WeakMap<TSceneNode, TContactGuideCandidate>();

export const getContactGuideCandidate = (node: TSceneNode): TContactGuideCandidate => {
  const cached = candidateByNode.get(node);

  if (!cached) {
    const candidate = { bounds: getStrokedRotatedNodeBounds(node), id: node.id };
    candidateByNode.set(node, candidate);

    return candidate;
  }

  return cached;
};
