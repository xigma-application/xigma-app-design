// types
import { TPoint } from 'types/canvas';

// utils
import { getPolylineSegmentOffset } from '../getPolylineSegmentOffset';
import { getStrokeJoinPoints } from './getStrokeJoinPoints';

export type TStrokeOutlineLoops = { inner: TPoint[] | null; outer: TPoint[] };

const getSignedOffset = (from: TPoint, to: TPoint, halfWidth: number, sign: 1 | -1): TPoint | null => {
  const offset = getPolylineSegmentOffset(from, to, halfWidth);
  return offset ? { x: offset.x * sign, y: offset.y * sign } : null;
};

const getClosedLoopSide = (points: TPoint[], halfWidth: number, sign: 1 | -1): TPoint[] => {
  const count = points.length;
  const offsets = points.map((point, index) => getSignedOffset(point, points[(index + 1) % count], halfWidth, sign));

  return points.flatMap((point, index) => {
    const previousOffset = offsets[(index - 1 + count) % count];
    const nextOffset = offsets[index];

    return previousOffset && nextOffset ? getStrokeJoinPoints(point, previousOffset, nextOffset, halfWidth) : [];
  });
};

const getOpenPathSide = (points: TPoint[], halfWidth: number, sign: 1 | -1): TPoint[] => {
  const offsets = points.slice(0, -1).map((point, index) => getSignedOffset(point, points[index + 1], halfWidth, sign));

  return points.flatMap((point, index) => {
    const previousOffset = offsets[index - 1] ?? null;
    const nextOffset = offsets[index] ?? null;

    if (previousOffset && nextOffset) {
      return getStrokeJoinPoints(point, previousOffset, nextOffset, halfWidth);
    }

    const singleOffset = previousOffset ?? nextOffset;

    return singleOffset ? [{ x: point.x + singleOffset.x, y: point.y + singleOffset.y }] : [];
  });
};

export const getStrokeOutlinePolygons = (points: TPoint[], halfWidth: number, closed: boolean): TStrokeOutlineLoops =>
  closed
    ? { inner: getClosedLoopSide(points, halfWidth, -1), outer: getClosedLoopSide(points, halfWidth, 1) }
    : { inner: null, outer: [...getOpenPathSide(points, halfWidth, 1), ...getOpenPathSide(points, halfWidth, -1).reverse()] };
