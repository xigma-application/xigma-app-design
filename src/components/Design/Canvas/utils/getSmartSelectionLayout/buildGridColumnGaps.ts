// types
import { TSmartSelectionGap, TSmartSelectionNode } from 'types/design/smartSelection/types';

export const buildGridColumnGaps = (
  firstRow: TSmartSelectionNode[],
  values: number[],
  extent: { bottom: number; top: number },
): TSmartSelectionGap[] =>
  values.map((value, index) => {
    const before = firstRow[index].bounds;
    const after = firstRow[index + 1].bounds;
    const midX = (before.x + before.width + after.x) / 2;

    return {
      index,
      midpoint: { x: midX, y: (extent.top + extent.bottom) / 2 },
      span: { x1: midX, x2: midX, y1: extent.top, y2: extent.bottom },
      value,
    };
  });
