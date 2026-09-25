import { RefObject } from 'react';

// store
import { selectOffsetVector, selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TOffsetVectorDragState } from 'types/design/selectionTool/types';

// utils
import { changeOffsetVectorDistance } from 'components/Design/Toolbar/OffsetVectorToolbar/utils/changeOffsetVectorDistance';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { screenToWorld } from 'utils/transform/screenToWorld';

export const continueOffsetVectorDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  offsetVectorDragRef: RefObject<TOffsetVectorDragState | null>,
): void => {
  const dragState = offsetVectorDragRef.current;

  if (dragState) {
    const state = store.getState();
    const point = screenToWorld(getPointerPosition(canvas, event), selectViewport(state));
    const shift = (point.x - dragState.startPoint.x) * dragState.normal.x + (point.y - dragState.startPoint.y) * dragState.normal.y;

    dragState.point = point;
    changeOffsetVectorDistance(dispatch, selectOffsetVector(state), Math.round(dragState.startDistance + shift));
  }
};
