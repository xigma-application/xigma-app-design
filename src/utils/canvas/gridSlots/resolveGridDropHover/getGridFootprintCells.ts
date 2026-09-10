// types
import { TGridDropCell } from '../getGridDropCell';

export const getGridFootprintCells = (anchor: TGridDropCell, columnSpan: number, rowSpan: number, columnCount: number): TGridDropCell[] => {
  const startColumn = Math.min(anchor.column, Math.max(columnCount - columnSpan, 0));
  const cells: TGridDropCell[] = [];

  for (let row = anchor.row; row < anchor.row + rowSpan; row += 1) {
    for (let column = startColumn; column < startColumn + columnSpan; column += 1) {
      cells.push({ column, row });
    }
  }

  return cells;
};
