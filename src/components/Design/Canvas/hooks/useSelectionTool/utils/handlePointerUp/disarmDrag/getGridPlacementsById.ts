// store
import { getGridPlacementInputs } from 'store/design/utils/autoLayout/getGridPlacementInputs';
import { placeGridCells } from 'store/design/utils/autoLayout/computeGridLayoutPositions/placeGridCells/placeGridCells';

// types
import { TFrameNode, TSceneNode } from 'types/design/types';
import { TGridCellPlacement } from 'store/design/utils/autoLayout/computeGridLayoutPositions/types';

// utils
import { getGridTrackLayout } from 'utils/canvas/gridSlots/getGridTrackLayout';

export type TGridPlacementsById = { columnCount: number; placements: Map<string, TGridCellPlacement> };

export const getGridPlacementsById = (frame: TFrameNode, nodesById: Record<string, TSceneNode>): TGridPlacementsById => {
  const { columnCount } = getGridTrackLayout(frame, nodesById);
  const placements = placeGridCells(getGridPlacementInputs(frame.childIds, nodesById), columnCount, frame.gridAutoPlacement ?? true);

  return { columnCount, placements: new Map(placements.map((placement) => [placement.id, placement])) };
};
