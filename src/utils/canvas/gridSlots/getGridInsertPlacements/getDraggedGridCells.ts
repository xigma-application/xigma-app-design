// types
import { TGridDropCell } from '../getGridDropCell';

// utils
import { toGridCell } from './toGridCell';

export const getDraggedGridCells = (insertIndex: number, draggedCount: number, columnCount: number): TGridDropCell[] => {
  const dragged: TGridDropCell[] = [];

  for (let offset = 0; offset < draggedCount; offset += 1) {
    dragged.push(toGridCell(insertIndex + offset, columnCount));
  }

  return dragged;
};
