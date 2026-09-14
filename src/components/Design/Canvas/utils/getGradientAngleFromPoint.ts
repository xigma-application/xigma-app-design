// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { rotatePoint } from 'utils/math/rotatePoint';

export const getGradientAngleFromPoint = (point: TPoint, bounds: TDraftRect, rotation: number, pivot?: TPoint): number => {
  const boundsCenter: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const localPoint = rotation === 0 ? point : rotatePoint(point, boundsCenter, -rotation);
  const anglePivot = pivot ?? boundsCenter;

  return Math.atan2(localPoint.y - anglePivot.y, localPoint.x - anglePivot.x);
};
