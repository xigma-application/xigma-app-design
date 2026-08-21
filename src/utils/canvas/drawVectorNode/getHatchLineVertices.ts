// types
import { TPoint } from 'types/canvas';

export const getHatchLineVertices = (points: TPoint[], zoom: number, spacingPx: number): number[] => {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  const step = (spacingPx * Math.SQRT2) / zoom;
  const minOffset = minX - maxY;
  const maxOffset = maxX - minY;
  const vertices: number[] = [];

  for (let offset = minOffset; offset <= maxOffset; offset += step) {
    const startX = Math.max(minX, minY + offset);
    const endX = Math.min(maxX, maxY + offset);

    if (endX > startX) {
      vertices.push(startX, startX - offset, endX, endX - offset);
    }
  }

  return vertices;
};
