// others
import { TANGENT_SPAN } from './constants';

export const getCenterlineTangents = (points: { x: number; y: number }[]): { x: number; y: number }[] =>
  points.map((_, index) => {
    const before = points[Math.max(0, index - TANGENT_SPAN)];
    const after = points[Math.min(points.length - 1, index + TANGENT_SPAN)];
    const length = Math.hypot(after.x - before.x, after.y - before.y) || 1;

    return { x: (after.x - before.x) / length, y: (after.y - before.y) / length };
  });
