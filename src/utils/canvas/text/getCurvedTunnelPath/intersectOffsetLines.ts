// types
import { TPoint } from 'types/canvas';

const PARALLEL_SINE_EPSILON = 1e-3;

export const intersectOffsetLines = (originA: TPoint, directionA: TPoint, originB: TPoint, directionB: TPoint): TPoint | null => {
  const lengthA = Math.hypot(directionA.x, directionA.y);
  const lengthB = Math.hypot(directionB.x, directionB.y);

  if (lengthA < 1e-6 || lengthB < 1e-6) {
    return null;
  }

  const denominator = (directionA.x * directionB.y - directionA.y * directionB.x) / (lengthA * lengthB);

  if (Math.abs(denominator) < PARALLEL_SINE_EPSILON) {
    return null;
  }

  const travel = ((originB.x - originA.x) * directionB.y - (originB.y - originA.y) * directionB.x) / (denominator * lengthA * lengthB);

  return { x: originA.x + directionA.x * travel, y: originA.y + directionA.y * travel };
};
