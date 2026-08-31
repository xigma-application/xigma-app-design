// types
import { TPoint } from 'types/canvas';

const MITER_LIMIT = 4;

export const getStrokeJoinPoints = (vertex: TPoint, offsetPrevious: TPoint, offsetNext: TPoint, halfWidth: number): TPoint[] => {
  const previousUnit: TPoint = { x: offsetPrevious.x / halfWidth, y: offsetPrevious.y / halfWidth };
  const nextUnit: TPoint = { x: offsetNext.x / halfWidth, y: offsetNext.y / halfWidth };
  const bisectorSum: TPoint = { x: previousUnit.x + nextUnit.x, y: previousUnit.y + nextUnit.y };
  const bisectorLength = Math.hypot(bisectorSum.x, bisectorSum.y);
  const bevelPoints: TPoint[] = [
    { x: vertex.x + offsetPrevious.x, y: vertex.y + offsetPrevious.y },
    { x: vertex.x + offsetNext.x, y: vertex.y + offsetNext.y },
  ];

  if (bisectorLength !== 0) {
    const cosHalfAngle = bisectorLength / 2;
    const miterLength = halfWidth / cosHalfAngle;

    if (miterLength <= halfWidth * MITER_LIMIT) {
      const scale = miterLength / bisectorLength;
      return [{ x: vertex.x + bisectorSum.x * scale, y: vertex.y + bisectorSum.y * scale }];
    }
  }

  return bevelPoints;
};
