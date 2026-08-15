import { RefObject } from 'react';

// store
import { selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TSliceDraft, TSliceDrawDragState } from '../../types';

// utils
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { screenToWorld } from '../../../../utils/screenToWorld';
import { toDraftRect } from '../../../../utils/toDraftRect';

export const continueDrawDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  sliceRef: RefObject<TSliceDraft | null>,
  drawDragRef: RefObject<TSliceDrawDragState | null>,
): void => {
  if (drawDragRef.current) {
    const point = screenToWorld(getPointerPosition(canvas, event), selectViewport(store.getState()));

    sliceRef.current = { ...toDraftRect(drawDragRef.current.start, point), rotation: 0 };
  }
};
