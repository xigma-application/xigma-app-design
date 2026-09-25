// types
import { StrokeAlign } from 'types/design/enums';
import { TPoint } from 'types/canvas';

// utils
import { getOffsetPolygon } from './getOffsetPolygon';
import { getStrokeBandDistances } from './getStrokeBandDistances';

export const getAlignedStrokeBand = (points: TPoint[], isHole: boolean, align: StrokeAlign, strokeWidth: number): TPoint[][] => {
  const towardShape = isHole ? 1 : -1;
  const [awayDistance, towardDistance] = getStrokeBandDistances(align, strokeWidth);

  return [-towardShape * awayDistance, towardShape * towardDistance]
    .map((distance) => (distance === 0 ? points : getOffsetPolygon(points, distance)))
    .filter((edge): edge is TPoint[] => edge !== null);
};
