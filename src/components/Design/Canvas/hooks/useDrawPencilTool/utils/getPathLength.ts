// types
import { TPoint } from 'types/canvas';

export const getPathLength = (points: TPoint[]): number =>
  points.slice(1).reduce((total, point, index) => total + Math.hypot(point.x - points[index].x, point.y - points[index].y), 0);
