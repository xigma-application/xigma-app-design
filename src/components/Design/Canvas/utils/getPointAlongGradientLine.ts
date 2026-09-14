// types
import { TPoint } from 'types/canvas';

export const getPointAlongGradientLine = (start: TPoint, end: TPoint, position: number): TPoint => ({
  x: start.x + (end.x - start.x) * position,
  y: start.y + (end.y - start.y) * position,
});
