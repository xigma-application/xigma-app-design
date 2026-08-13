// types
import { TTextNode } from 'types/design/types';

export const flipGlyphVertices = (vertices: Float32Array, node: TTextNode): Float32Array => {
  if (!node.flipX && !node.flipY) {
    return vertices;
  }

  const flipped = new Float32Array(vertices.length);
  const mirrorX = 2 * node.x + node.width;
  const mirrorY = 2 * node.y + node.height;

  for (let i = 0; i < vertices.length; i += 4) {
    flipped[i] = node.flipX ? mirrorX - vertices[i] : vertices[i];
    flipped[i + 1] = node.flipY ? mirrorY - vertices[i + 1] : vertices[i + 1];
    flipped[i + 2] = vertices[i + 2];
    flipped[i + 3] = vertices[i + 3];
  }

  return flipped;
};
