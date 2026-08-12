import { RefObject } from 'react';

// store
import { AppDispatch } from 'store';

// types
import { TDragState, TEndpointDragState } from '../../types';
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { disarmDrag } from './disarmDrag';
import { disarmEndpointDrag } from './disarmEndpointDrag';
import { disarmMarqueeDrag } from './disarmMarqueeDrag';

export const handlePointerUp = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  dragStateRef: RefObject<TDragState | null>,
  endpointDragRef: RefObject<TEndpointDragState | null>,
  marqueeStartRef: RefObject<TPoint | null>,
  marqueeRef: RefObject<TDraftRect | null>,
): void => {
  disarmDrag(canvas, event, dispatch, dragStateRef);
  disarmEndpointDrag(canvas, event, endpointDragRef);
  disarmMarqueeDrag(canvas, event, marqueeStartRef, marqueeRef);
};
