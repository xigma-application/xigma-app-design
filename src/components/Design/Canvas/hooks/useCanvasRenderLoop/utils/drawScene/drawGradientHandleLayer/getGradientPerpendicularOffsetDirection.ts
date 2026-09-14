// types
import { TPoint } from 'types/canvas';

export const getGradientPerpendicularOffsetDirection = (start: TPoint, end: TPoint): TPoint => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);

  if (length === 0) {
    return { x: 0, y: -1 };
  }

  return { x: dy / length, y: -dx / length };
};
