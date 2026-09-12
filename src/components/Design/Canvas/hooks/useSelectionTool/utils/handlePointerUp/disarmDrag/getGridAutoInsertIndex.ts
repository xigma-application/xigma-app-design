// types
import { TFrameNode } from 'types/design/types';
import { TGridDropHover } from 'utils/canvas/gridSlots/resolveGridDropHover/types';

export const getGridAutoInsertIndex = (frame: TFrameNode, gridDropTarget: TGridDropHover): number => {
  if (gridDropTarget.insertIndex === undefined) {
    const columnCount = Math.max(Math.round(frame.gridColumnCount ?? 1), 1);
    const firstCell = gridDropTarget.cells[0];

    return firstCell ? firstCell.row * columnCount + firstCell.column : frame.childIds.length;
  }

  return gridDropTarget.insertIndex;
};
