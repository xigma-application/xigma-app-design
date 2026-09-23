// types
import { TGridCellPlacement } from 'store/design/utils/autoLayout/computeGridLayoutPositions/types';
import { TGridMoveStep } from './getGridMoveStep';
import { TSceneNode } from 'types/design/types';

// utils
import { getGridSlotMoveCandidate, TGridSlotMoveCandidate } from './getGridSlotMoveCandidate';
import { occupyGridRegion } from 'store/design/utils/autoLayout/computeGridLayoutPositions/placeGridCells/occupyGridRegion';

export const getGridSlotMoveCandidates = (
  placements: TGridCellPlacement[],
  selectedNodes: TSceneNode[],
  step: TGridMoveStep,
  columnCount: number,
  rowCount: number,
): (TGridSlotMoveCandidate | null)[] => {
  const placementsById = new Map(placements.map((placement) => [placement.id, placement]));
  const selectedIds = new Set(selectedNodes.map((node) => node.id));
  const occupied = new Set<string>();

  placements.forEach((placement) => {
    if (!selectedIds.has(placement.id)) {
      occupyGridRegion(occupied, placement.rowStart, placement.columnStart, placement.columnSpan, placement.rowSpan);
    }
  });

  return selectedNodes.map((node) => getGridSlotMoveCandidate(placementsById.get(node.id), step, occupied, columnCount, rowCount));
};
