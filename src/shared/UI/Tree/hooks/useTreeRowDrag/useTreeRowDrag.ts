import { MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from 'react';

// others
import { TREE_ROW_DRAG_THRESHOLD_PX } from './constants';

// types
import { TArmedRowDrag, TUseTreeRowDragOptions, TUseTreeRowDragResult } from './types';

// utils
import { getInsertionIndex } from './utils/getInsertionIndex';
import { getReorderedIndex } from './utils/getReorderedIndex';

export const useTreeRowDrag = ({ count, onReorder, rowHeight, rowsRef }: TUseTreeRowDragOptions): TUseTreeRowDragResult => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [insertionIndex, setInsertionIndex] = useState<number | null>(null);
  const [pointerOffsetY, setPointerOffsetY] = useState(0);
  const armedRef = useRef<TArmedRowDrag | null>(null);

  const handleRowMouseDown = (index: number, event: ReactMouseEvent<HTMLElement>): void => {
    if (event.button === 0) {
      armedRef.current = { index, startY: event.clientY };
    }
  };

  const handleMouseMove = (event: MouseEvent): void => {
    const armed = armedRef.current;
    const container = rowsRef.current;

    if (armed && container) {
      const deltaY = event.clientY - armed.startY;

      if (dragIndex !== null || Math.abs(deltaY) >= TREE_ROW_DRAG_THRESHOLD_PX) {
        setDragIndex(armed.index);
        setPointerOffsetY(deltaY);
        setInsertionIndex(getInsertionIndex(event.clientY, container.getBoundingClientRect().top, container.scrollTop, rowHeight, count));
      }
    }
  };

  const handleMouseUp = (): void => {
    const armed = armedRef.current;

    if (armed && insertionIndex !== null) {
      const toIndex = getReorderedIndex(armed.index, insertionIndex);

      if (toIndex !== armed.index) {
        onReorder?.(armed.index, toIndex);
      }
    }

    armedRef.current = null;
    setDragIndex(null);
    setInsertionIndex(null);
    setPointerOffsetY(0);
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return (): void => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [count, dragIndex, insertionIndex, onReorder, rowHeight, rowsRef]);

  return { dragIndex, handleRowMouseDown, insertionIndex, pointerOffsetY };
};
