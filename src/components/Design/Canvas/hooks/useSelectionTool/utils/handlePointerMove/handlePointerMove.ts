import { RefObject } from 'react';

// store
import { AppDispatch } from 'store';

// types
import {
  TCornerRadiusDragState,
  TDragState,
  TEndpointDragState,
  TPathOffsetDragState,
  TPolygonCornerRadiusDragState,
  TResizeDragState,
  TRotateDragState,
} from '../../types';
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { continueCornerRadiusDrag } from './continueCornerRadiusDrag';
import { continueDrag } from './continueDrag';
import { continueEndpointDrag } from './continueEndpointDrag';
import { continueMarqueeDrag } from './continueMarqueeDrag';
import { continuePathOffsetDrag } from './continuePathOffsetDrag';
import { continuePolygonCornerRadiusDrag } from './continuePolygonCornerRadiusDrag';
import { continueResizeDrag } from './continueResizeDrag/continueResizeDrag';
import { continueRotateDrag } from './continueRotateDrag';

export const handlePointerMove = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  dragStateRef: RefObject<TDragState | null>,
  endpointDragRef: RefObject<TEndpointDragState | null>,
  pathOffsetDragRef: RefObject<TPathOffsetDragState | null>,
  resizeDragRef: RefObject<TResizeDragState | null>,
  rotateDragRef: RefObject<TRotateDragState | null>,
  cornerRadiusDragRef: RefObject<TCornerRadiusDragState | null>,
  polygonCornerRadiusDragRef: RefObject<TPolygonCornerRadiusDragState | null>,
  marqueeStartRef: RefObject<TPoint | null>,
  marqueeRef: RefObject<TDraftRect | null>,
): void => {
  continueDrag(canvas, event, dispatch, dragStateRef);
  continueEndpointDrag(canvas, event, dispatch, endpointDragRef);
  continuePathOffsetDrag(canvas, event, dispatch, pathOffsetDragRef);
  continueResizeDrag(canvas, event, dispatch, resizeDragRef);
  continueRotateDrag(canvas, event, dispatch, rotateDragRef);
  continueCornerRadiusDrag(canvas, event, dispatch, cornerRadiusDragRef);
  continuePolygonCornerRadiusDrag(canvas, event, dispatch, polygonCornerRadiusDragRef);
  continueMarqueeDrag(canvas, event, dispatch, marqueeStartRef, marqueeRef);
};
