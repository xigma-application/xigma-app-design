import { MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from 'react';

// types
import { TArmedRowDrag, TTreeDragState, TUseTreeRowDragOptions, TUseTreeRowDragResult } from './types';
import { TTreeItem } from '../../types';

// utils
import { handleMouseMove } from './utils/handleMouseMove/handleMouseMove';
import { handleMouseUp } from './utils/handleMouseUp/handleMouseUp';
import { handleRowMouseDown } from './utils/handleRowMouseDown/handleRowMouseDown';

export const useTreeRowDrag = <T extends TTreeItem>({
  isRowSelected,
  onReorder,
  rows,
  rowHeight,
  rowsRef,
}: TUseTreeRowDragOptions<T>): TUseTreeRowDragResult => {
  const [insertionIndex, setInsertionIndex] = useState<number | null>(null);
  const [dropDepth, setDropDepth] = useState<number>(0);
  const armedRef = useRef<TArmedRowDrag | null>(null);
  const dragState: TTreeDragState = { armedRef, dropDepth, insertionIndex, setDropDepth, setInsertionIndex };

  const onRowMouseDown = (index: number, event: ReactMouseEvent<HTMLElement>): void =>
    handleRowMouseDown(index, event, rows, isRowSelected, dragState);

  useEffect(() => {
    const onMouseMove = (event: MouseEvent): void => handleMouseMove(event, rows, rowHeight, rowsRef, dragState);
    const onMouseUp = (): void => handleMouseUp(rows, dragState, onReorder);

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return (): void => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [rows, dropDepth, insertionIndex, isRowSelected, onReorder, rowHeight, rowsRef]);

  return { dropDepth, handleRowMouseDown: onRowMouseDown, insertionIndex };
};
