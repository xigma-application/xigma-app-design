// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { flipPoint } from 'utils/math/flipPoint';
import { getStarPoints } from 'utils/canvas/shapes/getStarPoints';

export const isPointInStar = (
  point: TPoint,
  star: TDraftRect & { flipX: boolean; flipY: boolean; points: number; ratio: number },
): boolean => {
  const center: TPoint = { x: star.x + star.width / 2, y: star.y + star.height / 2 };
  const testPoint = flipPoint(point, center, star.flipX, star.flipY);
  const vertices = getStarPoints(star, star.points, star.ratio);

  return vertices.reduce((isInside, vertex, index) => {
    const previousVertex = vertices[(index - 1 + vertices.length) % vertices.length];
    const crossesRay = vertex.y > testPoint.y !== previousVertex.y > testPoint.y;

    if (crossesRay) {
      const intersectionX = ((previousVertex.x - vertex.x) * (testPoint.y - vertex.y)) / (previousVertex.y - vertex.y) + vertex.x;
      return testPoint.x < intersectionX ? !isInside : isInside;
    }

    return isInside;
  }, false);
};
