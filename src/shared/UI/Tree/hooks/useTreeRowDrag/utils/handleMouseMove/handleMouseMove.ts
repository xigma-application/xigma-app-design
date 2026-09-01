import { RefObject } from 'react';

// others
import { TREE_ITEM_INDENT_PX } from '../../../../constants';
import { TREE_ROW_DRAG_THRESHOLD_PX } from '../../constants';

// types
import { TTreeDragState } from '../../types';
import { TTreeItem, TTreeRow } from '../../../../types';

// utils
import { clearSpringLoad } from '../springLoad/clearSpringLoad';
import { getDropDepth } from './getDropDepth';
import { getDropDepthRange } from './getDropDepthRange';
import { getDropInsideIndex } from './getDropInsideIndex';
import { getHoveredRowSlot } from './getHoveredRowSlot';
import { getInsertionIndex } from './getInsertionIndex';
import { handleSpringLoad } from '../springLoad/handleSpringLoad';

const applyReorderTarget = <T extends TTreeItem>(
  event: MouseEvent,
  rows: TTreeRow<T>[],
  rowHeight: number,
  containerRect: DOMRect,
  scrollTop: number,
  dragState: TTreeDragState,
): void => {
  const nextInsertionIndex = getInsertionIndex(event.clientY, containerRect.top, scrollTop, rowHeight, rows.length);
  const depthRange = getDropDepthRange(rows, nextInsertionIndex);

  clearSpringLoad(dragState.springLoadRef);
  dragState.setDropInsideIndex(null);
  dragState.setInsertionIndex(nextInsertionIndex);
  dragState.setDropDepth(getDropDepth(event.clientX, containerRect.left, TREE_ITEM_INDENT_PX, depthRange));
};

const applyDropInsideTarget = <T extends TTreeItem>(rows: TTreeRow<T>[], dropInsideIndex: number, dragState: TTreeDragState): void => {
  const containerRow = rows[dropInsideIndex];

  dragState.setDropInsideIndex(dropInsideIndex);
  dragState.setInsertionIndex(dropInsideIndex + 1);
  dragState.setDropDepth(containerRow.depth + 1);

  if (containerRow.isExpanded) {
    clearSpringLoad(dragState.springLoadRef);
  } else {
    handleSpringLoad(dragState, containerRow.item.id);
  }
};

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
    const hasStartedDragging = dragState.insertionIndex !== null || Math.abs(deltaY) >= TREE_ROW_DRAG_THRESHOLD_PX;

    if (hasStartedDragging) {
      const containerRect = container.getBoundingClientRect();
      const hoveredSlot = getHoveredRowSlot(event.clientY, containerRect.top, container.scrollTop, rowHeight, rows.length);
      const dropInsideIndex = getDropInsideIndex(rows, hoveredSlot, armed.ids);

      if (dropInsideIndex === null) {
        applyReorderTarget(event, rows, rowHeight, containerRect, container.scrollTop, dragState);
      } else {
        applyDropInsideTarget(rows, dropInsideIndex, dragState);
      }
    }
  }
};
