// store
import { AppDispatch } from 'store';

// types
import { TFrameNode, TSceneNode } from 'types/design/types';
import { TGridCellPlacement } from 'store/design/utils/autoLayout/computeGridLayoutPositions/types';
import { TSlotDelta } from './types';

// utils
import { applyGridDrop } from './applyGridDrop';
import { getGridPlacementsById } from './getGridPlacementsById';
import { gridCellKey } from 'store/design/utils/autoLayout/computeGridLayoutPositions/placeGridCells/gridCellKey';
import { occupyGridRegion } from 'store/design/utils/autoLayout/computeGridLayoutPositions/placeGridCells/occupyGridRegion';

type TShiftedCell = { column: number; placement: TGridCellPlacement; row: number };

const getOccupiedByOthers = (placements: Map<string, TGridCellPlacement>, orderedIds: string[]): Set<string> => {
  const occupied = new Set<string>();

  placements.forEach((placement, id) => {
    if (!orderedIds.includes(id)) {
      occupyGridRegion(occupied, placement.rowStart, placement.columnStart, placement.columnSpan, placement.rowSpan);
    }
  });

  return occupied;
};

const getShiftedCell = (placement: TGridCellPlacement, columnCount: number, slotDelta: TSlotDelta): TShiftedCell => ({
  column: Math.min(Math.max(placement.columnStart + slotDelta.x, 0), Math.max(columnCount - placement.columnSpan, 0)),
  placement,
  row: Math.max(placement.rowStart + slotDelta.y, 0),
});

const getShiftedCells = (
  placements: Map<string, TGridCellPlacement>,
  orderedIds: string[],
  columnCount: number,
  slotDelta: TSlotDelta,
): TShiftedCell[] =>
  orderedIds.flatMap((id) => {
    const placement = placements.get(id);

    return placement ? [getShiftedCell(placement, columnCount, slotDelta)] : [];
  });

const isCellRegionOccupied = (cell: TShiftedCell, occupied: Set<string>): boolean =>
  Array.from({ length: cell.placement.rowSpan * cell.placement.columnSpan }).some((_, offset) =>
    occupied.has(
      gridCellKey(cell.row + Math.floor(offset / cell.placement.columnSpan), cell.column + (offset % cell.placement.columnSpan)),
    ),
  );

const isShiftBlocked = (cells: TShiftedCell[], orderedIds: string[], occupied: Set<string>): boolean =>
  cells.length !== orderedIds.length || cells.some((cell) => isCellRegionOccupied(cell, occupied));

const isShiftUnchanged = (cells: TShiftedCell[]): boolean =>
  cells.every((cell) => cell.column === cell.placement.columnStart && cell.row === cell.placement.rowStart);

export const applyGridSlotDelta = (
  dispatch: AppDispatch,
  frame: TFrameNode,
  orderedIds: string[],
  slotDelta: TSlotDelta,
  nodesById: Record<string, TSceneNode>,
): void => {
  const { columnCount, placements } = getGridPlacementsById(frame, nodesById);
  const cells = getShiftedCells(placements, orderedIds, columnCount, slotDelta);

  if (
    frame.gridAutoPlacement === false &&
    !isShiftBlocked(cells, orderedIds, getOccupiedByOthers(placements, orderedIds)) &&
    !isShiftUnchanged(cells)
  ) {
    applyGridDrop(
      dispatch,
      frame.id,
      cells.map(({ column, row }) => ({ column, row })),
      orderedIds,
    );
  }
};
