import { MouseEvent as ReactMouseEvent } from 'react';

// types
import { TTreeDragState } from '../../types';
import { TTreeItem, TTreeRow } from '../../../../types';

// utils
import { getDraggedIndices } from './getDraggedIndices';
import { getIsRowSelectedByIndex } from '../../../../utils/getIsRowSelectedByIndex';

export const handleRowMouseDown = <T extends TTreeItem>(
  index: number,
  event: ReactMouseEvent<HTMLElement>,
  rows: TTreeRow<T>[],
  isRowSelected: ((item: T) => boolean) | undefined,
  dragState: TTreeDragState,
): void => {
  if (event.button === 0) {
    const indices = getDraggedIndices(index, rows.length, getIsRowSelectedByIndex(rows, isRowSelected));

    dragState.armedRef.current = {
      depth: rows[index].depth,
      ids: indices.map((draggedIndex) => rows[draggedIndex].item.id),
      indices,
      startY: event.clientY,
    };
  }
};
