// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getStarPoints } from 'utils/canvas/shapes/getStarPoints';

export const isPointInStar = (point: TPoint, star: TDraftRect & { points: number; ratio: number }): boolean => {
  const vertices = getStarPoints(star, star.points, star.ratio);

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
