import { PointerEvent as ReactPointerEvent, useCallback, useEffect, useRef, useState } from 'react';

// utils
import { commitGridTrackDragBegin } from './utils/commitGridTrackDragBegin';
import { commitGridTrackDragEnd } from './utils/commitGridTrackDragEnd';
import { commitGridTrackDragMove } from './utils/commitGridTrackDragMove';
import { registerGridTrackRow } from './utils/registerGridTrackRow';

export type TGridTrackDragState = {
  dropIndex: number;
  grabbedIndex: number;
  hasMoved: boolean;
  sourceIndices: number[];
};

export type TUseGridTrackReorderDragResult = {
  beginDrag: TFunc<[number[], number, ReactPointerEvent]>;
  dragState: TGridTrackDragState | null;
  registerRow: (index: number) => (element: HTMLElement | null) => void;
};

export const useGridTrackReorderDrag = (
  trackCount: number,
  onReorder: (sourceIndices: number[], insertionSlot: number, grabbedIndex: number, hasMoved: boolean) => boolean,
): TUseGridTrackReorderDragResult => {
  const [dragState, setDragState] = useState<TGridTrackDragState | null>(null);
  const dropIndexRef = useRef(0);
  const rowsRef = useRef<Map<number, HTMLElement>>(new Map());
  const registerRow = useCallback((index: number) => registerGridTrackRow(rowsRef, index), []);

  const beginDrag = (sourceIndices: number[], grabbedIndex: number, event: ReactPointerEvent): void =>
    commitGridTrackDragBegin(dropIndexRef, setDragState, sourceIndices, grabbedIndex, event);

  useEffect(() => {
    if (dragState !== null) {
      const activeDragState = dragState;
      const handleMove = (event: PointerEvent): void =>
        commitGridTrackDragMove(event, trackCount, rowsRef, dropIndexRef, activeDragState, setDragState);
      const handleUp = (): void => commitGridTrackDragEnd(activeDragState, dropIndexRef, onReorder, setDragState);

      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp);

      return (): void => {
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
      };
    }
  }, [dragState, onReorder, trackCount]);

  return { beginDrag, dragState, registerRow };
};
