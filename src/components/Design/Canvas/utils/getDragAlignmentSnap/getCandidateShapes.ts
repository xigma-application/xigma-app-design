// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getStrokedRotatedNodeBounds } from '../getStrokedRotatedNodeBounds';
import { getShapeSnapPoints } from '../getShapeSnapPoints';
import { isContactGuideEligibleNode } from '../getShapeContactGuides';

export type TCandidateShape = {
  bounds: TDraftRect;
  points: TPoint[];
};

export const getCandidateShapes = (nodes: Record<string, TSceneNode>, excludedIds: string[]): TCandidateShape[] => {
  const excludedIdSet = new Set(excludedIds);

  return Object.values(nodes)
    .filter((node) => !excludedIdSet.has(node.id) && isContactGuideEligibleNode(node))
    .map((node) => {
      const bounds = getStrokedRotatedNodeBounds(node);
      return { bounds, points: getShapeSnapPoints(bounds) };
    });
};
