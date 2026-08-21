// types
import { TPoint } from 'types/canvas';

// utils
import { getQuadVertices } from '../getQuadVertices';

const MITER_LIMIT = 4;

export const getBevelVertices = (point: TPoint, previousOffset: TPoint, nextOffset: TPoint): number[] =>
  getQuadVertices(
    point.x + previousOffset.x,
    point.y + previousOffset.y,
    point.x + nextOffset.x,
    point.y + nextOffset.y,
    point.x - nextOffset.x,
    point.y - nextOffset.y,
    point.x - previousOffset.x,
    point.y - previousOffset.y,
  );

export const getPolylineJoinVertices = (point: TPoint, previousOffset: TPoint, nextOffset: TPoint, halfWidth: number): number[] => {
  const previousUnit: TPoint = { x: previousOffset.x / halfWidth, y: previousOffset.y / halfWidth };
  const nextUnit: TPoint = { x: nextOffset.x / halfWidth, y: nextOffset.y / halfWidth };
  const previousDirection: TPoint = { x: previousUnit.y, y: -previousUnit.x };
  const nextDirection: TPoint = { x: nextUnit.y, y: -nextUnit.x };
  const cross = previousDirection.x * nextDirection.y - previousDirection.y * nextDirection.x;

  if (cross === 0) {
    return getBevelVertices(point, previousOffset, nextOffset);
  }

  const bisectorSum: TPoint = { x: previousUnit.x + nextUnit.x, y: previousUnit.y + nextUnit.y };
  const bisectorLength = Math.hypot(bisectorSum.x, bisectorSum.y);
  const cosHalfAngle = bisectorLength / 2;
  const miterLength = halfWidth / cosHalfAngle;

  if (bisectorLength === 0 || miterLength > halfWidth * MITER_LIMIT) {
    return getBevelVertices(point, previousOffset, nextOffset);
  }

  const outerSign = cross > 0 ? -1 : 1;
  const outerPrevious: TPoint = { x: previousOffset.x * outerSign, y: previousOffset.y * outerSign };
  const outerNext: TPoint = { x: nextOffset.x * outerSign, y: nextOffset.y * outerSign };
  const miterScale = (miterLength * outerSign) / bisectorLength;
  const miterPoint: TPoint = {
    x: point.x + bisectorSum.x * miterScale,
    y: point.y + bisectorSum.y * miterScale,
  };

  return [
    point.x,
    point.y,
    point.x + outerPrevious.x,
    point.y + outerPrevious.y,
    miterPoint.x,
    miterPoint.y,
    point.x,
    point.y,
    miterPoint.x,
    miterPoint.y,
    point.x + outerNext.x,
    point.y + outerNext.y,
  ];
};
