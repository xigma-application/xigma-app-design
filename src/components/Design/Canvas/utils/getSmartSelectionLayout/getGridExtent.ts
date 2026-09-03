// types
import { TSmartSelectionNode } from 'types/design/smartSelection/types';

export const getGridExtent = (cells: (TSmartSelectionNode | null)[][]): { bottom: number; left: number; right: number; top: number } => {
  const allBounds = cells
    .flat()
    .filter((cell): cell is TSmartSelectionNode => cell !== null)
    .map((cell) => cell.bounds);

  return {
    bottom: Math.max(...allBounds.map((bounds) => bounds.y + bounds.height)),
    left: Math.min(...allBounds.map((bounds) => bounds.x)),
    right: Math.max(...allBounds.map((bounds) => bounds.x + bounds.width)),
    top: Math.min(...allBounds.map((bounds) => bounds.y)),
  };
};
