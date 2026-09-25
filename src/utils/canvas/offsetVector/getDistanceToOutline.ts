// types
import { TOffsetVectorSourceOutline } from './types';
import { TPoint } from 'types/canvas';

// utils
import { getClosestPointOnSegment } from 'utils/math/getClosestPointOnSegment';

export const getDistanceToOutline = (point: TPoint, { closed, points }: TOffsetVectorSourceOutline): number => {
  const segmentCount = closed ? points.length : points.length - 1;

  return Array.from({ length: segmentCount }, (_, index) => {
    const closest = getClosestPointOnSegment(point, points[index], points[(index + 1) % points.length]);
    return Math.hypot(point.x - closest.x, point.y - closest.y);
  }).reduce((min, distance) => Math.min(min, distance), Infinity);
};
