// types
import { TPoint } from 'types/canvas';

// utils
import { rotatePoint } from 'utils/math/rotatePoint';

export const rotateVertices = (vertices: Float32Array, center: TPoint, degrees: number): Float32Array => {
  if (degrees === 0) {
    return vertices;
  }

  const rotated = new Float32Array(vertices.length);

  for (let i = 0; i < vertices.length; i += 4) {
    const point = rotatePoint({ x: vertices[i], y: vertices[i + 1] }, center, degrees);

    rotated[i] = point.x;
    rotated[i + 1] = point.y;
    rotated[i + 2] = vertices[i + 2];
    rotated[i + 3] = vertices[i + 3];
  }

  return rotated;
};
