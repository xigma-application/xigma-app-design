// types
import { StrokeAlign } from 'types/design/enums';
import { TPoint } from 'types/canvas';

// utils
import { getOffsetLoops } from './offsetLoops/getOffsetLoops';
import { getStrokeBandDistances } from './getStrokeBandDistances';

export const getAlignedStrokeBand = (points: TPoint[], isHole: boolean, align: StrokeAlign, strokeWidth: number): TPoint[][] => {
  const towardShape = isHole ? 1 : -1;
  const [awayDistance, towardDistance] = getStrokeBandDistances(align, strokeWidth);

  return [-towardShape * awayDistance, towardShape * towardDistance].flatMap((distance) =>
    distance === 0 ? [points] : getOffsetLoops(points, distance),
  );
};
