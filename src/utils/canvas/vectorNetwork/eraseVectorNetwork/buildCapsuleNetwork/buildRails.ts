// types
import { TPoint } from 'types/canvas';

// utils
import { getPointDirection } from './getPointDirection';

export const buildRails = (path: TPoint[], radius: number): { left: TPoint[]; right: TPoint[] } => {
  const left: TPoint[] = [];
  const right: TPoint[] = [];

  path.forEach((point, index) => {
    const direction = getPointDirection(path, index);

    left.push({ x: point.x - direction.y * radius, y: point.y + direction.x * radius });
    right.push({ x: point.x + direction.y * radius, y: point.y - direction.x * radius });
  });

  return { left, right };
};
