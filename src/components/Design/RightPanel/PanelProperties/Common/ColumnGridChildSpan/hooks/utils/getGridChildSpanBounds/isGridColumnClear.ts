// utils
import { gridCellKey } from 'store/design/utils/autoLayout/computeGridLayoutPositions/placeGridCells/gridCellKey';

export const isGridColumnClear = (occupied: Set<string>, column: number, rowStart: number, rowSpan: number): boolean => {
  for (let row = rowStart; row < rowStart + rowSpan; row += 1) {
    if (occupied.has(gridCellKey(row, column))) {
      return false;
    }
  }

  return true;
};
