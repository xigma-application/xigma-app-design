// types
import { TPoint } from 'types/canvas';

// utils
import { clamp } from 'utils/math/clamp';

export const getPositionAlongGradientLine = (point: TPoint, start: TPoint, end: TPoint): number => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSq = dx * dx + dy * dy;

  if (lengthSq !== 0) {
    const t = ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSq;
    return clamp(t, 0, 1);
  }

  return 0;
};
