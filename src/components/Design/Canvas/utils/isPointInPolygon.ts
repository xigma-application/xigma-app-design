// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getPolygonPoints } from 'utils/canvas/shapes/getPolygonPoints';

export const isPointInPolygon = (point: TPoint, polygon: TDraftRect & { sides: number }): boolean => {
  const vertices = getPolygonPoints(polygon, polygon.sides);

  return vertices.reduce((isInside, vertex, index) => {
    const previousVertex = vertices[(index - 1 + vertices.length) % vertices.length];
    const crossesRay = vertex.y > point.y !== previousVertex.y > point.y;

    if (crossesRay) {
      const intersectionX = ((previousVertex.x - vertex.x) * (point.y - vertex.y)) / (previousVertex.y - vertex.y) + vertex.x;
      return point.x < intersectionX ? !isInside : isInside;
    }

    return isInside;
  }, false);
};
