import { PointerEvent as ReactPointerEvent, useCallback, useEffect, useRef, useState } from 'react';

// utils
import { computeGridTrackDropIndex } from '../utils/computeGridTrackDropIndex';

export type TGridTrackDragState = {
  dropIndex: number;
  sourceIndices: number[];
};

export type TUseGridTrackReorderDragResult = {
  beginDrag: TFunc<[number[], ReactPointerEvent]>;
  dragState: TGridTrackDragState | null;
  registerRow: (index: number) => (element: HTMLElement | null) => void;
};

export const useGridTrackReorderDrag = (
  trackCount: number,
  onReorder: (sourceIndices: number[], insertionSlot: number) => boolean,
): TUseGridTrackReorderDragResult => {
  const [dragState, setDragState] = useState<TGridTrackDragState | null>(null);
  const dropIndexRef = useRef(0);
  const rowsRef = useRef<Map<number, HTMLElement>>(new Map());

  const registerRow = useCallback(
    (index: number) =>
      (element: HTMLElement | null): void => {
        if (element) {
          rowsRef.current.set(index, element);
          return;
        }

        rowsRef.current.delete(index);
      },
    [],
  );

  const beginDrag = (sourceIndices: number[], event: ReactPointerEvent): void => {
    event.preventDefault();
    dropIndexRef.current = sourceIndices[0];
    setDragState({ dropIndex: sourceIndices[0], sourceIndices });
  };

  useEffect(() => {
    if (dragState === null) {
      return undefined;
    }

    const readRects = (): (DOMRect | null)[] =>
      Array.from({ length: trackCount }, (_unused, index) => rowsRef.current.get(index)?.getBoundingClientRect() ?? null);

    const handleMove = (event: PointerEvent): void => {
      dropIndexRef.current = computeGridTrackDropIndex(readRects(), event.clientY);
      setDragState({ ...dragState, dropIndex: dropIndexRef.current });
    };

    const handleUp = (): void => {
      onReorder(dragState.sourceIndices, dropIndexRef.current);
      setDragState(null);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);

    return (): void => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [dragState, onReorder, trackCount]);

  return { beginDrag, dragState, registerRow };
};
