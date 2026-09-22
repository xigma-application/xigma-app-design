// others
import { ROUNDED_STAR_CORNER_SEGMENTS } from 'constant/canvas';

// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getRoundedStarPoints } from 'utils/canvas/shapes/getRoundedStarPoints';
import { getStarPoints } from 'utils/canvas/shapes/getStarPoints';

export const getStarShapePoints = (bounds: TDraftRect, points: number, ratio: number, cornerRadius: number): TPoint[] =>
  cornerRadius > 0
    ? getRoundedStarPoints({ ...bounds, cornerRadius, points, ratio }, ROUNDED_STAR_CORNER_SEGMENTS)
    : getStarPoints(bounds, points, ratio);
