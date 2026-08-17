// types
import { TPoint } from 'types/canvas';

const getVertexAngle = (count: number): number => (2 * Math.PI) / count - Math.PI / 2;

export const getVertexCountFromLocalPoint = (point: TPoint, center: TPoint, min: number, max: number): number => {
  const localX = point.x - center.x;

  if (localX <= 0) {
    return min;
  }

  const theta = Math.atan2(point.y - center.y, localX);
  let closestCount = min;
  let closestDiff = Infinity;

  for (let count = min; count <= max; count += 1) {
    const diff = Math.abs(theta - getVertexAngle(count));

    if (diff < closestDiff) {
      closestDiff = diff;
      closestCount = count;
    }
  }

  return closestCount;
};
