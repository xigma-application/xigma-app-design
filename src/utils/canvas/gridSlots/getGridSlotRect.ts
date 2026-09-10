// types
import { TDraftRect } from 'types/canvas';
import { TFrameNode } from 'types/design/types';
import { TGridTrackLayout } from './getGridTrackLayout';

export const getGridSlotRect = (layout: TGridTrackLayout, frame: TFrameNode, column: number, row: number): TDraftRect => ({
  height: layout.rowSize,
  width: layout.columnSize,
  x: frame.x + layout.padding.paddingLeft + column * (layout.columnSize + layout.columnGap),
  y: frame.y + layout.padding.paddingTop + row * (layout.rowSize + layout.rowGap),
});
