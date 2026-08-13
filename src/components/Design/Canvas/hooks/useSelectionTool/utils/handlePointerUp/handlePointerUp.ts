import { RefObject } from 'react';

// store
import { AppDispatch } from 'store';

// types
import { TDragState, TEndpointDragState, TResizeDragState, TRotateDragState } from '../../types';
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { disarmDrag } from './disarmDrag';
import { disarmEndpointDrag } from './disarmEndpointDrag';
import { disarmMarqueeDrag } from './disarmMarqueeDrag';
import { disarmResizeDrag } from './disarmResizeDrag';
import { disarmRotateDrag } from './disarmRotateDrag';

export const handlePointerUp = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  dragStateRef: RefObject<TDragState | null>,
  endpointDragRef: RefObject<TEndpointDragState | null>,
  resizeDragRef: RefObject<TResizeDragState | null>,
  rotateDragRef: RefObject<TRotateDragState | null>,
  marqueeStartRef: RefObject<TPoint | null>,
  marqueeRef: RefObject<TDraftRect | null>,
): void => {
  disarmDrag(canvas, event, dispatch, dragStateRef);
  disarmEndpointDrag(canvas, event, endpointDragRef);
  disarmResizeDrag(canvas, event, resizeDragRef);
  disarmRotateDrag(canvas, event, rotateDragRef);
  disarmMarqueeDrag(canvas, event, marqueeStartRef, marqueeRef);
};
