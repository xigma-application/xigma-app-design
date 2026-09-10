// types
import { TGridReadingEntry, TGridShiftedPlacement } from './types';

// utils
import { toGridCell } from './toGridCell';

export const getShiftedGridCells = (
  existing: TGridReadingEntry[],
  insertIndex: number,
  draggedCount: number,
  columnCount: number,
): TGridShiftedPlacement[] => {
  const shifted: TGridShiftedPlacement[] = [];
  let free = insertIndex + draggedCount;

  existing.forEach((child) => {
    if (child.readingIndex >= insertIndex) {
      const nextIndex = Math.max(free, child.readingIndex);

      shifted.push({ cell: toGridCell(nextIndex, columnCount), id: child.id });
      free = nextIndex + 1;
    }
  });

  return shifted;
};
