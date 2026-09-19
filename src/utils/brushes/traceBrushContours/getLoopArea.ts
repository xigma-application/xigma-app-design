// types
import { TContourPoint } from './types';

export const getLoopArea = (points: TContourPoint[]): number =>
  Math.abs(
    points.reduce((total, point, index) => {
      const next = points[(index + 1) % points.length];
      return total + (point.x * next.y - next.x * point.y);
    }, 0),
  ) / 2;
