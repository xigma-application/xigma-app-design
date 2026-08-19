// types
import { TPoint } from 'types/canvas';

// utils
import { getQuadVertices } from '../getQuadVertices';

export const getThickPolylineVertices = (points: TPoint[], halfWidth: number): number[] =>
  points.slice(0, -1).flatMap((point, index) => {
    const next = points[index + 1];
    const dx = next.x - point.x;
    const dy = next.y - point.y;
    const length = Math.hypot(dx, dy);

    if (length === 0) {
      return [];
    }

    const offsetX = (-dy / length) * halfWidth;
    const offsetY = (dx / length) * halfWidth;

    return getQuadVertices(
      point.x + offsetX,
      point.y + offsetY,
      next.x + offsetX,
      next.y + offsetY,
      next.x - offsetX,
      next.y - offsetY,
      point.x - offsetX,
      point.y - offsetY,
    );
  });
