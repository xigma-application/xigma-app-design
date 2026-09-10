// types
import { TFrameNode, TSceneNode } from 'types/design/types';
import { TGridDropCell } from './getGridDropCell';

// utils
import { getGridPlacementInputs } from 'store/design/utils/autoLayout/getGridPlacementInputs';
import { isGridRegionFree } from 'store/design/utils/autoLayout/computeGridLayoutPositions/placeGridCells/isGridRegionFree';
import { occupyGridRegion } from 'store/design/utils/autoLayout/computeGridLayoutPositions/placeGridCells/occupyGridRegion';
import { placeGridCells } from 'store/design/utils/autoLayout/computeGridLayoutPositions/placeGridCells/placeGridCells';

export const getGridDropPlacements = (
  frame: TFrameNode,
  nodesById: Record<string, TSceneNode>,
  movedIds: string[],
  startCell: TGridDropCell,
  count: number,
): TGridDropCell[] => {
  const columnCount = Math.max(Math.round(frame.gridColumnCount ?? 1), 1);
  const inputs = getGridPlacementInputs(frame.childIds, nodesById, new Set(movedIds));
  const placements = placeGridCells(inputs, columnCount, frame.gridAutoPlacement ?? true);
  const occupied = new Set<string>();

  placements.forEach((placement) => {
    occupyGridRegion(occupied, placement.rowStart, placement.columnStart, placement.columnSpan, placement.rowSpan);
  });

  const cells: TGridDropCell[] = [];
  let cellIndex = startCell.row * columnCount + Math.min(Math.max(startCell.column, 0), columnCount - 1);

  while (cells.length < Math.max(count, 1)) {
    const column = cellIndex % columnCount;
    const row = Math.floor(cellIndex / columnCount);

    if (isGridRegionFree(occupied, row, column, 1, 1, columnCount)) {
      cells.push({ column, row });
      occupyGridRegion(occupied, row, column, 1, 1);
    }

    cellIndex += 1;
  }

  return cells;
};
