// types
import { TFrameNode, TSceneNode } from 'types/design/types';
import { TGridDropHover } from './types';
import { TGridTrackLayout } from '../getGridTrackLayout';
import { TPoint } from 'types/canvas';

// utils
import { getGridDropPlacements } from './getGridDropPlacements';
import { getGridOccupancyIndex } from './getGridOccupancyIndex';
import { getHoveredGridCell } from './getHoveredGridCell';
import { gridCellKey } from 'store/design/utils/autoLayout/computeGridLayoutPositions/placeGridCells/gridCellKey';
import { resolveOccupiedCellHover } from './resolveOccupiedCellHover';

export const resolveGridDropHover = (
  frame: TFrameNode,
  nodesById: Record<string, TSceneNode>,
  movedNodeIds: string[],
  framePoint: TPoint,
  layout: TGridTrackLayout,
): TGridDropHover => {
  const count = Math.max(movedNodeIds.length, 1);
  const columnStride = layout.columnSize + layout.columnGap;
  const rowStride = layout.rowSize + layout.rowGap;
  const context = { count, frame, movedNodeIds, nodesById };

  if (columnStride > 0 && rowStride > 0) {
    const cell = getHoveredGridCell(framePoint, layout, columnStride, rowStride);
    const occupancy = getGridOccupancyIndex(context, layout.columnCount);

    if (occupancy.occupied.has(gridCellKey(cell.row, cell.column))) {
      return resolveOccupiedCellHover(context, layout, framePoint, cell, columnStride, occupancy);
    }

    return { cells: getGridDropPlacements(frame, nodesById, movedNodeIds, cell, count) };
  }

  return { cells: getGridDropPlacements(frame, nodesById, movedNodeIds, { column: 0, row: 0 }, count) };
};
