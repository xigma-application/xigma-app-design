// types
import { TGridGeometry, TSmartSelectionGap } from 'types/design/smartSelection/types';

// utils
import { getGridCellRect } from './getGridCellRect';

export const buildGridRowGaps = (
  geometry: TGridGeometry,
  values: number[],
  extent: { left: number; right: number },
): TSmartSelectionGap[] =>
  values.map((value, index) => {
    const before = getGridCellRect(geometry, index, 0);
    const after = getGridCellRect(geometry, index + 1, 0);
    const midY = (before.y + before.height + after.y) / 2;

    return {
      index,
      midpoint: { x: (extent.left + extent.right) / 2, y: midY },
      span: { x1: extent.left, x2: extent.right, y1: midY, y2: midY },
      value,
    };
  });
