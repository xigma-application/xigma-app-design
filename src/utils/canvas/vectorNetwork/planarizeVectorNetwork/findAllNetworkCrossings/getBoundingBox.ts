// types
import { TBoundingBox } from './types';
import { TPoint } from 'types/canvas';

export const getBoundingBox = (points: TPoint[]): TBoundingBox => {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);

  return { maxX: Math.max(...xs), maxY: Math.max(...ys), minX: Math.min(...xs), minY: Math.min(...ys) };
};
