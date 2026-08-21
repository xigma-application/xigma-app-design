// types
import { TPoint } from 'types/canvas';
import { TVectorTangent } from 'types/design/types';

const getCubicBezierPoint = (p0: TPoint, p1: TPoint, p2: TPoint, p3: TPoint, t: number): TPoint => {
  const mt = 1 - t;
  const a = mt * mt * mt;
  const b = 3 * mt * mt * t;
  const c = 3 * mt * t * t;
  const d = t * t * t;

  return { x: a * p0.x + b * p1.x + c * p2.x + d * p3.x, y: a * p0.y + b * p1.y + c * p2.y + d * p3.y };
};

const hasZeroMagnitude = (tangent: TVectorTangent): boolean => !tangent || (tangent.x === 0 && tangent.y === 0);

export const flattenSegment = (
  start: TPoint,
  end: TPoint,
  tangentAtStart: TVectorTangent,
  tangentAtEnd: TVectorTangent,
  segmentCount: number,
): TPoint[] => {
  if (hasZeroMagnitude(tangentAtStart) && hasZeroMagnitude(tangentAtEnd)) {
    return [start, end];
  }

  const controlStart = tangentAtStart ? { x: start.x + tangentAtStart.x, y: start.y + tangentAtStart.y } : start;
  const controlEnd = tangentAtEnd ? { x: end.x + tangentAtEnd.x, y: end.y + tangentAtEnd.y } : end;

  return Array.from({ length: segmentCount + 1 }, (_, index) =>
    getCubicBezierPoint(start, controlStart, controlEnd, end, index / segmentCount),
  );
};
