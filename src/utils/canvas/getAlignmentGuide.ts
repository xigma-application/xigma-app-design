// types
import { TPoint } from 'types/canvas';

export type TPointAlignmentMatch = {
  horizontal: TPoint | null;
  point: TPoint;
  vertical: TPoint | null;
};

export const getAlignmentGuide = (point: TPoint, candidates: TPoint[], toleranceWorldUnits: number): TPointAlignmentMatch => {
  let horizontal: TPoint | null = null;
  let horizontalDistance = Infinity;
  let vertical: TPoint | null = null;
  let verticalDistance = Infinity;

  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index];
    const distanceY = Math.abs(candidate.y - point.y);
    const distanceX = Math.abs(candidate.x - point.x);

    if (distanceY <= toleranceWorldUnits && distanceY < horizontalDistance) {
      horizontal = candidate;
      horizontalDistance = distanceY;
    }

    if (distanceX <= toleranceWorldUnits && distanceX < verticalDistance) {
      vertical = candidate;
      verticalDistance = distanceX;
    }
  }

  const snappedPoint: TPoint = { x: vertical ? vertical.x : point.x, y: horizontal ? horizontal.y : point.y };

  return { horizontal, point: snappedPoint, vertical };
};
