// types
import { TPoint } from 'types/canvas';

export type TPointAlignmentMatch = {
  horizontal: TPoint | null;
  point: TPoint;
  vertical: TPoint | null;
};

type TClosestMatch = { distance: number; point: TPoint } | null;

const getClosestMatch = (current: TClosestMatch, candidate: TPoint, distance: number, toleranceWorldUnits: number): TClosestMatch => {
  if (distance <= toleranceWorldUnits && (!current || distance < current.distance)) {
    return { distance, point: candidate };
  }

  return current;
};

export const getAlignmentGuide = (point: TPoint, candidates: TPoint[], toleranceWorldUnits: number): TPointAlignmentMatch => {
  const { horizontal, vertical } = candidates.reduce(
    (acc, candidate) => ({
      horizontal: getClosestMatch(acc.horizontal, candidate, Math.abs(candidate.y - point.y), toleranceWorldUnits),
      vertical: getClosestMatch(acc.vertical, candidate, Math.abs(candidate.x - point.x), toleranceWorldUnits),
    }),
    { horizontal: null as TClosestMatch, vertical: null as TClosestMatch },
  );
  const snappedPoint: TPoint = { x: vertical ? vertical.point.x : point.x, y: horizontal ? horizontal.point.y : point.y };

  return { horizontal: horizontal?.point ?? null, point: snappedPoint, vertical: vertical?.point ?? null };
};
