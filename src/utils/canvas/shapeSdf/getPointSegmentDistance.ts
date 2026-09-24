// types
import { TPoint } from 'types/canvas';

export const getPointSegmentDistance = (point: TPoint, start: TPoint, end: TPoint): number => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  const t = lengthSquared > 0 ? Math.min(1, Math.max(0, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared)) : 0;

  return Math.hypot(point.x - (start.x + t * dx), point.y - (start.y + t * dy));
};
