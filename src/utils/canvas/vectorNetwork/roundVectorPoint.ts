// types
import { TPoint } from 'types/canvas';

export const roundVectorPoint = (point: TPoint): TPoint => ({
  x: Math.round(point.x * 2) / 2,
  y: Math.round(point.y * 2) / 2,
});
