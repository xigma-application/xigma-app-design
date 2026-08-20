// store
import { AppDispatch } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';

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
import { continueRotateDrag } from './continueRotateDrag/continueRotateDrag';
import { continueStarCornerRadiusDrag } from './continueStarCornerRadiusDrag';
import { continueStarRatioDrag } from './continueStarRatioDrag';
import { continueStarVertexCountDrag } from './continueStarVertexCountDrag';
import { continueVectorHandleDrag } from './continueVectorHandleDrag';
import { continueVectorMarqueeDrag } from './continueVectorMarqueeDrag';
import { continueVectorMultiDrag } from './continueVectorMultiDrag';
import { continueVectorVertexDrag } from './continueVectorVertexDrag';
import { resolveVectorSegmentHover } from './resolveVectorSegmentHover/resolveVectorSegmentHover';
import { resolveVectorTangentHandleHover } from './resolveVectorTangentHandleHover';
import { resolveVectorVertexHover } from './resolveVectorVertexHover';

export const handlePointerMove = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  canvasRefs: TCanvasRefs,
  selectionRefs: TSelectionToolRefs,
  setClassName: (className: string | null) => void,
): void => {
  continueDrag(canvas, event, dispatch, selectionRefs.dragStateRef);
  continueEndpointDrag(canvas, event, dispatch, selectionRefs.endpointDragRef);
  continuePathOffsetDrag(canvas, event, dispatch, selectionRefs.pathOffsetDragRef);
  continueResizeDrag(canvas, event, dispatch, selectionRefs.resizeDragRef);
  continueRotateDrag(canvas, event, dispatch, canvasRefs.rotateDragRef);
  continueCornerRadiusDrag(canvas, event, dispatch, canvasRefs.cornerRadiusDragRef);
  continuePolygonCornerRadiusDrag(canvas, event, dispatch, canvasRefs.polygonCornerRadiusDragRef);
  continueStarCornerRadiusDrag(canvas, event, dispatch, canvasRefs.starCornerRadiusDragRef);
  continuePolygonVertexCountDrag(canvas, event, dispatch, selectionRefs.polygonVertexCountDragRef);
  continueStarVertexCountDrag(canvas, event, dispatch, selectionRefs.starVertexCountDragRef);
  continueStarRatioDrag(canvas, event, dispatch, selectionRefs.starRatioDragRef);
  continueEllipseArcDrag(canvas, event, dispatch, canvasRefs.ellipseArcDragRef);
  continueEllipseArcRotateDrag(canvas, event, dispatch, canvasRefs.ellipseArcRotateDragRef);
  continueEllipseArcRatioDrag(canvas, event, dispatch, canvasRefs.ellipseArcRatioDragRef);
  continueMarqueeDrag(canvas, event, dispatch, selectionRefs.marqueeStartRef, canvasRefs.marqueeRef);
  continueVectorVertexDrag(canvas, event, dispatch, selectionRefs.vectorVertexDragRef, setClassName);
  continueVectorHandleDrag(canvas, event, dispatch, selectionRefs.vectorHandleDragRef, setClassName);
  continueVectorMultiDrag(canvas, event, dispatch, selectionRefs.vectorMultiDragRef, setClassName);
  continueVectorMarqueeDrag(canvas, event, canvasRefs, selectionRefs.vectorMarqueeStartRef, selectionRefs.vectorMarqueeModeRef);
  resolveVectorVertexHover(canvas, event, canvasRefs.hoveredVectorVertexIdRef);
  resolveVectorTangentHandleHover(canvas, event, canvasRefs);
  resolveVectorSegmentHover(canvas, event, canvasRefs.hoveredVectorSegmentIdRef, canvasRefs.hoveredVectorEdgeInsertPointRef, setClassName);
};
