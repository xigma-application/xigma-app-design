import { RefObject } from 'react';

// store
import { AppDispatch } from 'store';

// types
import { TDragState, TEndpointDragState } from '../../types';
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { continueDrag } from './continueDrag';
import { continueEndpointDrag } from './continueEndpointDrag';
import { continueMarqueeDrag } from './continueMarqueeDrag';

export const handlePointerMove = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  dragStateRef: RefObject<TDragState | null>,
  endpointDragRef: RefObject<TEndpointDragState | null>,
  marqueeStartRef: RefObject<TPoint | null>,
  marqueeRef: RefObject<TDraftRect | null>,
): void => {
  continueDrag(canvas, event, dispatch, dragStateRef);
  continueEndpointDrag(canvas, event, dispatch, endpointDragRef);
  continueMarqueeDrag(canvas, event, dispatch, marqueeStartRef, marqueeRef);
};
