// types
import { TGridCellPlacement } from 'store/design/utils/autoLayout/computeGridLayoutPositions/types';
import { TGridDropContext, TGridOccupancyIndex } from './types';

// utils
import { getGridPlacementInputs } from 'store/design/utils/autoLayout/getGridPlacementInputs';
import { gridCellKey } from 'store/design/utils/autoLayout/computeGridLayoutPositions/placeGridCells/gridCellKey';
import { occupyGridRegion } from 'store/design/utils/autoLayout/computeGridLayoutPositions/placeGridCells/occupyGridRegion';
import { placeGridCells } from 'store/design/utils/autoLayout/computeGridLayoutPositions/placeGridCells/placeGridCells';

const markPlacementOwner = (cellOwner: Map<string, TGridCellPlacement>, placement: TGridCellPlacement): void => {
  for (let ownedRow = placement.rowStart; ownedRow < placement.rowStart + placement.rowSpan; ownedRow += 1) {
    for (let ownedColumn = placement.columnStart; ownedColumn < placement.columnStart + placement.columnSpan; ownedColumn += 1) {
      cellOwner.set(gridCellKey(ownedRow, ownedColumn), placement);
    }
  }
};

export const getGridOccupancyIndex = (context: TGridDropContext, columnCount: number): TGridOccupancyIndex => {
  const occupied = new Set<string>();
  const cellOwner = new Map<string, TGridCellPlacement>();
  const inputs = getGridPlacementInputs(context.frame.childIds, context.nodesById, new Set(context.movedNodeIds));

  placeGridCells(inputs, columnCount, context.frame.gridAutoPlacement ?? true).forEach((placement) => {
    occupyGridRegion(occupied, placement.rowStart, placement.columnStart, placement.columnSpan, placement.rowSpan);
    markPlacementOwner(cellOwner, placement);
  });

  return { cellOwner, occupied };
};
