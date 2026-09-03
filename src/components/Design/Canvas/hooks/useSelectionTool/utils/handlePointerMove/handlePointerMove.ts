// store
import { AppDispatch } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';

// utils
import { continueCornerRadiusDrag } from './continueCornerRadiusDrag';
import { continueDrag } from './continueDrag/continueDrag';
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
import { continueSmartSelectionGapDrag } from './continueSmartSelectionGapDrag';
import { continueStarCornerRadiusDrag } from './continueStarCornerRadiusDrag';
import { continueStarRatioDrag } from './continueStarRatioDrag';
import { continueStarVertexCountDrag } from './continueStarVertexCountDrag';
import { continueVectorCutDrag } from './continueVectorCutDrag/continueVectorCutDrag';
import { continueVectorEraseDrag } from './continueVectorEraseDrag/continueVectorEraseDrag';
import { continueVectorHandleDrag } from './continueVectorHandleDrag';
import { continueVectorLassoDrag } from './continueVectorLassoDrag';
import { continueVectorMarqueeDrag } from './continueVectorMarqueeDrag/continueVectorMarqueeDrag';
import { continueVectorMultiDrag } from './continueVectorMultiDrag';
import { continueVectorMultiSelectResizeDrag } from './continueVectorMultiSelectResizeDrag';
import { continueVectorMultiSelectRotateDrag } from './continueVectorMultiSelectRotateDrag';
import { continueVectorPaintDrag } from './continueVectorPaintDrag/continueVectorPaintDrag';
import { continueVectorSegmentBendDrag } from './continueVectorSegmentBendDrag/continueVectorSegmentBendDrag';
import { continueVectorShapeBuilderDrag } from './continueVectorShapeBuilderDrag';
import { continueVectorVertexDrag } from './continueVectorVertexDrag/continueVectorVertexDrag';
import { continueVectorWidthPointDrag } from './continueVectorWidthPointDrag';
import { resolveShapeContactGuides } from './resolveShapeContactGuides';
import { resolveVectorCornerHandleDrag } from './resolveVectorCornerHandleDrag';
import { resolveVectorDistanceGuides } from './resolveVectorDistanceGuides/resolveVectorDistanceGuides';
import { resolveVectorIdleHover } from './resolveVectorIdleHover';
import { resolveVectorShapeBuilderHover } from './resolveVectorShapeBuilderHover';
import { resolveVectorWidthLabelHover } from './resolveVectorWidthLabelHover';
import { resolveVectorWidthPointHover } from './resolveVectorWidthPointHover';

export const handlePointerMove = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  canvasRefs: TCanvasRefs,
  selectionRefs: TSelectionToolRefs,
  setClassName: (className: string | null) => void,
): void => {
  continueDrag(canvas, event, dispatch, selectionRefs.dragStateRef, canvasRefs, setClassName);
  continueEndpointDrag(canvas, event, dispatch, selectionRefs.endpointDragRef);
  continuePathOffsetDrag(canvas, event, dispatch, selectionRefs.pathOffsetDragRef);
  continueResizeDrag(canvas, event, dispatch, selectionRefs.resizeDragRef, canvasRefs);
  continueRotateDrag(canvas, event, dispatch, canvasRefs.transform.rotateDragRef, canvasRefs);
  continueCornerRadiusDrag(canvas, event, dispatch, canvasRefs.cornerRadius.cornerRadiusDragRef);
  continueSmartSelectionGapDrag(canvas, event, dispatch, canvasRefs.smartSelection.gapDragRef);
  continuePolygonCornerRadiusDrag(canvas, event, dispatch, canvasRefs.cornerRadius.polygonCornerRadiusDragRef);
  continueStarCornerRadiusDrag(canvas, event, dispatch, canvasRefs.cornerRadius.starCornerRadiusDragRef);
  continuePolygonVertexCountDrag(canvas, event, dispatch, canvasRefs.vertexCount.polygonVertexCountDragRef);
  continueStarVertexCountDrag(canvas, event, dispatch, canvasRefs.vertexCount.starVertexCountDragRef);
  continueStarRatioDrag(canvas, event, dispatch, canvasRefs.starRatio.starRatioDragRef);
  continueEllipseArcDrag(canvas, event, dispatch, canvasRefs.ellipseArc.ellipseArcDragRef);
  continueEllipseArcRotateDrag(canvas, event, dispatch, canvasRefs.ellipseArc.ellipseArcRotateDragRef);
  continueEllipseArcRatioDrag(canvas, event, dispatch, canvasRefs.ellipseArc.ellipseArcRatioDragRef);
  continueMarqueeDrag(canvas, event, dispatch, selectionRefs.marqueeStartRef, canvasRefs.lassoMarquee.marqueeRef);
  continueVectorVertexDrag(canvas, event, dispatch, canvasRefs, selectionRefs, setClassName);
  resolveVectorCornerHandleDrag(canvas, event, dispatch, canvasRefs, selectionRefs);
  continueVectorHandleDrag(canvas, event, dispatch, canvasRefs, selectionRefs, setClassName);
  continueVectorLassoDrag(canvas, event, canvasRefs);
  continueVectorPaintDrag(canvas, event, dispatch, canvasRefs);
  continueVectorShapeBuilderDrag(canvas, event, canvasRefs, setClassName);
  continueVectorMultiDrag(canvas, event, dispatch, canvasRefs, setClassName);
  continueVectorMultiSelectResizeDrag(canvas, event, dispatch, canvasRefs.vectorMultiSelect.vectorMultiSelectResizeDragRef);
  continueVectorMultiSelectRotateDrag(canvas, event, dispatch, canvasRefs.vectorMultiSelect.vectorMultiSelectRotateDragRef);
  continueVectorSegmentBendDrag(canvas, event, dispatch, canvasRefs, selectionRefs.vectorSegmentBendDragRef, setClassName);
  continueVectorCutDrag(canvas, event, canvasRefs, selectionRefs.vectorCutDragRef);
  continueVectorEraseDrag(canvas, event, selectionRefs.vectorEraseDragRef, canvasRefs.vectorErase.vectorEraseStrokeRef);
  continueVectorMarqueeDrag(canvas, event, canvasRefs, selectionRefs.vectorMarqueeStartRef, selectionRefs.vectorMarqueeModeRef);
  continueVectorWidthPointDrag(canvas, event, canvasRefs, setClassName);
  resolveVectorIdleHover(canvas, event, canvasRefs, setClassName);
  resolveVectorShapeBuilderHover(canvas, event, canvasRefs, setClassName);
  resolveVectorWidthPointHover(canvas, event, canvasRefs, setClassName);
  resolveVectorWidthLabelHover(canvas, event, canvasRefs);
  resolveShapeContactGuides(event, canvasRefs, selectionRefs);
  resolveVectorDistanceGuides(canvas, event, canvasRefs, setClassName);
};
