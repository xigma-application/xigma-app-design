// types
import { TGridCellPlacement } from 'store/design/utils/autoLayout/computeGridLayoutPositions/types';
import { TGridMoveStep } from './getGridMoveStep';

// utils
import { isGridRegionFree } from 'store/design/utils/autoLayout/computeGridLayoutPositions/placeGridCells/isGridRegionFree';

export type TGridSlotMoveCandidate = {
  columnStart: number;
  id: string;
  rowStart: number;
};

export const getGridSlotMoveCandidate = (
  placement: TGridCellPlacement | undefined,
  step: TGridMoveStep,
  occupied: Set<string>,
  columnCount: number,
  rowCount: number,
): TGridSlotMoveCandidate | null => {
  if (placement) {
    const rowStart = step.axis === 'row' ? placement.rowStart + step.step : placement.rowStart;
    const columnStart = step.axis === 'column' ? placement.columnStart + step.step : placement.columnStart;
    const isInBounds = rowStart >= 0 && columnStart >= 0 && rowStart + placement.rowSpan <= rowCount;

    if (isInBounds && isGridRegionFree(occupied, rowStart, columnStart, placement.columnSpan, placement.rowSpan, columnCount)) {
      return { columnStart, id: placement.id, rowStart };
    }
  }

  return null;
};
