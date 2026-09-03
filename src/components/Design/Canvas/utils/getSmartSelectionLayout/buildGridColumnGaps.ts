// types
import { TSmartSelectionGap, TSmartSelectionNode } from 'types/design/smartSelection/types';

export const buildGridColumnGaps = (
  cells: TSmartSelectionNode[][],
  values: number[],
  extent: { bottom: number; top: number },
): TSmartSelectionGap[] =>
  values.flatMap((value, index) =>
    cells.map((row) => {
      const before = row[index].bounds;
      const after = row[index + 1].bounds;
      const midX = (before.x + before.width + after.x) / 2;

      return {
        index,
        midpoint: { x: midX, y: before.y + before.height / 2 },
        span: { x1: midX, x2: midX, y1: extent.top, y2: extent.bottom },
        value,
      };
    }),
  );
