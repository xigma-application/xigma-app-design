// types
import { TPoint } from 'types/canvas';

const PARALLEL_SINE_EPSILON = 1e-9;
const ENDPOINT_PROXIMITY_EPSILON = 1e-4;

const isNearPoint = (a: TPoint, b: TPoint): boolean => Math.hypot(a.x - b.x, a.y - b.y) < ENDPOINT_PROXIMITY_EPSILON;

export const getStraightSegmentIntersection = (
  p1: TPoint,
  p2: TPoint,
  p3: TPoint,
  p4: TPoint,
): { point: TPoint; t: number; u: number } | null => {
  const ax = p2.x - p1.x;
  const ay = p2.y - p1.y;
  const bx = p4.x - p3.x;
  const by = p4.y - p3.y;
  const denominator = ax * by - ay * bx;
  const lengthProduct = Math.hypot(ax, ay) * Math.hypot(bx, by);
  const isNearParallel = Math.abs(denominator) <= PARALLEL_SINE_EPSILON * lengthProduct;

  if (denominator !== 0 && !isNearParallel) {
    const t = ((p3.x - p1.x) * by - (p3.y - p1.y) * bx) / denominator;
    const u = ((p3.x - p1.x) * ay - (p3.y - p1.y) * ax) / denominator;

    if (t > 0 && t < 1 && u > 0 && u < 1) {
      const point = { x: p1.x + t * ax, y: p1.y + t * ay };
      const touchesAnEndpoint = isNearPoint(point, p1) || isNearPoint(point, p2) || isNearPoint(point, p3) || isNearPoint(point, p4);

      if (!touchesAnEndpoint) {
        return { point, t, u };
      }
    }
  }

  return null;
};
