// types
import { TPoint } from 'types/canvas';

const clampTangentMagnitude = (tangent: TPoint, point: TPoint, previous: TPoint | undefined, next: TPoint | undefined): TPoint => {
  const distanceToPrevious = previous ? Math.hypot(point.x - previous.x, point.y - previous.y) : Infinity;
  const distanceToNext = next ? Math.hypot(next.x - point.x, next.y - point.y) : Infinity;
  const maxMagnitude = Math.min(distanceToPrevious, distanceToNext);
  const tangentMagnitude = Math.hypot(tangent.x, tangent.y);

  if (tangentMagnitude > maxMagnitude) {
    const scale = maxMagnitude / tangentMagnitude;

    return { x: tangent.x * scale, y: tangent.y * scale };
  }

  return tangent;
};

export const getCatmullRomTangents = (points: TPoint[], tension: number): TPoint[] =>
  points.map((point, index) => {
    const previous = points[index - 1];
    const next = points[index + 1];
    const tangent = { x: ((next ?? point).x - (previous ?? point).x) * tension, y: ((next ?? point).y - (previous ?? point).y) * tension };

    return clampTangentMagnitude(tangent, point, previous, next);
  });
