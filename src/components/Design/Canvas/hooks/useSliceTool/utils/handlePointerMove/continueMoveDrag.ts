import { RefObject } from 'react';

// store
import { selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TSliceDraft, TSliceMoveDragState } from '../../types';

// utils
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { screenToWorld } from '../../../../utils/screenToWorld';

export const continueMoveDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  sliceRef: RefObject<TSliceDraft | null>,
  moveDragRef: RefObject<TSliceMoveDragState | null>,
): void => {
  if (moveDragRef.current) {
    const { origin, pointerStart } = moveDragRef.current;
    const point = screenToWorld(getPointerPosition(canvas, event), selectViewport(store.getState()));

    sliceRef.current = { ...origin, x: origin.x + (point.x - pointerStart.x), y: origin.y + (point.y - pointerStart.y) };
  }
};
