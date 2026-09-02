// types
import { TSmartSelectionGap, TSmartSelectionNode } from 'types/design/smartSelection/types';

export const buildGridRowGaps = (
  firstColumn: TSmartSelectionNode[],
  values: number[],
  extent: { left: number; right: number },
): TSmartSelectionGap[] =>
  values.map((value, index) => {
    const before = firstColumn[index].bounds;
    const after = firstColumn[index + 1].bounds;
    const midY = (before.y + before.height + after.y) / 2;

    return {
      index,
      midpoint: { x: (extent.left + extent.right) / 2, y: midY },
      span: { x1: extent.left, x2: extent.right, y1: midY, y2: midY },
      value,
    };
  });
