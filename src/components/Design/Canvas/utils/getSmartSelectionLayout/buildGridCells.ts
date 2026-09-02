// types
import { TSmartSelectionNode } from 'types/design/smartSelection/types';

export const buildGridCells = (
  nodes: TSmartSelectionNode[],
  rows: TSmartSelectionNode[][],
  columns: TSmartSelectionNode[][],
): TSmartSelectionNode[][] | null => {
  if (rows.length >= 2 && columns.length >= 2 && rows.length * columns.length === nodes.length) {
    const columnIndexById = new Map<string, number>();
    const rowIndexById = new Map<string, number>();
    const cells: (TSmartSelectionNode | undefined)[][] = rows.map(() => new Array(columns.length).fill(undefined));

    rows.forEach((row, rowIndex) => row.forEach((node) => rowIndexById.set(node.id, rowIndex)));
    columns.forEach((column, columnIndex) => column.forEach((node) => columnIndexById.set(node.id, columnIndex)));

    for (const node of nodes) {
      const rowIndex = rowIndexById.get(node.id);
      const columnIndex = columnIndexById.get(node.id);

      if (rowIndex === undefined || columnIndex === undefined || cells[rowIndex][columnIndex]) {
        return null;
      }

      cells[rowIndex][columnIndex] = node;
    }

    return cells as TSmartSelectionNode[][];
  }

  return null;
};
