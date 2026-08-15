import { RefObject } from 'react';

// others
import { DEFAULT_SHAPE_SIZE } from '../../../../constants';

// store
import { selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TSliceDraft, TSliceDrawDragState } from '../../types';

// utils
import { DEFAULT_CURSOR } from 'utils/canvas/defaultCursor';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { screenToWorld } from '../../../../utils/screenToWorld';
import { toDraftRectWithDefault } from '../../../../utils/toDraftRectWithDefault';

export const disarmDrawDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  sliceRef: RefObject<TSliceDraft | null>,
  drawDragRef: RefObject<TSliceDrawDragState | null>,
): void => {
  if (drawDragRef.current) {
    const viewport = selectViewport(store.getState());
    const current = screenToWorld(getPointerPosition(canvas, event), viewport);
    const rect = toDraftRectWithDefault(drawDragRef.current.start, current, DEFAULT_SHAPE_SIZE, true);

    sliceRef.current = { ...rect, rotation: 0 };
    canvas.style.cursor = DEFAULT_CURSOR;
    drawDragRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
  }
};
