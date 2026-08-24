// types
import { TPoint } from 'types/canvas';

const getPerpendicularDistance = (point: TPoint, lineStart: TPoint, lineEnd: TPoint): number => {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const lineLength = Math.hypot(dx, dy);

  if (lineLength > 0) {
    return Math.abs(dy * point.x - dx * point.y + lineEnd.x * lineStart.y - lineEnd.y * lineStart.x) / lineLength;
  }

  return Math.hypot(point.x - lineStart.x, point.y - lineStart.y);
};

const getFarthestPointIndex = (points: TPoint[], lineStart: TPoint, lineEnd: TPoint): { distance: number; index: number } => {
  let farthest = { distance: -1, index: 0 };

  for (let index = 1; index < points.length - 1; index += 1) {
    const distance = getPerpendicularDistance(points[index], lineStart, lineEnd);

    if (distance > farthest.distance) {
      farthest = { distance, index };
    }
  }

  return farthest;
};

export const simplifyPencilPoints = (points: TPoint[], tolerance: number): TPoint[] => {
  if (points.length > 2) {
    const first = points[0];
    const last = points[points.length - 1];
    const { distance: maxDistance, index: maxIndex } = getFarthestPointIndex(points, first, last);

    if (maxDistance > tolerance) {
      const left = simplifyPencilPoints(points.slice(0, maxIndex + 1), tolerance);
      const right = simplifyPencilPoints(points.slice(maxIndex), tolerance);

      return [...left.slice(0, -1), ...right];
    }

    return [first, last];
  }

  return points;
};
