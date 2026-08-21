// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

const isPointInPolygon = (point: TPoint, polygon: TPoint[]): boolean =>
  polygon.reduce((isInside, vertex, index) => {
    const previousVertex = polygon[(index - 1 + polygon.length) % polygon.length];
    const crossesRay = vertex.y > point.y !== previousVertex.y > point.y;

    if (crossesRay) {
      const intersectionX = ((previousVertex.x - vertex.x) * (point.y - vertex.y)) / (previousVertex.y - vertex.y) + vertex.x;
      return point.x < intersectionX ? !isInside : isInside;
    }

    return isInside;
  }, false);

export const getVectorPointsInPolygon = (node: TVectorNode, polygon: TPoint[]): string[] =>
  polygon.length < 3
    ? []
    : Object.values(node.vertices)
        .filter((vertex) => isPointInPolygon(vertex, polygon))
        .map((vertex) => vertex.id);
