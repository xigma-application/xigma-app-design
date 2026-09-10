// types
import { TGridDropCell } from '../getGridDropCell';
import { TGridDropContext, TGridDropHover, TGridOccupancyIndex } from './types';
import { TGridTrackLayout } from '../getGridTrackLayout';
import { TPoint } from 'types/canvas';

// utils
import { getGridDropPlacements } from './getGridDropPlacements';
import { gridCellKey } from 'store/design/utils/autoLayout/computeGridLayoutPositions/placeGridCells/gridCellKey';

export const resolveOccupiedCellHover = (
  context: TGridDropContext,
  layout: TGridTrackLayout,
  framePoint: TPoint,
  cell: TGridDropCell,
  columnStride: number,
  occupancy: TGridOccupancyIndex,
): TGridDropHover => {
  const { column, row } = cell;
  const owner = occupancy.cellOwner.get(gridCellKey(row, column));

  if (!owner || owner.columnSpan * owner.rowSpan <= 1) {
    const cellLeft = layout.padding.paddingLeft + column * columnStride;
    const isLeftHalf = framePoint.x - cellLeft < layout.columnSize / 2;
    const neighborColumn = isLeftHalf ? column - 1 : column + 1;
    const neighborInRange = neighborColumn >= 0 && neighborColumn < layout.columnCount;

    if (neighborInRange && !occupancy.occupied.has(gridCellKey(row, neighborColumn))) {
      return {
        cells: getGridDropPlacements(
          context.frame,
          context.nodesById,
          context.movedNodeIds,
          { column: neighborColumn, row },
          context.count,
        ),
      };
    }

    return {
      cells: [],
      indicator: { column, row, side: isLeftHalf ? 'left' : 'right' },
      insertIndex: row * layout.columnCount + column + (isLeftHalf ? 0 : 1),
    };
  }

  return { cells: getGridDropPlacements(context.frame, context.nodesById, context.movedNodeIds, cell, context.count) };
};
