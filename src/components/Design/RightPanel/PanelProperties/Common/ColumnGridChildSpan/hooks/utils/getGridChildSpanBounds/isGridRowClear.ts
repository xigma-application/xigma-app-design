// utils
import { gridCellKey } from 'store/design/utils/autoLayout/computeGridLayoutPositions/placeGridCells/gridCellKey';

export const isGridRowClear = (occupied: Set<string>, row: number, columnStart: number, columnSpan: number): boolean => {
  for (let column = columnStart; column < columnStart + columnSpan; column += 1) {
    if (occupied.has(gridCellKey(row, column))) {
      return false;
    }
  }

  return true;
};
