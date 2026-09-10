// types
import { TFrameNode, TSceneNode } from 'types/design/types';
import { TGridCellPlacement } from 'store/design/utils/autoLayout/computeGridLayoutPositions/types';
import { TGridDropCell } from '../getGridDropCell';

// utils
import { getGridPlacementInputs } from 'store/design/utils/autoLayout/getGridPlacementInputs';
import { isGridRegionFree } from 'store/design/utils/autoLayout/computeGridLayoutPositions/placeGridCells/isGridRegionFree';
import { occupyGridRegion } from 'store/design/utils/autoLayout/computeGridLayoutPositions/placeGridCells/occupyGridRegion';
import { placeGridCells } from 'store/design/utils/autoLayout/computeGridLayoutPositions/placeGridCells/placeGridCells';

type TGridChildSpan = {
  columnSpan: number;
  rowSpan: number;
};

const getSpanById = (movedIds: string[], nodesById: Record<string, TSceneNode>, columnCount: number): Map<string, TGridChildSpan> =>
  new Map(
    getGridPlacementInputs(movedIds, nodesById).map((input) => [
      input.id,
      {
        columnSpan: Math.min(Math.max(Math.round(input.gridColumnSpan ?? 1), 1), columnCount),
        rowSpan: Math.max(Math.round(input.gridRowSpan ?? 1), 1),
      },
    ]),
  );

const occupyExistingPlacements = (occupied: Set<string>, placements: TGridCellPlacement[]): void => {
  placements.forEach((placement) => {
    occupyGridRegion(occupied, placement.rowStart, placement.columnStart, placement.columnSpan, placement.rowSpan);
  });
};

export const getGridDropPlacements = (
  frame: TFrameNode,
  nodesById: Record<string, TSceneNode>,
  movedIds: string[],
  startCell: TGridDropCell,
  count: number,
): TGridDropCell[] => {
  const columnCount = Math.max(Math.round(frame.gridColumnCount ?? 1), 1);
  const spanById = getSpanById(movedIds, nodesById, columnCount);
  const inputs = getGridPlacementInputs(frame.childIds, nodesById, new Set(movedIds));
  const placements = placeGridCells(inputs, columnCount, frame.gridAutoPlacement ?? true);
  const occupied = new Set<string>();
  const cells: TGridDropCell[] = [];
  let cellIndex = startCell.row * columnCount + Math.min(Math.max(startCell.column, 0), columnCount - 1);

  occupyExistingPlacements(occupied, placements);

  while (cells.length < Math.max(count, 1)) {
    const column = cellIndex % columnCount;
    const row = Math.floor(cellIndex / columnCount);
    const { columnSpan, rowSpan } = spanById.get(movedIds[cells.length] ?? '') ?? { columnSpan: 1, rowSpan: 1 };

    if (isGridRegionFree(occupied, row, column, columnSpan, rowSpan, columnCount)) {
      cells.push({ column, row });
      occupyGridRegion(occupied, row, column, columnSpan, rowSpan);
    }

    cellIndex += 1;
  }

  return cells;
};
