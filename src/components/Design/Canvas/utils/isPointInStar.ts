// others
import { ROUNDED_STAR_CORNER_SEGMENTS } from 'constant/canvas';

// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { flipPoint } from 'utils/math/flipPoint';
import { getRoundedStarPoints } from 'utils/canvas/shapes/getRoundedStarPoints';
import { getStarPoints } from 'utils/canvas/shapes/getStarPoints';
import { isPointInPolygonVertices } from './isPointInPolygonVertices';

export const isPointInStar = (
  point: TPoint,
  star: TDraftRect & { cornerRadius?: number; flipX: boolean; flipY: boolean; points: number; ratio: number },
): boolean => {
  const center: TPoint = { x: star.x + star.width / 2, y: star.y + star.height / 2 };
  const testPoint = flipPoint(point, center, star.flipX, star.flipY);
  const cornerRadius = star.cornerRadius ?? 0;
  const vertices =
    cornerRadius > 0
      ? getRoundedStarPoints({ ...star, cornerRadius }, ROUNDED_STAR_CORNER_SEGMENTS)
      : getStarPoints(star, star.points, star.ratio);

  return isPointInPolygonVertices(testPoint, vertices);
};
