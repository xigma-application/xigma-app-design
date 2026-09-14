// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { rotatePoint } from 'utils/math/rotatePoint';

export const getGradientAngleFromPoint = (point: TPoint, bounds: TDraftRect, rotation: number): number => {
  const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const localPoint = rotation === 0 ? point : rotatePoint(point, center, -rotation);

  return Math.atan2(localPoint.y - center.y, localPoint.x - center.x);
};
