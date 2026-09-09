// utils
import { gridCellKey } from './gridCellKey';

export const occupyGridRegion = (occupied: Set<string>, row: number, column: number, columnSpan: number, rowSpan: number): void => {
  for (let currentRow = row; currentRow < row + rowSpan; currentRow += 1) {
    for (let currentColumn = column; currentColumn < column + columnSpan; currentColumn += 1) {
      occupied.add(gridCellKey(currentRow, currentColumn));
    }
  }
};
