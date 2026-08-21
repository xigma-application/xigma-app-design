// types
import { TPoint } from 'types/canvas';
import { TVectorAlignmentGuide } from './applyVectorPointSnapping';

// utils
import { getVectorAlignmentGuide } from 'utils/canvas/vectorNetwork/getVectorAlignmentGuide';

export type TVectorGroupAlignmentResult = {
  deltaCorrection: TPoint;
  guide: TVectorAlignmentGuide | null;
};

type TBestAxisMatch = { distance: number; match: TPoint; point: TPoint } | null;

const getBetterMatch = (current: TBestAxisMatch, candidate: TPoint | null, point: TPoint, distance: number): TBestAxisMatch => {
  if (candidate && (!current || distance < current.distance)) {
    return { distance, match: candidate, point };
  }

  return current;
};

export const getVectorGroupAlignmentGuide = (
  draggedPoints: TPoint[],
  candidates: TPoint[],
  toleranceWorldUnits: number,
): TVectorGroupAlignmentResult => {
  const { bestHorizontal, bestVertical } = draggedPoints.reduce(
    (acc, point) => {
      const result = getVectorAlignmentGuide(point, candidates, toleranceWorldUnits);

      return {
        bestHorizontal: getBetterMatch(acc.bestHorizontal, result.horizontal, point, Math.abs((result.horizontal?.y ?? 0) - point.y)),
        bestVertical: getBetterMatch(acc.bestVertical, result.vertical, point, Math.abs((result.vertical?.x ?? 0) - point.x)),
      };
    },
    { bestHorizontal: null as TBestAxisMatch, bestVertical: null as TBestAxisMatch },
  );

  const deltaCorrection: TPoint = {
    x: bestVertical ? bestVertical.match.x - bestVertical.point.x : 0,
    y: bestHorizontal ? bestHorizontal.match.y - bestHorizontal.point.y : 0,
  };

  const guide: TVectorAlignmentGuide | null =
    bestVertical || bestHorizontal
      ? {
          horizontal: bestHorizontal
            ? { anchor: { x: bestHorizontal.point.x + deltaCorrection.x, y: bestHorizontal.match.y }, match: bestHorizontal.match }
            : null,
          vertical: bestVertical
            ? { anchor: { x: bestVertical.match.x, y: bestVertical.point.y + deltaCorrection.y }, match: bestVertical.match }
            : null,
        }
      : null;

  return { deltaCorrection, guide };
};
