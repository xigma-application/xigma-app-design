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
import { disarmCornerRadiusDrag } from './disarmCornerRadiusDrag';
import { disarmDrag } from './disarmDrag';
import { disarmEllipseArcDrag } from './disarmEllipseArcDrag';
import { disarmEllipseArcRatioDrag } from './disarmEllipseArcRatioDrag';
import { disarmEllipseArcRotateDrag } from './disarmEllipseArcRotateDrag';
import { disarmEndpointDrag } from './disarmEndpointDrag';
import { disarmMarqueeDrag } from './disarmMarqueeDrag';
import { disarmPathOffsetDrag } from './disarmPathOffsetDrag';
import { disarmPolygonCornerRadiusDrag } from './disarmPolygonCornerRadiusDrag';
import { disarmPolygonVertexCountDrag } from './disarmPolygonVertexCountDrag';
import { disarmResizeDrag } from './disarmResizeDrag';
import { disarmRotateDrag } from './disarmRotateDrag';
import { disarmStarCornerRadiusDrag } from './disarmStarCornerRadiusDrag';
import { disarmStarVertexCountDrag } from './disarmStarVertexCountDrag';

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
  polygonCornerRadiusDragRef: RefObject<TPolygonCornerRadiusDragState | null>,
  starCornerRadiusDragRef: RefObject<TStarCornerRadiusDragState | null>,
  polygonVertexCountDragRef: RefObject<TPolygonVertexCountDragState | null>,
  starVertexCountDragRef: RefObject<TStarVertexCountDragState | null>,
  ellipseArcDragRef: RefObject<TEllipseArcDragState | null>,
  ellipseArcRotateDragRef: RefObject<TEllipseArcRotateDragState | null>,
  ellipseArcRatioDragRef: RefObject<TEllipseArcRatioDragState | null>,
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
  disarmPolygonCornerRadiusDrag(canvas, event, polygonCornerRadiusDragRef);
  disarmStarCornerRadiusDrag(canvas, event, starCornerRadiusDragRef);
  disarmPolygonVertexCountDrag(canvas, event, polygonVertexCountDragRef);
  disarmStarVertexCountDrag(canvas, event, starVertexCountDragRef);
  disarmEllipseArcDrag(canvas, event, ellipseArcDragRef);
  disarmEllipseArcRotateDrag(canvas, event, ellipseArcRotateDragRef);
  disarmEllipseArcRatioDrag(canvas, event, ellipseArcRatioDragRef);
  disarmMarqueeDrag(canvas, event, marqueeStartRef, marqueeRef);
};
