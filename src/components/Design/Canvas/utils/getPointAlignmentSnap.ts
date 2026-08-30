// types
import { TAlignmentGuide } from './getGroupAlignmentGuide';
import { TCandidateShape } from './getDragAlignmentSnap/getCandidateShapes';
import { TPoint } from 'types/canvas';

// utils
import { extendGuideToFullElement } from './getDragAlignmentSnap/extendGuideToFullElement';
import { getAlignmentGuide } from 'utils/canvas/getAlignmentGuide';

export type TPointAlignmentSnap = {
  guide: TAlignmentGuide | null;
  point: TPoint;
};

export const getPointAlignmentSnap = (
  point: TPoint,
  candidateShapes: TCandidateShape[],
  toleranceWorldUnits: number,
): TPointAlignmentSnap => {
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
