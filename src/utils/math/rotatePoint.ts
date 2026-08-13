// types
import { TPoint } from 'types/canvas';

export const rotatePoint = (point: TPoint, center: TPoint, degrees: number): TPoint => {
  if (degrees === 0) {
    return point;
  }

  const radians = (degrees * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const dx = point.x - center.x;
  const dy = point.y - center.y;

  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  };
};
