// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { rotatePoint } from 'utils/math/rotatePoint';

export const getUnrotatedQueryPoint = (point: TPoint, bounds: TDraftRect, rotation: number): TPoint => {
  if (rotation === 0) {
    return point;
  }

  const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };

  return rotatePoint(point, center, -rotation);
};
