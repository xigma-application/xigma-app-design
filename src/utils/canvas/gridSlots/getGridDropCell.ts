// types
import { TPoint } from 'types/canvas';
import { TGridTrackLayout } from './getGridTrackLayout';

export type TGridDropCell = {
  column: number;
  row: number;
};

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

export const getGridDropCell = (layout: TGridTrackLayout, framePoint: TPoint): TGridDropCell => {
  const columnStride = layout.columnSize + layout.columnGap;
  const rowStride = layout.rowSize + layout.rowGap;

  if (columnStride > 0 && rowStride > 0) {
    return {
      column: clamp(Math.floor((framePoint.x - layout.padding.paddingLeft) / columnStride), 0, layout.columnCount - 1),
      row: Math.max(Math.floor((framePoint.y - layout.padding.paddingTop) / rowStride), 0),
    };
  }

  return { column: 0, row: 0 };
};
