// others
import { ROUNDED_POLYGON_CORNER_SEGMENTS } from 'constant/canvas';

// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { flipPoint } from 'utils/math/flipPoint';
import { getPolygonPoints } from 'utils/canvas/shapes/getPolygonPoints';
import { getRoundedPolygonPoints } from 'utils/canvas/shapes/getRoundedPolygonPoints';

export const isPointInPolygon = (
  point: TPoint,
  polygon: TDraftRect & { cornerRadius?: number; flipX: boolean; flipY: boolean; sides: number },
): boolean => {
  const center: TPoint = { x: polygon.x + polygon.width / 2, y: polygon.y + polygon.height / 2 };
  const testPoint = flipPoint(point, center, polygon.flipX, polygon.flipY);
  const cornerRadius = polygon.cornerRadius ?? 0;
  const vertices =
    cornerRadius > 0
      ? getRoundedPolygonPoints({ ...polygon, cornerRadius }, ROUNDED_POLYGON_CORNER_SEGMENTS)
      : getPolygonPoints(polygon, polygon.sides);

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
