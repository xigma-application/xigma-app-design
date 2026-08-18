// types
import { TPoint } from 'types/canvas';

export const getRatioFromLocalPoint = (point: TPoint, center: TPoint, anchor: TPoint, min: number, max: number): number => {
  const direction: TPoint = { x: anchor.x - center.x, y: anchor.y - center.y };
  const lengthSquared = direction.x * direction.x + direction.y * direction.y;
  const projected = ((point.x - center.x) * direction.x + (point.y - center.y) * direction.y) / lengthSquared;

  return Math.min(Math.max(projected, min), max);
};
