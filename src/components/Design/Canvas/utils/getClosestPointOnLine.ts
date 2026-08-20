// types
import { TLineSegment, TPoint } from 'types/canvas';

export type TClosestPointOnLine = { point: TPoint; t: number };

export const getClosestPointOnLine = (point: TPoint, line: TLineSegment): TClosestPointOnLine => {
  const dx = line.x2 - line.x1;
  const dy = line.y2 - line.y1;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared !== 0) {
    const t = Math.max(0, Math.min(1, ((point.x - line.x1) * dx + (point.y - line.y1) * dy) / lengthSquared));

    return { point: { x: line.x1 + t * dx, y: line.y1 + t * dy }, t };
  }

  return { point: { x: line.x1, y: line.y1 }, t: 0 };
};
