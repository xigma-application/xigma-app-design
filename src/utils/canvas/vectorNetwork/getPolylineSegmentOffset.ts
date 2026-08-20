// types
import { TPoint } from 'types/canvas';

export const getPolylineSegmentOffset = (from: TPoint, to: TPoint, halfWidth: number): TPoint | null => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);

  return length === 0 ? null : { x: (-dy / length) * halfWidth, y: (dx / length) * halfWidth };
};
