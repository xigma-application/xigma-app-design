// types
import { TPoint } from 'types/canvas';

export const flipPoint = (point: TPoint, center: TPoint, flipX: boolean, flipY: boolean): TPoint => ({
  x: flipX ? 2 * center.x - point.x : point.x,
  y: flipY ? 2 * center.y - point.y : point.y,
});
