// types
import { TSmartSelectionGap } from 'types/design/smartSelection/types';

export type TGridRowGapHandleBounds = { end: number; midX: number; start: number };

const END_COLUMN_WIDTH_OVERLAP_RATIO = 0.2;

export const getGridRowGapHandleBounds = (
  gap: TSmartSelectionGap,
  firstColumnWidth: number,
  lastColumnWidth: number,
): TGridRowGapHandleBounds => {
  const start = gap.span.x1 + (1 - END_COLUMN_WIDTH_OVERLAP_RATIO) * firstColumnWidth;
  const end = gap.span.x2 - (1 - END_COLUMN_WIDTH_OVERLAP_RATIO) * lastColumnWidth;

  return { end, midX: (start + end) / 2, start };
};
