// types
import { TPoint } from 'types/canvas';

export const toFanVertices = (center: TPoint, points: TPoint[]): number[] =>
  [center, ...points, points[0]].flatMap((point) => [point.x, point.y]);
