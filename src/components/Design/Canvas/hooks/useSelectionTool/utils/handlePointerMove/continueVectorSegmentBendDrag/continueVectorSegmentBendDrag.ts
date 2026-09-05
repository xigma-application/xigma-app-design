import { RefObject } from 'react';

// others
import { MIN_DRAG_DISTANCE_PX } from '../../../../../constants';

// store
import { selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TVectorSegmentBendDragState } from 'types/design/selectionTool/types';

// utils
import { applyVectorSegmentBendOffset } from './applyVectorSegmentBendOffset';
import { commitVectorBendSegment } from '../../../../../utils/commitVectorBendSegment';
import { getAngleBetweenPoints } from 'utils/math/getAngleBetweenPoints';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { getVectorEditingNode } from '../../../../../utils/getVectorEditingNode';
import { pickClosestAngleMatch } from 'utils/math/pickClosestAngleMatch';
import { screenToWorld } from 'utils/transform/screenToWorld';

export const continueVectorSegmentBendDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  canvasRefs: TCanvasRefs,
  vectorSegmentBendDragRef: RefObject<TVectorSegmentBendDragState | null>,
  setClassName: (className: string | null) => void,
): void => {
  const dragState = vectorSegmentBendDragRef.current;

  if (dragState) {
    const state = store.getState();
    const node = getVectorEditingNode(state.design.pages[state.design.activePageId].nodes, dragState.nodeId);

    if (node) {
      const viewport = selectViewport(state);
      const point = screenToWorld(getPointerPosition(canvas, event), viewport);
      const dx = point.x - dragState.dragStart.x;
      const dy = point.y - dragState.dragStart.y;

      if (Math.hypot(dx, dy) >= MIN_DRAG_DISTANCE_PX / viewport.zoom) {
        const bendState =
          dragState.status === 'pending'
            ? commitVectorBendSegment(
                node,
                pickClosestAngleMatch(dragState.candidates, getAngleBetweenPoints(dragState.dragStart, point)).segmentId,
                dragState.dragStart,
                dispatch,
                canvasRefs,
                vectorSegmentBendDragRef,
              )
            : dragState;

        applyVectorSegmentBendOffset(node, bendState, dx, dy, dispatch, setClassName);
      }
    }
  }
};
