import { RefObject } from 'react';

// store
import { selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TPoint } from 'types/canvas';
import { TVectorEraseDragState } from 'types/design/selectionTool/types';

// utils
import { getPointerPosition } from '../../../../../utils/getPointerPosition';
import { screenToWorld } from '../../../../../utils/screenToWorld';

export const continueVectorEraseDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  vectorEraseDragRef: RefObject<TVectorEraseDragState | null>,
  vectorEraseStrokeRef: RefObject<TPoint[] | null>,
): void => {
  const dragState = vectorEraseDragRef.current;

  if (dragState && vectorEraseStrokeRef.current) {
    const point = screenToWorld(getPointerPosition(canvas, event), selectViewport(store.getState()));

    vectorEraseStrokeRef.current.push(point);
    dragState.lastPoint = point;
  }
};
