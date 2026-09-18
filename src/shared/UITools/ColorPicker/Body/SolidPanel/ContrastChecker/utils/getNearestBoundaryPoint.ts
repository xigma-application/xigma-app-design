// others
import { projectPointOnSegment } from './projectPointOnSegment';

// types
import { TContrastBoundary, TContrastCurvePoint } from '../types';

export type TNearestBoundaryPoint = { passSide: TContrastBoundary['passSide']; point: TContrastCurvePoint };

const MAX_V = 100;

const getDistanceSquared = (a: TContrastCurvePoint, b: TContrastCurvePoint): number => (a.s - b.s) ** 2 + (a.v - b.v) ** 2;

export const getNearestBoundaryPoint = (boundaries: TContrastBoundary[], from: TContrastCurvePoint): TNearestBoundaryPoint | null => {
  let nearest: TNearestBoundaryPoint | null = null;
  let nearestDistance = Infinity;

  boundaries.forEach(({ passSide, points }) => {
    const curve = points.filter((point) => point.v < MAX_V);
    const segmentEnds = curve.length === 1 ? curve : curve.slice(1);

    segmentEnds.forEach((end, index) => {
      const candidate = curve.length === 1 ? end : projectPointOnSegment(from, curve[index], end);
      const distance = getDistanceSquared(from, candidate);

      if (distance < nearestDistance) {
        nearest = { passSide, point: candidate };
        nearestDistance = distance;
      }
    });
  });

  return nearest;
};
