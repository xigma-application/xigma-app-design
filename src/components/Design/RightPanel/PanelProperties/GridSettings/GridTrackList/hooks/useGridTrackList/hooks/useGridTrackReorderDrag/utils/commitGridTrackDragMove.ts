import { RefObject } from 'react';

// hooks
import { TGridTrackDragState } from '../useGridTrackReorderDrag';

// utils
import { computeGridTrackDropIndex } from '../../../../../utils/computeGridTrackDropIndex';
import { readGridTrackRects } from './readGridTrackRects';

export const commitGridTrackDragMove = (
  event: PointerEvent,
  trackCount: number,
  rowsRef: RefObject<Map<number, HTMLElement>>,
  dropIndexRef: RefObject<number>,
  dragState: TGridTrackDragState,
  setDragState: (state: TGridTrackDragState) => void,
): void => {
  const rects = readGridTrackRects(trackCount, rowsRef.current);

  dropIndexRef.current = computeGridTrackDropIndex(rects, event.clientY);
  setDragState({ ...dragState, dropIndex: dropIndexRef.current, hasMoved: true });
};
