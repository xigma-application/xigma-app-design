// types
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getGridPlacementInputs } from './getGridPlacementInputs';
import { placeGridCells } from './computeGridLayoutPositions/placeGridCells/placeGridCells';

export const getDerivedGridRowCount = (frame: TFrameNode, nodesById: Record<string, TSceneNode>): number => {
  const columnCount = Math.max(Math.round(frame.gridColumnCount ?? 1), 1);
  const inputs = getGridPlacementInputs(frame.childIds, nodesById);
  const placements = placeGridCells(inputs, columnCount, frame.gridAutoPlacement ?? true);

  return placements.reduce((max, placement) => Math.max(max, placement.rowStart + placement.rowSpan), 1);
};
