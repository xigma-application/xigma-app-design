// types
import { TPoint } from 'types/canvas';

const getDistance = (from: TPoint, to: TPoint): number => Math.hypot(to.x - from.x, to.y - from.y);

const getEdgeAtDistance = (lengths: number[], distance: number): { index: number; remaining: number } => {
  let remaining = distance;
  let index = 0;

  while (index < lengths.length - 1 && remaining > lengths[index]) {
    remaining -= lengths[index];
    index += 1;
  }

  return { index, remaining };
};

const getPointAtDistance = (points: TPoint[], lengths: number[], distance: number): TPoint => {
  const { index, remaining } = getEdgeAtDistance(lengths, distance);
  const next = points[(index + 1) % points.length];
  const t = lengths[index] > 0 ? Math.min(remaining / lengths[index], 1) : 0;

  return { x: points[index].x + (next.x - points[index].x) * t, y: points[index].y + (next.y - points[index].y) * t };
};

export const resampleClosedLoop = (points: TPoint[], count: number): TPoint[] => {
  const lengths = points.map((point, index) => getDistance(point, points[(index + 1) % points.length]));
  const perimeter = lengths.reduce((total, length) => total + length, 0);

  return perimeter > 0
    ? Array.from({ length: count }, (_, index) => getPointAtDistance(points, lengths, (index / count) * perimeter))
    : points;
};
