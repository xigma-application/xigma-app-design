import { RefObject } from 'react';

// store
import { AppDispatch } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDragState } from 'types/design/selectionTool/types';

// utils
import { applyPendingDragClickAction } from './applyPendingDragClickAction';
import { commitDraggedVectorNodeSnapshots } from './commitDraggedVectorNodeSnapshots';
import { commitDropIntoFrame } from './commitDropIntoFrame';
import { flushThrottledDispatch } from 'components/Design/Canvas/utils/flushThrottledDispatch';
import { resyncRotatedGroupBounds } from './resyncRotatedGroupBounds';

export const disarmDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  dragStateRef: RefObject<TDragState | null>,
  canvasRefs: TCanvasRefs,
  setClassName: (className: string | null) => void,
): void => {
  const dragState = dragStateRef.current;

  if (dragState) {
    flushThrottledDispatch(dragState.dispatchThrottle);
    commitDraggedVectorNodeSnapshots(dispatch, dragState, canvasRefs);
    resyncRotatedGroupBounds(dispatch, dragState);
    commitDropIntoFrame(dispatch, dragState, canvasRefs);
    applyPendingDragClickAction(dispatch, dragState);
    setClassName(null);

    canvasRefs.transform.draggedNodeIdsRef.current = null;
    canvasRefs.transform.alignmentGuideRef.current = null;
    canvasRefs.transform.autoLayoutDropTargetRef.current = null;
    canvasRefs.transform.autoLayoutReorderPreviewRef.current = null;
    canvasRefs.transform.dropTargetFrameIdRef.current = null;
    canvasRefs.transform.equalSpacingGuidesRef.current = null;
    canvasRefs.transform.matchedPairGuidesRef.current = null;
    dragStateRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
  }
};
