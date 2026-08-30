// types
import { TAlignmentGuide } from './getGroupAlignmentGuide';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { extendGuideToFullElement } from './getDragAlignmentSnap/extendGuideToFullElement';
import { getAlignmentGuide } from 'utils/canvas/getAlignmentGuide';
import { getCandidateShapes } from './getDragAlignmentSnap/getCandidateShapes';

export type TResizeAlignmentSnap = {
  guide: TAlignmentGuide | null;
  point: TPoint;
};

export const getResizeAlignmentSnap = (
  point: TPoint,
  nodes: Record<string, TSceneNode>,
  excludedIds: string[],
  toleranceWorldUnits: number,
): TResizeAlignmentSnap => {
  const candidateShapes = getCandidateShapes(nodes, excludedIds);
  const candidatePoints = candidateShapes.flatMap((candidate) => candidate.points);
  const match = getAlignmentGuide(point, candidatePoints, toleranceWorldUnits);
  const rawGuide: TAlignmentGuide | null =
    match.horizontal || match.vertical
      ? {
          horizontal: match.horizontal ? { anchor: match.point, match: match.horizontal } : null,
          vertical: match.vertical ? { anchor: match.point, match: match.vertical } : null,
        }
      : null;

  return { guide: extendGuideToFullElement(rawGuide, candidateShapes), point: match.point };
};
