// types
import { StrokeSides } from 'types/design/enums';
import { TStrokeSidesChange, TStrokeSideSource } from './types';

// utils
import { getStrokeSideWidths } from './getStrokeSideWidths';

const CLEARED_SIDE_WIDTHS: TStrokeSidesChange = {
  strokeBottomWidth: undefined,
  strokeLeftWidth: undefined,
  strokeRightWidth: undefined,
  strokeTopWidth: undefined,
};

export const getStrokeSidesChange = (node: TStrokeSideSource, nextSides: StrokeSides): TStrokeSidesChange => {
  const widths = getStrokeSideWidths(node);
  const widest = Math.max(widths.bottom, widths.left, widths.right, widths.top);

  switch (nextSides) {
    case StrokeSides.all:
      return { ...CLEARED_SIDE_WIDTHS, strokeSides: StrokeSides.all, strokeWidth: widest };
    case StrokeSides.custom:
      return {
        strokeBottomWidth: widths.bottom,
        strokeLeftWidth: widths.left,
        strokeRightWidth: widths.right,
        strokeSides: StrokeSides.custom,
        strokeTopWidth: widths.top,
        strokeWidth: widest,
      };
    default:
      return { ...CLEARED_SIDE_WIDTHS, strokeSides: nextSides, strokeWidth: widths[nextSides] || widest };
  }
};
