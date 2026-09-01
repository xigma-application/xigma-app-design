import { MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from 'react';

// types
import { TArmedRowDrag, TSpringLoad, TTreeDragState, TUseTreeRowDragOptions, TUseTreeRowDragResult } from './types';
import { TTreeItem } from '../../types';

// utils
import { clearSpringLoad } from './utils/springLoad/clearSpringLoad';
import { handleMouseMove } from './utils/handleMouseMove/handleMouseMove';
import { handleMouseUp } from './utils/handleMouseUp/handleMouseUp';
import { handleRowMouseDown } from './utils/handleRowMouseDown/handleRowMouseDown';

export const useTreeRowDrag = <T extends TTreeItem>({
  isRowSelected,
  onReorder,
  onSpringLoadExpand,
  rows,
  rowHeight,
  rowsRef,
}: TUseTreeRowDragOptions<T>): TUseTreeRowDragResult => {
  const [insertionIndex, setInsertionIndex] = useState<number | null>(null);
  const [dropDepth, setDropDepth] = useState<number>(0);
  const [dropInsideIndex, setDropInsideIndex] = useState<number | null>(null);
  const armedRef = useRef<TArmedRowDrag | null>(null);
  const springLoadRef = useRef<TSpringLoad | null>(null);
  const onSpringLoadExpandRef = useRef<((itemId: string) => void) | undefined>(onSpringLoadExpand);
  onSpringLoadExpandRef.current = onSpringLoadExpand;

  const dragState: TTreeDragState = {
    armedRef,
    dropDepth,
    dropInsideIndex,
    insertionIndex,
    onSpringLoadExpandRef,
    setDropDepth,
    setDropInsideIndex,
    setInsertionIndex,
    springLoadRef,
  };

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
  }, [rows, dropDepth, dropInsideIndex, insertionIndex, isRowSelected, onReorder, rowHeight, rowsRef]);

  useEffect(() => (): void => clearSpringLoad(springLoadRef), []);

  return { dropDepth, dropInsideIndex, handleRowMouseDown: onRowMouseDown, insertionIndex };
};
