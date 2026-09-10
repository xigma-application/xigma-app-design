// types
import { TDraftRect } from 'types/canvas';
import { TFrameNode } from 'types/design/types';
import { TGridTrackLayout } from './getGridTrackLayout';

// utils
import { getGridTrackOffset } from './getGridTrackOffset';

export const getGridSlotRect = (layout: TGridTrackLayout, frame: TFrameNode, column: number, row: number): TDraftRect => ({
  height: layout.rowSizes[row] ?? 0,
  width: layout.columnSizes[column] ?? 0,
  x: frame.x + layout.padding.paddingLeft + getGridTrackOffset(layout.columnSizes, layout.columnGap, column),
  y: frame.y + layout.padding.paddingTop + getGridTrackOffset(layout.rowSizes, layout.rowGap, row),
});
