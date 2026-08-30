// types
import { TPoint } from 'types/canvas';

export const rotateGlyphVertices = (vertices: Float32Array, center: TPoint, degrees: number): Float32Array => {
  if (degrees === 0) {
    return vertices;
  }

  const radians = (degrees * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const rotated = new Float32Array(vertices.length);

  for (let i = 0; i < vertices.length; i += 4) {
    const dx = vertices[i] - center.x;
    const dy = vertices[i + 1] - center.y;

    rotated[i] = center.x + dx * cos - dy * sin;
    rotated[i + 1] = center.y + dx * sin + dy * cos;
    rotated[i + 2] = vertices[i + 2];
    rotated[i + 3] = vertices[i + 3];
  }

  return rotated;
};
