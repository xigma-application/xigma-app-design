// types
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getGridPlacementInputs } from '../getGridPlacementInputs';
import { placeGridCells } from '../computeGridLayoutPositions/placeGridCells/placeGridCells';

export type TGridAutoPlacementFreezeAnchor = { gridColumnAnchorIndex: number; gridRowAnchorIndex: number; id: string };

export const getGridAutoPlacementFreezeAnchors = (
  frame: TFrameNode,
  nodesById: Record<string, TSceneNode>,
): TGridAutoPlacementFreezeAnchor[] => {
  const columnCount = Math.max(Math.round(frame.gridColumnCount ?? 1), 1);
  const inputs = getGridPlacementInputs(frame.childIds, nodesById);
  const placements = placeGridCells(inputs, columnCount, true);

  return placements.map((placement) => ({
    gridColumnAnchorIndex: placement.columnStart,
    gridRowAnchorIndex: placement.rowStart,
    id: placement.id,
  }));
};
