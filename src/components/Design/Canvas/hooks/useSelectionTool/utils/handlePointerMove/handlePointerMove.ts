import { RefObject } from 'react';

// store
import { AppDispatch } from 'store';

// types
import {
  TCornerRadiusDragState,
  TDragState,
  TEllipseArcDragState,
  TEllipseArcRatioDragState,
  TEllipseArcRotateDragState,
  TEndpointDragState,
  TPathOffsetDragState,
  TPolygonCornerRadiusDragState,
  TPolygonVertexCountDragState,
  TResizeDragState,
  TRotateDragState,
  TStarCornerRadiusDragState,
  TStarVertexCountDragState,
} from '../../types';
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { continueCornerRadiusDrag } from './continueCornerRadiusDrag';
import { continueDrag } from './continueDrag';
import { continueEllipseArcDrag } from './continueEllipseArcDrag';
import { continueEllipseArcRatioDrag } from './continueEllipseArcRatioDrag';
import { continueEllipseArcRotateDrag } from './continueEllipseArcRotateDrag';
import { continueEndpointDrag } from './continueEndpointDrag';
import { continueMarqueeDrag } from './continueMarqueeDrag';
import { continuePathOffsetDrag } from './continuePathOffsetDrag';
import { continuePolygonCornerRadiusDrag } from './continuePolygonCornerRadiusDrag';
import { continuePolygonVertexCountDrag } from './continuePolygonVertexCountDrag';
import { continueResizeDrag } from './continueResizeDrag/continueResizeDrag';
import { continueRotateDrag } from './continueRotateDrag';
import { continueStarCornerRadiusDrag } from './continueStarCornerRadiusDrag';
import { continueStarVertexCountDrag } from './continueStarVertexCountDrag';

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
  starCornerRadiusDragRef: RefObject<TStarCornerRadiusDragState | null>,
  polygonVertexCountDragRef: RefObject<TPolygonVertexCountDragState | null>,
  starVertexCountDragRef: RefObject<TStarVertexCountDragState | null>,
  ellipseArcDragRef: RefObject<TEllipseArcDragState | null>,
  ellipseArcRotateDragRef: RefObject<TEllipseArcRotateDragState | null>,
  ellipseArcRatioDragRef: RefObject<TEllipseArcRatioDragState | null>,
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
  continueStarCornerRadiusDrag(canvas, event, dispatch, starCornerRadiusDragRef);
  continuePolygonVertexCountDrag(canvas, event, dispatch, polygonVertexCountDragRef);
  continueStarVertexCountDrag(canvas, event, dispatch, starVertexCountDragRef);
  continueEllipseArcDrag(canvas, event, dispatch, ellipseArcDragRef);
  continueEllipseArcRotateDrag(canvas, event, dispatch, ellipseArcRotateDragRef);
  continueEllipseArcRatioDrag(canvas, event, dispatch, ellipseArcRatioDragRef);
  continueMarqueeDrag(canvas, event, dispatch, marqueeStartRef, marqueeRef);
};
