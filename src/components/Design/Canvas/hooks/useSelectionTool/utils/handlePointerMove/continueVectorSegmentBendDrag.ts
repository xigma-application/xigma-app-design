import { RefObject } from 'react';

// others
import { MIN_DRAG_DISTANCE_PX } from '../../../../constants';

// store
import { updateNode } from 'store/design/slice';
import { selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TVectorSegmentBendDragState } from 'types/design/selectionTool/types';

// utils
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getVectorEditingNode } from '../../../../utils/getVectorEditingNode';
import { screenToWorld } from '../../../../utils/screenToWorld';

const BEND_OFFSET_SCALE = 4 / 3;

export const continueVectorSegmentBendDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  vectorSegmentBendDragRef: RefObject<TVectorSegmentBendDragState | null>,
  setClassName: (className: string | null) => void,
): void => {
  const dragState = vectorSegmentBendDragRef.current;

  if (dragState) {
    const state = store.getState();
    const node = getVectorEditingNode(state.design.nodes, dragState.nodeId);

    if (node) {
      const viewport = selectViewport(state);
      const point = screenToWorld(getPointerPosition(canvas, event), viewport);
      const dx = point.x - dragState.dragStart.x;
      const dy = point.y - dragState.dragStart.y;

      if (Math.hypot(dx, dy) >= MIN_DRAG_DISTANCE_PX / viewport.zoom) {
        const offsetX = dx * BEND_OFFSET_SCALE;
        const offsetY = dy * BEND_OFFSET_SCALE;
        const segment = node.segments[dragState.segmentId];
        const segments = {
          ...node.segments,
          [dragState.segmentId]: {
            ...segment,
            tangentEnd: { x: dragState.tangentEnd.x + offsetX, y: dragState.tangentEnd.y + offsetY },
            tangentStart: { x: dragState.tangentStart.x + offsetX, y: dragState.tangentStart.y + offsetY },
          },
        };

        dispatch(updateNode({ changes: { segments }, id: dragState.nodeId }));
        setClassName('bend');
      }
    }
  }
};
