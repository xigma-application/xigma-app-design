import { RefObject } from 'react';

// store
import { AppDispatch } from 'store';

// types
import {
  TCornerRadiusDragState,
  TDragState,
  TEndpointDragState,
  TPathOffsetDragState,
  TResizeDragState,
  TRotateDragState,
} from '../../types';
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { disarmCornerRadiusDrag } from './disarmCornerRadiusDrag';
import { disarmDrag } from './disarmDrag';
import { disarmEndpointDrag } from './disarmEndpointDrag';
import { disarmMarqueeDrag } from './disarmMarqueeDrag';
import { disarmPathOffsetDrag } from './disarmPathOffsetDrag';
import { disarmResizeDrag } from './disarmResizeDrag';
import { disarmRotateDrag } from './disarmRotateDrag';

export const handlePointerUp = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  dragStateRef: RefObject<TDragState | null>,
  endpointDragRef: RefObject<TEndpointDragState | null>,
  pathOffsetDragRef: RefObject<TPathOffsetDragState | null>,
  resizeDragRef: RefObject<TResizeDragState | null>,
  rotateDragRef: RefObject<TRotateDragState | null>,
  cornerRadiusDragRef: RefObject<TCornerRadiusDragState | null>,
  marqueeStartRef: RefObject<TPoint | null>,
  marqueeRef: RefObject<TDraftRect | null>,
  setClassName: (className: string | null) => void,
): void => {
  disarmDrag(canvas, event, dispatch, dragStateRef);
  disarmEndpointDrag(canvas, event, endpointDragRef);
  disarmPathOffsetDrag(canvas, event, pathOffsetDragRef, setClassName);
  disarmResizeDrag(canvas, event, resizeDragRef);
  disarmRotateDrag(canvas, event, rotateDragRef);
  disarmCornerRadiusDrag(canvas, event, cornerRadiusDragRef);
  disarmMarqueeDrag(canvas, event, marqueeStartRef, marqueeRef);
};
