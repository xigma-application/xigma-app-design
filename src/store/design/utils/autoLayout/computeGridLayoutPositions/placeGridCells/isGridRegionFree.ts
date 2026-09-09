// utils
import { gridCellKey } from './gridCellKey';

export const isGridRegionFree = (
  occupied: Set<string>,
  row: number,
  column: number,
  columnSpan: number,
  rowSpan: number,
  columns: number,
): boolean => {
  if (column + columnSpan > columns) {
    return false;
  }

  for (let currentRow = row; currentRow < row + rowSpan; currentRow += 1) {
    for (let currentColumn = column; currentColumn < column + columnSpan; currentColumn += 1) {
      if (occupied.has(gridCellKey(currentRow, currentColumn))) {
        return false;
      }
    }
  }

  return true;
};
