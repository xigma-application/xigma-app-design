import { PointerEvent as ReactPointerEvent, RefObject } from 'react';

// hooks
import { TGridTrackDragState } from '../useGridTrackReorderDrag';

export const commitGridTrackDragBegin = (
  dropIndexRef: RefObject<number>,
  setDragState: (state: TGridTrackDragState) => void,
  sourceIndices: number[],
  grabbedIndex: number,
  event: ReactPointerEvent,
): void => {
  event.preventDefault();
  dropIndexRef.current = sourceIndices[0];
  setDragState({ dropIndex: sourceIndices[0], grabbedIndex, hasMoved: false, sourceIndices });
};
