// others
import { MIRRORED_HORIZONTAL_ALIGN, MIRRORED_VERTICAL_ALIGN } from './constants';

// types
import { AlignmentHorizontal, AlignmentVertical } from 'types/design/enums';
import { TFlipAxis } from './types';
import { TFrameNode, TSceneNode, TSceneNodeChanges } from 'types/design/types';

// utils
import { getGridPlacementInputs } from 'store/design/utils/autoLayout/getGridPlacementInputs';
import { placeGridCells } from 'store/design/utils/autoLayout/computeGridLayoutPositions/placeGridCells/placeGridCells';

export const getFlippedGridChildChanges = (
  frame: TFrameNode,
  nodesById: Record<string, TSceneNode>,
  axis: TFlipAxis,
): { changes: TSceneNodeChanges; id: string }[] => {
  const columnCount = Math.max(Math.round(frame.gridColumnCount ?? 1), 1);
  const placements = placeGridCells(getGridPlacementInputs(frame.childIds, nodesById), columnCount, frame.gridAutoPlacement ?? true);
  const rowCount = Math.max(Math.round(frame.gridRowCount ?? 1), ...placements.map((placement) => placement.rowStart + placement.rowSpan));

  return placements.map(({ columnSpan, columnStart, id, rowSpan, rowStart }) => {
    const child = nodesById[id];

    return {
      changes:
        axis === 'horizontal'
          ? {
              gridChildHorizontalAlign: MIRRORED_HORIZONTAL_ALIGN[child.gridChildHorizontalAlign ?? AlignmentHorizontal.left],
              gridColumnAnchorIndex: columnCount - columnStart - columnSpan,
              gridRowAnchorIndex: rowStart,
            }
          : {
              gridChildVerticalAlign: MIRRORED_VERTICAL_ALIGN[child.gridChildVerticalAlign ?? AlignmentVertical.top],
              gridColumnAnchorIndex: columnStart,
              gridRowAnchorIndex: rowCount - rowStart - rowSpan,
            },
      id,
    };
  });
};
