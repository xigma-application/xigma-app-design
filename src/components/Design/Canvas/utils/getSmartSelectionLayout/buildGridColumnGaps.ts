// types
import { TGridGeometry, TSmartSelectionGap } from 'types/design/smartSelection/types';

// utils
import { getGridCellRect } from './getGridCellRect';

export const buildGridColumnGaps = (
  geometry: TGridGeometry,
  values: number[],
  extent: { bottom: number; top: number },
): TSmartSelectionGap[] =>
  values.flatMap((value, index) =>
    geometry.rowY.map((_, rowIndex) => {
      const before = getGridCellRect(geometry, rowIndex, index);
      const after = getGridCellRect(geometry, rowIndex, index + 1);
      const midX = (before.x + before.width + after.x) / 2;

      return {
        index,
        midpoint: { x: midX, y: before.y + before.height / 2 },
        span: { x1: midX, x2: midX, y1: extent.top, y2: extent.bottom },
        value,
      };
    }),
  );
