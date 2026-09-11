// types
import { TGridCellPosition } from 'types/design/canvas/types';
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';

export const getGridSectionCells = (axis: TGridTrackAxis, selectedIndices: number[], crossAxisCount: number): TGridCellPosition[] => {
  const cells: TGridCellPosition[] = [];

  selectedIndices.forEach((index) => {
    for (let cross = 0; cross < crossAxisCount; cross += 1) {
      cells.push(axis === 'column' ? { column: index, row: cross } : { column: cross, row: index });
    }
  });

  return cells;
};
