import { RefObject } from 'react';

// store
import { selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TVectorEraseDragState } from 'types/design/selectionTool/types';

// utils
import { eraseVectorNetworkStep } from '../../eraseVectorNetworkStep';
import { getPointerPosition } from '../../../../../utils/getPointerPosition';
import { screenToWorld } from '../../../../../utils/screenToWorld';

export const continueVectorEraseDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  vectorEraseDragRef: RefObject<TVectorEraseDragState | null>,
  eraserDiameterRef: RefObject<number>,
): void => {
  const dragState = vectorEraseDragRef.current;

  if (dragState) {
    const viewport = selectViewport(store.getState());
    const point = screenToWorld(getPointerPosition(canvas, event), viewport);

    eraseVectorNetworkStep(dispatch, dragState.lastPoint, point, eraserDiameterRef.current / 2 / viewport.zoom);
    dragState.lastPoint = point;
  }
};
