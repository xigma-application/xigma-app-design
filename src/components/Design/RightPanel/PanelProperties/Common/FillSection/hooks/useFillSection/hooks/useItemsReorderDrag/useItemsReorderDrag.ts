import { PointerEvent as ReactPointerEvent, RefObject, useCallback, useEffect, useRef, useState } from 'react';

// utils
import { getFillDropIndex } from './utils/getFillDropIndex';
import { getFillDropOffset } from './utils/getFillDropOffset';
import { handleFillReorder } from '../../utils/handleFillReorder';
import { registerFillRow } from './utils/registerFillRow';

export type TFillDragState = { dropIndex: number; dropOffset: number; grabbedIndex: number; hasMoved: boolean; sourceIndices: number[] };

export type TUseItemsReorderDragResult = {
  beginDrag: TFunc<[number[], number, ReactPointerEvent]>;
  dragState: TFillDragState | null;
  registerRow: (index: number) => (element: HTMLElement | null) => void;
};

export const useItemsReorderDrag = <TItem>(
  fills: TItem[],
  commit: (nextFills: TItem[]) => void,
  setSelection: (indices: number[]) => void,
  containerRef: RefObject<HTMLElement | null>,
): TUseItemsReorderDragResult => {
  const [dragState, setDragState] = useState<TFillDragState | null>(null);
  const dropIndexRef = useRef(0);
  const rowsRef = useRef<Map<number, HTMLElement>>(new Map());
  const registerRow = useCallback((index: number) => registerFillRow(rowsRef.current, index), []);

  const onReorder = useCallback(
    (sourceIndices: number[], insertionSlot: number, grabbedIndex: number, hasMoved: boolean): void =>
      handleFillReorder(fills, commit, setSelection, sourceIndices, insertionSlot, grabbedIndex, hasMoved),
    [commit, fills, setSelection],
  );

  const beginDrag = (sourceIndices: number[], grabbedIndex: number, event: ReactPointerEvent): void => {
    event.preventDefault();
    dropIndexRef.current = grabbedIndex;
    setDragState({ dropIndex: grabbedIndex, dropOffset: 0, grabbedIndex, hasMoved: false, sourceIndices });
  };

  const handlePointerMove = useCallback(
    (event: PointerEvent): void => {
      const dropIndex = getFillDropIndex(fills.length, rowsRef.current, event.clientY);
      const dropOffset = containerRef.current ? getFillDropOffset(rowsRef.current, containerRef.current, fills.length, dropIndex) : 0;

      dropIndexRef.current = dropIndex;
      setDragState((current) => current && { ...current, dropIndex, dropOffset, hasMoved: true });
    },
    [containerRef, fills.length],
  );

  const handlePointerUp = useCallback((): void => {
    setDragState((current) => {
      if (current) {
        onReorder(current.sourceIndices, dropIndexRef.current, current.grabbedIndex, current.hasMoved);
      }

      return null;
    });
  }, [onReorder]);

  useEffect(() => {
    if (dragState !== null) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);

      return (): void => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [dragState, handlePointerMove, handlePointerUp]);

  return { beginDrag, dragState, registerRow };
};
