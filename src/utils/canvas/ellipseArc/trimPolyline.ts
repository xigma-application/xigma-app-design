// types
import { TPoint } from 'types/canvas';

// utils
import { getPolylineLength } from './getPolylineLength';
import { getPolylinePointAtLength } from './getPolylinePointAtLength';

const isSamePoint = (first: TPoint, second: TPoint): boolean => Math.hypot(first.x - second.x, first.y - second.y) < 1e-9;

export const trimPolyline = (points: TPoint[], fromStart: number, fromEnd: number): TPoint[] => {
  const start = getPolylinePointAtLength(points, fromStart);
  const end = getPolylinePointAtLength(points, getPolylineLength(points) - fromEnd);

  return [start.point, ...points.slice(start.index + 1, end.index + 1), end.point].filter(
    (point, index, trimmed) => index === 0 || !isSamePoint(point, trimmed[index - 1]),
  );
};
