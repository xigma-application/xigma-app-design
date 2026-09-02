// types
import { TSmartSelectionNode } from 'types/design/smartSelection/types';

const isWithinTolerance = (a: number, b: number, toleranceWorldUnits: number): boolean => Math.abs(a - b) <= toleranceWorldUnits;

export const isGridAligned = (cells: TSmartSelectionNode[][], toleranceWorldUnits: number): boolean => {
  const columnCount = cells[0].length;

  for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
    const first = cells[0][columnIndex].bounds;

    for (let rowIndex = 1; rowIndex < cells.length; rowIndex += 1) {
      const bounds = cells[rowIndex][columnIndex].bounds;

      if (
        !isWithinTolerance(bounds.x, first.x, toleranceWorldUnits) ||
        !isWithinTolerance(bounds.width, first.width, toleranceWorldUnits)
      ) {
        return false;
      }
    }
  }

  for (let rowIndex = 0; rowIndex < cells.length; rowIndex += 1) {
    const first = cells[rowIndex][0].bounds;

    for (let columnIndex = 1; columnIndex < columnCount; columnIndex += 1) {
      const bounds = cells[rowIndex][columnIndex].bounds;

      if (
        !isWithinTolerance(bounds.y, first.y, toleranceWorldUnits) ||
        !isWithinTolerance(bounds.height, first.height, toleranceWorldUnits)
      ) {
        return false;
      }
    }
  }

  return true;
};
