// types
import { TGridGeometry, TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { getGridCellRect } from './getGridCellRect';

const isWithinTolerance = (a: number, b: number, toleranceWorldUnits: number): boolean => Math.abs(a - b) <= toleranceWorldUnits;

export const isGridAligned = (cells: (TSmartSelectionNode | null)[][], geometry: TGridGeometry, toleranceWorldUnits: number): boolean =>
  cells.every((row, rowIndex) =>
    row.every((cell, columnIndex) => {
      if (cell === null) {
        return true;
      }

      const expected = getGridCellRect(geometry, rowIndex, columnIndex);

      return (
        isWithinTolerance(cell.bounds.x, expected.x, toleranceWorldUnits) &&
        isWithinTolerance(cell.bounds.y, expected.y, toleranceWorldUnits) &&
        isWithinTolerance(cell.bounds.width, expected.width, toleranceWorldUnits) &&
        isWithinTolerance(cell.bounds.height, expected.height, toleranceWorldUnits)
      );
    }),
  );
