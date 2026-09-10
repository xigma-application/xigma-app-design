// types
import { TPoint } from 'types/canvas';
import { TGridTrackLayout } from './getGridTrackLayout';

// utils
import { getGridTrackIndexAt } from './getGridTrackIndexAt';

export type TGridDropCell = {
  column: number;
  row: number;
};

export const getGridDropCell = (layout: TGridTrackLayout, framePoint: TPoint): TGridDropCell => {
  if (layout.columnSizes.length === 0 || layout.rowSizes.length === 0) {
    return { column: 0, row: 0 };
  }

  return {
    column: getGridTrackIndexAt(layout.columnSizes, layout.columnGap, framePoint.x - layout.padding.paddingLeft, false),
    row: getGridTrackIndexAt(layout.rowSizes, layout.rowGap, framePoint.y - layout.padding.paddingTop, true),
  };
};
