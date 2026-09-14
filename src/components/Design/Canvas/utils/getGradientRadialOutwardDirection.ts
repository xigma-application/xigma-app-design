// types
import { TPoint } from 'types/canvas';

export const getGradientRadialOutwardDirection = (point: TPoint, center: TPoint): TPoint => {
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  const length = Math.hypot(dx, dy);

  if (length === 0) {
    return { x: 0, y: -1 };
  }

  return { x: dx / length, y: dy / length };
};
