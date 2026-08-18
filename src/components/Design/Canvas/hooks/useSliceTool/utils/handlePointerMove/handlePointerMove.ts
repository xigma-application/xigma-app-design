import { RefObject } from 'react';

// types
import { TSliceDrawDragState, TSliceMoveDragState, TSliceResizeDragState, TSliceRotateDragState } from '../../types';
import { TSliceDraft } from 'types/design/canvas/types';

// utils
import { continueDrawDrag } from './continueDrawDrag';
import { continueMoveDrag } from './continueMoveDrag';
import { continueResizeDrag } from './continueResizeDrag';
import { continueRotateDrag } from './continueRotateDrag';
import { updateHoverCursor } from './updateHoverCursor';

export const handlePointerMove = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  sliceRef: RefObject<TSliceDraft | null>,
  drawDragRef: RefObject<TSliceDrawDragState | null>,
  resizeDragRef: RefObject<TSliceResizeDragState | null>,
  rotateDragRef: RefObject<TSliceRotateDragState | null>,
  moveDragRef: RefObject<TSliceMoveDragState | null>,
): void => {
  continueDrawDrag(canvas, event, sliceRef, drawDragRef);
  continueResizeDrag(canvas, event, sliceRef, resizeDragRef);
  continueRotateDrag(canvas, event, sliceRef, rotateDragRef);
  continueMoveDrag(canvas, event, sliceRef, moveDragRef);
  updateHoverCursor(canvas, event, sliceRef);
};
