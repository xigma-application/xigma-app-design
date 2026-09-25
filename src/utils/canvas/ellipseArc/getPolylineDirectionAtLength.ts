// types
import { TPoint } from 'types/canvas';

// utils
import { getPolylinePointAtLength } from './getPolylinePointAtLength';
import { normalizeVector } from 'utils/math/normalizeVector';

export const getPolylineDirectionAtLength = (points: TPoint[], length: number): TPoint => {
  const index = Math.min(getPolylinePointAtLength(points, length).index, points.length - 2);
  return normalizeVector({ x: points[index + 1].x - points[index].x, y: points[index + 1].y - points[index].y });
};
