// types
import { TPoint } from 'types/canvas';

// utils
import { PARALLEL_EPSILON } from './constants';

export const getLineIntersection = (pointA: TPoint, directionA: TPoint, pointB: TPoint, directionB: TPoint): TPoint | null => {
  const denominator = directionA.x * directionB.y - directionA.y * directionB.x;

  if (Math.abs(denominator) < PARALLEL_EPSILON) {
    return null;
  }

  const t = ((pointB.x - pointA.x) * directionB.y - (pointB.y - pointA.y) * directionB.x) / denominator;
  return { x: pointA.x + t * directionA.x, y: pointA.y + t * directionA.y };
};
