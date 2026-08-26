import { RefObject } from 'react';

// store
import { updateNode } from 'store/design/slice';
import { selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TDragState } from 'types/design/selectionTool/types';

// utils
import { getGeometryDeltaChanges } from '../../../../utils/getGeometryDeltaChanges';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { scheduleThrottledDispatch } from 'components/Design/Canvas/utils/scheduleThrottledDispatch';
import { screenToWorld } from '../../../../utils/screenToWorld';

export const continueDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  dragStateRef: RefObject<TDragState | null>,
): void => {
  const dragState = dragStateRef.current;

  if (dragState) {
    const point = screenToWorld(getPointerPosition(canvas, event), selectViewport(store.getState()));
    const deltaX = point.x - dragState.pointerStart.x;
    const deltaY = point.y - dragState.pointerStart.y;

    dragState.hasMoved = true;
    scheduleThrottledDispatch(dragState.dispatchThrottle, () =>
      Object.entries(dragState.nodeOrigins).forEach(([id, origin]) => {
        dispatch(updateNode({ changes: getGeometryDeltaChanges(origin, deltaX, deltaY), id }));
      }),
    );
  }
};
