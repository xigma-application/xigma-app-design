// types
import { TGridDropCell } from '../getGridDropCell';
import { TGridTrackLayout } from '../getGridTrackLayout';
import { TPoint } from 'types/canvas';

// utils
import { clamp } from 'utils/math/clamp';

export const getHoveredGridCell = (
  framePoint: TPoint,
  layout: TGridTrackLayout,
  columnStride: number,
  rowStride: number,
): TGridDropCell => ({
  column: clamp(Math.floor((framePoint.x - layout.padding.paddingLeft) / columnStride), 0, layout.columnCount - 1),
  row: Math.max(Math.floor((framePoint.y - layout.padding.paddingTop) / rowStride), 0),
});
