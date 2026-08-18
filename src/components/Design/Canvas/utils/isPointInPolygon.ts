// others
import { ROUNDED_POLYGON_CORNER_SEGMENTS } from 'constant/canvas';

// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { flipPoint } from 'utils/math/flipPoint';
import { getPolygonPoints } from 'utils/canvas/shapes/getPolygonPoints';
import { getRoundedPolygonPoints } from 'utils/canvas/shapes/getRoundedPolygonPoints';
import { isPointInPolygonVertices } from './isPointInPolygonVertices';

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

  return isPointInPolygonVertices(testPoint, vertices);
};
