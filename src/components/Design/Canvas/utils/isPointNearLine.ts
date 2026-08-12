// types
import { TLineSegment, TPoint } from 'types/canvas';

export const isPointNearLine = (point: TPoint, line: TLineSegment, tolerance: number): boolean => {
  const dx = line.x2 - line.x1;
  const dy = line.y2 - line.y1;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared !== 0) {
    const t = Math.max(0, Math.min(1, ((point.x - line.x1) * dx + (point.y - line.y1) * dy) / lengthSquared));
    const closestX = line.x1 + t * dx;
    const closestY = line.y1 + t * dy;
    return Math.hypot(point.x - closestX, point.y - closestY) <= tolerance;
  }

  return Math.hypot(point.x - line.x1, point.y - line.y1) <= tolerance;
};
