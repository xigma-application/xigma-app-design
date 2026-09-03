// types
import { TGridGeometry, TSmartSelectionNode } from 'types/design/smartSelection/types';

const firstRealCell = (cells: (TSmartSelectionNode | null)[]): TSmartSelectionNode =>
  cells.find((cell): cell is TSmartSelectionNode => cell !== null)!;

export const getGridGeometry = (cells: (TSmartSelectionNode | null)[][]): TGridGeometry => {
  const columnCount = cells[0].length;
  const rowAnchors = cells.map((row) => firstRealCell(row));
  const columnAnchors = Array.from({ length: columnCount }, (_, columnIndex) => firstRealCell(cells.map((row) => row[columnIndex])));

  return {
    columnWidth: columnAnchors.map((cell) => cell.bounds.width),
    columnX: columnAnchors.map((cell) => cell.bounds.x),
    rowHeight: rowAnchors.map((cell) => cell.bounds.height),
    rowY: rowAnchors.map((cell) => cell.bounds.y),
  };
};
