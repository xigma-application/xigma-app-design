// others
import { INDICATOR_THICKNESS_PX } from 'store/design/utils/autoLayout/constants';

// types
import { TDraftRect } from 'types/canvas';
import { TFrameNode } from 'types/design/types';
import { TGridTrackLayout } from './getGridTrackLayout';

// utils
import { getGridSlotRect } from './getGridSlotRect';

export const getGridInsertIndicatorRect = (
  layout: TGridTrackLayout,
  frame: TFrameNode,
  indicator: { column: number; row: number; side: 'left' | 'right' },
): TDraftRect => {
  const slot = getGridSlotRect(layout, frame, indicator.column, indicator.row);
  const half = INDICATOR_THICKNESS_PX / 2;
  const contentLeft = frame.x + layout.padding.paddingLeft;
  const contentRight = frame.x + frame.width - layout.padding.paddingRight;
  const rawX = indicator.side === 'left' ? slot.x - layout.columnGap / 2 - half : slot.x + slot.width + layout.columnGap / 2 - half;

  return {
    height: slot.height,
    width: INDICATOR_THICKNESS_PX,
    x: Math.min(Math.max(rawX, contentLeft - half), contentRight - half),
    y: slot.y,
  };
};
