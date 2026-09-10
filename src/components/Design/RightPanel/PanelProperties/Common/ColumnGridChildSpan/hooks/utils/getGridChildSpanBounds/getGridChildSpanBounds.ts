// types
import { TFrameNode, TSceneNode } from 'types/design/types';
import { TGridChildSpanBounds } from './types';

// utils
import { getDerivedGridRowCount } from 'store/design/utils/autoLayout/getDerivedGridRowCount';
import { getGridOccupancyExcludingNode } from './getGridOccupancyExcludingNode';
import { getGridPlacementInputs } from 'store/design/utils/autoLayout/getGridPlacementInputs';
import { growMaxSpan } from './growMaxSpan';
import { isGridColumnClear } from './isGridColumnClear';
import { isGridRowClear } from './isGridRowClear';
import { placeGridCells } from 'store/design/utils/autoLayout/computeGridLayoutPositions/placeGridCells/placeGridCells';

export const getGridChildSpanBounds = (frame: TFrameNode, nodesById: Record<string, TSceneNode>, nodeId: string): TGridChildSpanBounds => {
  const columnCount = Math.max(Math.round(frame.gridColumnCount ?? 1), 1);
  const rowCount = Math.max(Math.round(frame.gridRowCount ?? getDerivedGridRowCount(frame, nodesById)), 1);
  const placements = placeGridCells(getGridPlacementInputs(frame.childIds, nodesById), columnCount, frame.gridAutoPlacement ?? true);
  const self = placements.find((placement) => placement.id === nodeId);

  if (self) {
    const occupied = getGridOccupancyExcludingNode(placements, nodeId);
    const maxColumnSpan = growMaxSpan(self.columnStart, columnCount, (column) =>
      isGridColumnClear(occupied, column, self.rowStart, self.rowSpan),
    );
    const maxRowSpan = growMaxSpan(self.rowStart, rowCount, (row) => isGridRowClear(occupied, row, self.columnStart, self.columnSpan));

    return { maxColumnSpan, maxRowSpan };
  }

  return { maxColumnSpan: 1, maxRowSpan: 1 };
};
