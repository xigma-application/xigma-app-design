// types
import { TPoint } from 'types/canvas';

export const getClosestPointOnSegment = (point: TPoint, start: TPoint, end: TPoint): TPoint => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared > 0) {
    const t = Math.min(1, Math.max(0, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared));
    return { x: start.x + t * dx, y: start.y + t * dy };
  }

  return start;
};
