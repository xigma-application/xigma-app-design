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
