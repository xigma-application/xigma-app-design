// types
import { TDraftRect } from 'types/canvas';
import { TFrameNode, TSceneNode } from 'types/design/types';
import { TGridCellPosition } from 'types/design/canvas/types';

// utils
import { getGridSlotRect } from './getGridSlotRect';
import { getGridTrackLayout } from './getGridTrackLayout';

export type TGridSectionHighlightRects = {
  cellRects: TDraftRect[];
  outlineRect: TDraftRect | null;
};

export const getGridSectionHighlightRects = (
  frame: TFrameNode,
  nodesById: Record<string, TSceneNode>,
  cells: TGridCellPosition[],
): TGridSectionHighlightRects => {
  const layout = getGridTrackLayout(frame, nodesById);
  const inGrid = cells.filter(({ column, row }) => column >= 0 && column < layout.columnCount && row >= 0 && row < layout.rowCount);

  if (inGrid.length !== 0) {
    const cellRects = inGrid.map(({ column, row }) => getGridSlotRect(layout, frame, column, row));
    const columns = inGrid.map(({ column }) => column);
    const rows = inGrid.map(({ row }) => row);
    const topLeft = getGridSlotRect(layout, frame, Math.min(...columns), Math.min(...rows));
    const bottomRight = getGridSlotRect(layout, frame, Math.max(...columns), Math.max(...rows));

    return {
      cellRects,
      outlineRect: {
        height: bottomRight.y + bottomRight.height - topLeft.y,
        width: bottomRight.x + bottomRight.width - topLeft.x,
        x: topLeft.x,
        y: topLeft.y,
      },
    };
  }

  return { cellRects: [], outlineRect: null };
};
