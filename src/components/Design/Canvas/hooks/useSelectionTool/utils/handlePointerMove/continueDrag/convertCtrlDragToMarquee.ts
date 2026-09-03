import { RefObject } from 'react';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDragState } from 'types/design/selectionTool/types';
import { TPoint } from 'types/canvas';

export const convertCtrlDragToMarquee = (
  dragState: TDragState,
  dragStateRef: RefObject<TDragState | null>,
  marqueeStartRef: RefObject<TPoint | null>,
  canvasRefs: TCanvasRefs,
): void => {
  canvasRefs.vectorSnapshots.draggedVectorNodeSnapshotsRef.current = null;
  dragStateRef.current = null;
  marqueeStartRef.current = dragState.pointerStart;
};
