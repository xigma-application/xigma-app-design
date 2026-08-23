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
import { continueVectorCutDrag } from './continueVectorCutDrag/continueVectorCutDrag';
import { continueVectorHandleDrag } from './continueVectorHandleDrag';
import { continueVectorLassoDrag } from './continueVectorLassoDrag';
import { continueVectorMarqueeDrag } from './continueVectorMarqueeDrag';
import { continueVectorMultiDrag } from './continueVectorMultiDrag';
import { continueVectorMultiSelectResizeDrag } from './continueVectorMultiSelectResizeDrag';
import { continueVectorMultiSelectRotateDrag } from './continueVectorMultiSelectRotateDrag';
import { continueVectorSegmentBendDrag } from './continueVectorSegmentBendDrag/continueVectorSegmentBendDrag';
import { continueVectorShapeBuilderDrag } from './continueVectorShapeBuilderDrag';
import { continueVectorVertexDrag } from './continueVectorVertexDrag/continueVectorVertexDrag';
import { resolveVectorCornerHandleDrag } from './resolveVectorCornerHandleDrag';
import { resolveVectorIdleHover } from './resolveVectorIdleHover';
import { resolveVectorShapeBuilderHover } from './resolveVectorShapeBuilderHover';

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
  continueVectorVertexDrag(canvas, event, dispatch, canvasRefs, selectionRefs, setClassName);
  resolveVectorCornerHandleDrag(canvas, event, dispatch, canvasRefs, selectionRefs);
  continueVectorHandleDrag(canvas, event, dispatch, canvasRefs, selectionRefs, setClassName);
  continueVectorLassoDrag(canvas, event, canvasRefs);
  continueVectorShapeBuilderDrag(canvas, event, canvasRefs, setClassName);
  continueVectorMultiDrag(canvas, event, dispatch, canvasRefs, setClassName);
  continueVectorMultiSelectResizeDrag(canvas, event, dispatch, canvasRefs.vectorMultiSelectResizeDragRef);
  continueVectorMultiSelectRotateDrag(canvas, event, dispatch, canvasRefs.vectorMultiSelectRotateDragRef);
  continueVectorSegmentBendDrag(canvas, event, dispatch, canvasRefs, selectionRefs.vectorSegmentBendDragRef, setClassName);
  continueVectorCutDrag(canvas, event, canvasRefs, selectionRefs.vectorCutDragRef);
  continueVectorMarqueeDrag(canvas, event, canvasRefs, selectionRefs.vectorMarqueeStartRef, selectionRefs.vectorMarqueeModeRef);
  resolveVectorIdleHover(canvas, event, canvasRefs, setClassName);
  resolveVectorShapeBuilderHover(canvas, event, canvasRefs, setClassName);
};
