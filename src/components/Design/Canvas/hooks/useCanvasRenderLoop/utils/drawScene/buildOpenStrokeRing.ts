// types
import { TPoint } from 'types/canvas';
import { TStrokeRing } from './types';

const getScaledNormal = (start: TPoint, end: TPoint, length: number, halfWidth: number): TPoint =>
  length > 0 ? { x: ((end.y - start.y) / length) * halfWidth, y: (-(end.x - start.x) / length) * halfWidth } : { x: 0, y: 0 };

export const buildOpenStrokeRing = (start: TPoint, end: TPoint, halfWidth: number): TStrokeRing => {
  const length = Math.hypot(end.x - start.x, end.y - start.y);
  const normal = getScaledNormal(start, end, length, halfWidth);
  const shift = (point: TPoint, sign: 1 | -1): TPoint => ({ x: point.x + normal.x * sign, y: point.y + normal.y * sign });

  return {
    closed: false,
    cumulative: [0, length],
    inner: [shift(start, -1), shift(end, -1)],
    lengths: [length, 0],
    mids: [start, end],
    outer: [shift(start, 1), shift(end, 1)],
    perimeter: length,
  };
};
