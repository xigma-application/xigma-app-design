// others
import { ROUNDED_POLYGON_CORNER_SEGMENTS } from 'constant/canvas';

// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getPolygonPoints } from 'utils/canvas/shapes/getPolygonPoints';
import { getRoundedPolygonPoints } from 'utils/canvas/shapes/getRoundedPolygonPoints';

export const getPolygonShapePoints = (bounds: TDraftRect, sides: number, cornerRadius: number): TPoint[] =>
  cornerRadius > 0
    ? getRoundedPolygonPoints({ ...bounds, cornerRadius, sides }, ROUNDED_POLYGON_CORNER_SEGMENTS)
    : getPolygonPoints(bounds, sides);
