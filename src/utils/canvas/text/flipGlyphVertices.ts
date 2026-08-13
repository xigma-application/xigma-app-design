// types
import { TTextNode } from 'types/design/types';

// utils
import { flipTextPoint } from './flipTextPoint';

export const flipGlyphVertices = (vertices: Float32Array, node: TTextNode): Float32Array => {
  if (!node.flipX && !node.flipY) {
    return vertices;
  }

  const flipped = new Float32Array(vertices.length);

  for (let i = 0; i < vertices.length; i += 4) {
    const point = flipTextPoint({ x: vertices[i], y: vertices[i + 1] }, node);

    flipped[i] = point.x;
    flipped[i + 1] = point.y;
    flipped[i + 2] = vertices[i + 2];
    flipped[i + 3] = vertices[i + 3];
  }

  return flipped;
};
