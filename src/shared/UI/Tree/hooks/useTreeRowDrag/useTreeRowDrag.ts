import { MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from 'react';

// others
import { TREE_ROW_DRAG_THRESHOLD_PX } from './constants';

// types
import { TArmedRowDrag, TUseTreeRowDragOptions, TUseTreeRowDragResult } from './types';

// utils
import { getDraggedIndices } from './utils/getDraggedIndices';
import { getInsertionIndex } from './utils/getInsertionIndex';
import { getIsReorderNoOp } from './utils/getIsReorderNoOp';
import { getReorderedInsertionIndex } from './utils/getReorderedInsertionIndex';

export const useTreeRowDrag = ({ count, isRowSelected, onReorder, rowHeight, rowsRef }: TUseTreeRowDragOptions): TUseTreeRowDragResult => {
  const [insertionIndex, setInsertionIndex] = useState<number | null>(null);
  const armedRef = useRef<TArmedRowDrag | null>(null);

  const handleRowMouseDown = (index: number, event: ReactMouseEvent<HTMLElement>): void => {
    if (event.button === 0) {
      armedRef.current = { indices: getDraggedIndices(index, count, isRowSelected), startY: event.clientY };
    }
  };

  const handleMouseMove = (event: MouseEvent): void => {
    const armed = armedRef.current;
    const container = rowsRef.current;

    if (armed && container) {
      const deltaY = event.clientY - armed.startY;

      if (insertionIndex !== null || Math.abs(deltaY) >= TREE_ROW_DRAG_THRESHOLD_PX) {
        setInsertionIndex(getInsertionIndex(event.clientY, container.getBoundingClientRect().top, container.scrollTop, rowHeight, count));
      }
    }
  };

  const handleMouseUp = (): void => {
    const armed = armedRef.current;

    if (armed && insertionIndex !== null) {
      const canReorder = !getIsReorderNoOp(armed.indices, insertionIndex);

      if (canReorder) {
        onReorder?.(armed.indices, getReorderedInsertionIndex(armed.indices, insertionIndex));
      }
    }

    armedRef.current = null;
    setInsertionIndex(null);
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return (): void => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [count, insertionIndex, isRowSelected, onReorder, rowHeight, rowsRef]);

  return { handleRowMouseDown, insertionIndex };
};
