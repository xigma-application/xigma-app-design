// types
import { TFrameNode } from 'types/design/types';
import { TGridDropCell } from './getGridDropCell';
import { TGridTrackLayout } from './getGridTrackLayout';
import { TPoint } from 'types/canvas';

// utils
import { getGridTrackOffset } from './getGridTrackOffset';

export type TGridTrackAffordancePillCenters = {
  column: TPoint;
  row: TPoint;
};

export const getGridTrackAffordancePillCenters = (
  frame: TFrameNode,
  layout: TGridTrackLayout,
  cell: TGridDropCell,
  offset: number,
): TGridTrackAffordancePillCenters => ({
  column: {
    x:
      frame.x +
      layout.padding.paddingLeft +
      getGridTrackOffset(layout.columnSizes, layout.columnGap, cell.column) +
      (layout.columnSizes[cell.column] ?? 0) / 2,
    y: frame.y - offset,
  },
  row: {
    x: frame.x - offset,
    y:
      frame.y +
      layout.padding.paddingTop +
      getGridTrackOffset(layout.rowSizes, layout.rowGap, cell.row) +
      (layout.rowSizes[cell.row] ?? 0) / 2,
  },
});
