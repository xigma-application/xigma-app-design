// types
import { TGridCellPlacement } from '../types';

// utils
import { isGridRegionFree } from './isGridRegionFree';

export type TGridCursor = {
  column: number;
  row: number;
};

const takeGridPlacement = (id: string, columns: number, columnSpan: number, rowSpan: number, cursor: TGridCursor): TGridCellPlacement => {
  const placement = { columnSpan, columnStart: cursor.column, id, rowSpan, rowStart: cursor.row };

  cursor.column += columnSpan;

  if (cursor.column >= columns) {
    cursor.column = 0;
    cursor.row += 1;
  }

  return placement;
};

export const getAutoFlowGridPlacement = (
  id: string,
  columns: number,
  columnSpan: number,
  rowSpan: number,
  cursor: TGridCursor,
  occupied: Set<string>,
): TGridCellPlacement => {
  while (!isGridRegionFree(occupied, cursor.row, cursor.column, columnSpan, rowSpan, columns)) {
    cursor.column += 1;

    if (cursor.column + columnSpan > columns) {
      cursor.column = 0;
      cursor.row += 1;
    }
  }

  return takeGridPlacement(id, columns, columnSpan, rowSpan, cursor);
};
