// types
import { StrokeAlign } from 'types/design/enums';
import { TPoint } from 'types/canvas';

// utils
import { getOffsetPolygon } from './getOffsetPolygon';

export const getAlignedStrokeMidline = (loop: TPoint[], halfWidth: number, align: StrokeAlign, isHole: boolean): TPoint[] => {
  const towardShape = isHole ? 1 : -1;

  switch (align) {
    case StrokeAlign.inside:
      return getOffsetPolygon(loop, towardShape * halfWidth) ?? loop;
    case StrokeAlign.outside:
      return getOffsetPolygon(loop, -towardShape * halfWidth) ?? loop;
    default:
      return loop;
  }
};
