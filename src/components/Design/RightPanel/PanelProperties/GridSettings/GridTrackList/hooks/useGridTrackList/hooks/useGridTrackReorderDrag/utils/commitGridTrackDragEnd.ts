import { RefObject } from 'react';

// hooks
import { TGridTrackDragState } from '../useGridTrackReorderDrag';

export const commitGridTrackDragEnd = (
  dragState: TGridTrackDragState,
  dropIndexRef: RefObject<number>,
  onReorder: (sourceIndices: number[], insertionSlot: number, grabbedIndex: number, hasMoved: boolean) => boolean,
  setDragState: (state: TGridTrackDragState | null) => void,
): void => {
  onReorder(dragState.sourceIndices, dropIndexRef.current, dragState.grabbedIndex, dragState.hasMoved);
  setDragState(null);
};
