// types
import { TPoint } from 'types/canvas';

const getDistance = (from: TPoint, to: TPoint): number => Math.hypot(to.x - from.x, to.y - from.y);

export const getLoopArcLengthPositions = (points: TPoint[]): number[] => {
  const segmentLengths = points.map((point, index) => getDistance(point, points[(index + 1) % points.length]));
  const perimeter = segmentLengths.reduce((total, length) => total + length, 0);

  if (perimeter > 0) {
    let cumulative = 0;

    return points.map((_, index) => {
      const position = cumulative / perimeter;

      cumulative += segmentLengths[index];

      return position;
    });
  }

  return points.map(() => 0);
};
