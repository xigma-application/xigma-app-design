import { RefObject } from 'react';

// store
import { AppDispatch } from 'store';

// types
import { TDragState, TEndpointDragState, TResizeDragState } from '../../types';
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { continueDrag } from './continueDrag';
import { continueEndpointDrag } from './continueEndpointDrag';
import { continueMarqueeDrag } from './continueMarqueeDrag';
import { continueResizeDrag } from './continueResizeDrag';

export const handlePointerMove = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  dragStateRef: RefObject<TDragState | null>,
  endpointDragRef: RefObject<TEndpointDragState | null>,
  resizeDragRef: RefObject<TResizeDragState | null>,
  marqueeStartRef: RefObject<TPoint | null>,
  marqueeRef: RefObject<TDraftRect | null>,
): void => {
  continueDrag(canvas, event, dispatch, dragStateRef);
  continueEndpointDrag(canvas, event, dispatch, endpointDragRef);
  continueResizeDrag(canvas, event, dispatch, resizeDragRef);
  continueMarqueeDrag(canvas, event, dispatch, marqueeStartRef, marqueeRef);
};
