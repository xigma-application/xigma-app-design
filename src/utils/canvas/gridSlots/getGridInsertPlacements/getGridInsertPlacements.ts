// types
import { TFrameNode, TSceneNode } from 'types/design/types';
import { TGridInsertPlacements } from './types';

// utils
import { getDraggedGridCells } from './getDraggedGridCells';
import { getExistingReadingOrder } from './getExistingReadingOrder';
import { getGridPlacementInputs } from 'store/design/utils/autoLayout/getGridPlacementInputs';
import { getShiftedGridCells } from './getShiftedGridCells';
import { placeGridCells } from 'store/design/utils/autoLayout/computeGridLayoutPositions/placeGridCells/placeGridCells';

export const getGridInsertPlacements = (
  frame: TFrameNode,
  nodesById: Record<string, TSceneNode>,
  draggedIds: string[],
  insertIndex: number,
): TGridInsertPlacements => {
  const columnCount = Math.max(Math.round(frame.gridColumnCount ?? 1), 1);
  const draggedCount = Math.max(draggedIds.length, 1);
  const inputs = getGridPlacementInputs(frame.childIds, nodesById, new Set(draggedIds));
  const placements = placeGridCells(inputs, columnCount, frame.gridAutoPlacement ?? true);
  const existing = getExistingReadingOrder(placements, columnCount);

  return {
    dragged: getDraggedGridCells(insertIndex, draggedCount, columnCount),
    shifted: getShiftedGridCells(existing, insertIndex, draggedCount, columnCount),
  };
};
