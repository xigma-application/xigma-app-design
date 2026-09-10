// types
import { TGridCellPlacement } from 'store/design/utils/autoLayout/computeGridLayoutPositions/types';

// utils
import { occupyGridRegion } from 'store/design/utils/autoLayout/computeGridLayoutPositions/placeGridCells/occupyGridRegion';

export const getGridOccupancyExcludingNode = (placements: TGridCellPlacement[], nodeId: string): Set<string> => {
  const occupied = new Set<string>();

  placements
    .filter((placement) => placement.id !== nodeId)
    .forEach((placement) => occupyGridRegion(occupied, placement.rowStart, placement.columnStart, placement.columnSpan, placement.rowSpan));

  return occupied;
};
