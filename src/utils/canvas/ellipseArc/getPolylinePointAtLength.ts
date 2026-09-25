// types
import { TPoint } from 'types/canvas';

export const getPolylinePointAtLength = (points: TPoint[], length: number): { index: number; point: TPoint } => {
  let remaining = length;

  for (let index = 0; index < points.length - 1; index += 1) {
    const segment = Math.hypot(points[index + 1].x - points[index].x, points[index + 1].y - points[index].y);

    if (remaining <= segment && segment > 0) {
      const t = remaining / segment;

      return {
        index,
        point: {
          x: points[index].x + (points[index + 1].x - points[index].x) * t,
          y: points[index].y + (points[index + 1].y - points[index].y) * t,
        },
      };
    }

    remaining -= segment;
  }

  return { index: points.length - 1, point: points[points.length - 1] };
};
