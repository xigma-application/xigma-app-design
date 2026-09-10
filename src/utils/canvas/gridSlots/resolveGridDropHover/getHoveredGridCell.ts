// types
import { TGridDropCell } from '../getGridDropCell';
import { TGridTrackLayout } from '../getGridTrackLayout';
import { TPoint } from 'types/canvas';

// utils
import { getGridTrackIndexAt } from '../getGridTrackIndexAt';

export const getHoveredGridCell = (framePoint: TPoint, layout: TGridTrackLayout): TGridDropCell => ({
  column: getGridTrackIndexAt(layout.columnSizes, layout.columnGap, framePoint.x - layout.padding.paddingLeft, false),
  row: getGridTrackIndexAt(layout.rowSizes, layout.rowGap, framePoint.y - layout.padding.paddingTop, true),
});
