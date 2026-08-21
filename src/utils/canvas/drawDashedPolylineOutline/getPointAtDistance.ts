// types
import { TPoint } from 'types/canvas';

export type TPolylineSegment = readonly [TPoint, TPoint];

export const getPointAtDistance = (segments: TPolylineSegment[], perimeter: number, distance: number): TPoint => {
  const target = ((distance % perimeter) + perimeter) % perimeter;

  return segments.reduce(
    (walk, [start, end]) => {
      if (!walk.found) {
        const length = Math.hypot(end.x - start.x, end.y - start.y);

        if (walk.remaining <= length) {
          const t = length === 0 ? 0 : walk.remaining / length;
          return { found: true, point: { x: start.x + (end.x - start.x) * t, y: start.y + (end.y - start.y) * t }, remaining: 0 };
        }

        return { found: false, point: walk.point, remaining: walk.remaining - length };
      }

      return walk;
    },
    { found: false, point: segments[segments.length - 1][1], remaining: target },
  ).point;
};
