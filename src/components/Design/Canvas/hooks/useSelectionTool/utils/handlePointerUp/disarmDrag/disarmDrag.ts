import { RefObject } from 'react';

// store
import { AppDispatch } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDragState } from 'types/design/selectionTool/types';

// utils
import { applyPendingDragClickAction } from './applyPendingDragClickAction';
import { commitDraggedVectorNodeSnapshots } from './commitDraggedVectorNodeSnapshots';
import { flushThrottledDispatch } from 'components/Design/Canvas/utils/flushThrottledDispatch';
import { resyncRotatedGroupBounds } from './resyncRotatedGroupBounds';

export const disarmDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  dragStateRef: RefObject<TDragState | null>,
  canvasRefs: TCanvasRefs,
): void => {
  const dragState = dragStateRef.current;

  if (dragState) {
    flushThrottledDispatch(dragState.dispatchThrottle);
    commitDraggedVectorNodeSnapshots(dispatch, dragState, canvasRefs);
    resyncRotatedGroupBounds(dispatch, dragState);
    applyPendingDragClickAction(dispatch, dragState);
    canvasRefs.transform.draggedNodeIdsRef.current = null;
    canvasRefs.transform.alignmentGuideRef.current = null;
    dragStateRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
  }
};
