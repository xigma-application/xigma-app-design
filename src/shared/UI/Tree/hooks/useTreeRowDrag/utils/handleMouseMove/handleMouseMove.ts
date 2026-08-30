import { RefObject } from 'react';

// others
import { TREE_ITEM_INDENT_PX } from '../../../../constants';
import { TREE_ROW_DRAG_THRESHOLD_PX } from '../../constants';

// types
import { TTreeDragState } from '../../types';
import { TTreeItem, TTreeRow } from '../../../../types';

// utils
import { getDropDepth } from './getDropDepth';
import { getDropDepthRange } from './getDropDepthRange';
import { getInsertionIndex } from './getInsertionIndex';

export const handleMouseMove = <T extends TTreeItem>(
  event: MouseEvent,
  rows: TTreeRow<T>[],
  rowHeight: number,
  rowsRef: RefObject<HTMLDivElement | null>,
  dragState: TTreeDragState,
): void => {
  const armed = dragState.armedRef.current;
  const container = rowsRef.current;

  if (armed && container) {
    const deltaY = event.clientY - armed.startY;

    if (dragState.insertionIndex !== null || Math.abs(deltaY) >= TREE_ROW_DRAG_THRESHOLD_PX) {
      const containerRect = container.getBoundingClientRect();
      const nextInsertionIndex = getInsertionIndex(event.clientY, containerRect.top, container.scrollTop, rowHeight, rows.length);
      const depthRange = getDropDepthRange(rows, nextInsertionIndex);

      dragState.setInsertionIndex(nextInsertionIndex);
      dragState.setDropDepth(getDropDepth(event.clientX, containerRect.left, TREE_ITEM_INDENT_PX, depthRange));
    }
  }
};
