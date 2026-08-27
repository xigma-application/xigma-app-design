// types
import { TPoint } from 'types/canvas';

// utils
import { getClosestPointOnLine } from 'components/Design/Canvas/utils/getClosestPointOnLine';

export const getCapsuleDistance = (point: TPoint, capsuleStart: TPoint, capsuleEnd: TPoint): number => {
  const { point: closest } = getClosestPointOnLine(point, {
    x1: capsuleStart.x,
    x2: capsuleEnd.x,
    y1: capsuleStart.y,
    y2: capsuleEnd.y,
  });

  return Math.hypot(point.x - closest.x, point.y - closest.y);
};

export const getPathDistance = (point: TPoint, path: TPoint[]): number => {
  if (path.length === 1) {
    return Math.hypot(point.x - path[0].x, point.y - path[0].y);
  }

  return path
    .slice(0, -1)
    .reduce((min, from, index) => Math.min(min, getCapsuleDistance(point, from, path[index + 1])), Number.POSITIVE_INFINITY);
};
