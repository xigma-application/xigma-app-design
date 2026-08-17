// types
import { TPoint } from 'types/canvas';

// utils
import { getVertexAngles } from 'utils/math/getVertexAngles';

export const getMaxCornerRadiusForVertices = (vertices: TPoint[]): number => {
  const cotHalfAngles = getVertexAngles(vertices).map((angle) => 1 / Math.tan(angle / 2));

  return vertices.reduce((max, vertex, index) => {
    const nextIndex = (index + 1) % vertices.length;
    const next = vertices[nextIndex];
    const edgeLength = Math.hypot(next.x - vertex.x, next.y - vertex.y);
    const maxForEdge = edgeLength / (cotHalfAngles[index] + cotHalfAngles[nextIndex]);

    return Math.min(max, maxForEdge);
  }, Infinity);
};
