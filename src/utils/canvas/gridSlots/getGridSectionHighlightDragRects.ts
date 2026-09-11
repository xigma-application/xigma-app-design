// types
import { TDraftRect } from 'types/canvas';
import { TFrameNode, TSceneNode } from 'types/design/types';
import { TGridCellPosition, TGridTrackAffordanceDragState } from 'types/design/canvas/types';
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';

// utils
import { getGridSectionHighlightRects, TGridSectionHighlightRects } from './getGridSectionHighlightRects';
import { getGridTrackAffordanceDragOffset } from './getGridTrackAffordanceDragOffset';
import { getGridTrackLayout } from './getGridTrackLayout';

const shiftRect = (rect: TDraftRect, axis: TGridTrackAxis, offset: number): TDraftRect =>
  axis === 'column' ? { ...rect, x: rect.x + offset } : { ...rect, y: rect.y + offset };

export const getGridSectionHighlightDragRects = (
  frame: TFrameNode,
  nodesById: Record<string, TSceneNode>,
  cells: TGridCellPosition[],
  dragState: TGridTrackAffordanceDragState | null,
): TGridSectionHighlightRects => {
  const base = getGridSectionHighlightRects(frame, nodesById, cells);

  if (dragState && dragState.hasMoved && dragState.frameId === frame.id) {
    const layout = getGridTrackLayout(frame, nodesById);
    const isColumn = dragState.axis === 'column';
    const inGrid = cells.filter(({ column, row }) => column >= 0 && column < layout.columnCount && row >= 0 && row < layout.rowCount);
    const isDraggedBlock = inGrid.length > 0 && inGrid.every((cell) => dragState.sourceIndices.includes(isColumn ? cell.column : cell.row));

    if (isDraggedBlock) {
      const offset = getGridTrackAffordanceDragOffset(frame, layout, dragState);

      return {
        cellRects: base.cellRects.map((rect) => shiftRect(rect, dragState.axis, offset)),
        outlineRect: base.outlineRect ? shiftRect(base.outlineRect, dragState.axis, offset) : null,
      };
    }
  }

  return base;
};
