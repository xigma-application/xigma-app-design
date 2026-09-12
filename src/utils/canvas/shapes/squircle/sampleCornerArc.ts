// types
import { TPoint } from 'types/canvas';

const TWO_PI = Math.PI * 2;

export const sampleCornerArc = (center: TPoint, radius: number, from: TPoint, to: TPoint, segments: number): TPoint[] => {
  const angleFrom = Math.atan2(from.y - center.y, from.x - center.x);
  const angleTo = Math.atan2(to.y - center.y, to.x - center.x);
  const delta = ((((angleTo - angleFrom + Math.PI) % TWO_PI) + TWO_PI) % TWO_PI) - Math.PI;

  return Array.from({ length: segments + 1 }, (_, index) => {
    const angle = angleFrom + (index / segments) * delta;
    return { x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) };
  });
};
