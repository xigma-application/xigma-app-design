import { RefObject } from 'react';

// types
import { TSliceDraft, TSliceDrawDragState, TSliceMoveDragState, TSliceResizeDragState, TSliceRotateDragState } from '../../types';

// utils
import { disarmDrawDrag } from './disarmDrawDrag';
import { disarmMoveDrag } from './disarmMoveDrag';
import { disarmResizeDrag } from './disarmResizeDrag';
import { disarmRotateDrag } from './disarmRotateDrag';

export const handlePointerUp = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  sliceRef: RefObject<TSliceDraft | null>,
  drawDragRef: RefObject<TSliceDrawDragState | null>,
  resizeDragRef: RefObject<TSliceResizeDragState | null>,
  rotateDragRef: RefObject<TSliceRotateDragState | null>,
  moveDragRef: RefObject<TSliceMoveDragState | null>,
): void => {
  disarmDrawDrag(canvas, event, sliceRef, drawDragRef);
  disarmResizeDrag(canvas, event, resizeDragRef);
  disarmRotateDrag(canvas, event, rotateDragRef);
  disarmMoveDrag(canvas, event, moveDragRef);
};
