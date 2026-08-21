// types
import { TPoint } from 'types/canvas';

export const getStraightSegmentIntersection = (
  p1: TPoint,
  p2: TPoint,
  p3: TPoint,
  p4: TPoint,
): { point: TPoint; t: number; u: number } | null => {
  const denominator = (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x);

  if (denominator !== 0) {
    const t = ((p3.x - p1.x) * (p4.y - p3.y) - (p3.y - p1.y) * (p4.x - p3.x)) / denominator;
    const u = ((p3.x - p1.x) * (p2.y - p1.y) - (p3.y - p1.y) * (p2.x - p1.x)) / denominator;

    if (t > 0 && t < 1 && u > 0 && u < 1) {
      return { point: { x: p1.x + t * (p2.x - p1.x), y: p1.y + t * (p2.y - p1.y) }, t, u };
    }
  }

  return null;
};
