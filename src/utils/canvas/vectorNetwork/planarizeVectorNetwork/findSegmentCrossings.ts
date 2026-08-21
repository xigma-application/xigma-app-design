// types
import { TPoint } from 'types/canvas';

// utils
import { getStraightSegmentIntersection } from './getStraightSegmentIntersection';

export const findSegmentCrossings = (pointsA: TPoint[], pointsB: TPoint[]): { tA: number; tB: number; point: TPoint }[] => {
  const crossings: { tA: number; tB: number; point: TPoint }[] = [];

  for (let i = 0; i < pointsA.length - 1; i += 1) {
    for (let j = 0; j < pointsB.length - 1; j += 1) {
      const intersection = getStraightSegmentIntersection(pointsA[i], pointsA[i + 1], pointsB[j], pointsB[j + 1]);

      if (intersection) {
        crossings.push({
          point: intersection.point,
          tA: (i + intersection.t) / (pointsA.length - 1),
          tB: (j + intersection.u) / (pointsB.length - 1),
        });
      }
    }
  }

  return crossings;
};
