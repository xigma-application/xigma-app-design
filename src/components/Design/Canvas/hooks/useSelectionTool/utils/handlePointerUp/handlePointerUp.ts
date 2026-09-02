// store
import { endHistoryGesture } from 'store/history/actions';
import { AppDispatch } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';

// utils
import { disarmCornerRadiusDrag } from './disarmCornerRadiusDrag';
import { disarmDrag } from './disarmDrag/disarmDrag';
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
import { disarmShapeContactGuides } from './disarmShapeContactGuides';
import { disarmStarCornerRadiusDrag } from './disarmStarCornerRadiusDrag';
import { disarmStarRatioDrag } from './disarmStarRatioDrag';
import { disarmStarVertexCountDrag } from './disarmStarVertexCountDrag';
import { disarmVectorCutDrag } from './disarmVectorCutDrag/disarmVectorCutDrag';
import { disarmVectorEraseDrag } from './disarmVectorEraseDrag/disarmVectorEraseDrag';
import { disarmVectorHandleDrag } from './disarmVectorHandleDrag';
import { disarmVectorLassoDrag } from './disarmVectorLassoDrag';
import { disarmVectorMarqueeDrag } from './disarmVectorMarqueeDrag';
import { disarmVectorMultiDrag } from './disarmVectorMultiDrag/disarmVectorMultiDrag';
import { disarmVectorMultiSelectResizeDrag } from './disarmVectorMultiSelectResizeDrag';
import { disarmVectorMultiSelectRotateDrag } from './disarmVectorMultiSelectRotateDrag';
import { disarmVectorPaintDrag } from './disarmVectorPaintDrag';
import { disarmVectorSegmentBendDrag } from './disarmVectorSegmentBendDrag';
import { disarmVectorShapeBuilderDrag } from './disarmVectorShapeBuilderDrag/disarmVectorShapeBuilderDrag';
import { disarmVectorVertexDrag } from './disarmVectorVertexDrag';
import { disarmVectorWidthPointDrag } from './disarmVectorWidthPointDrag/disarmVectorWidthPointDrag';
import { resolveVectorCutMarkConsumption } from '../handlePointerMove/resolveVectorCutMarkConsumption';

export const handlePointerUp = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  canvasRefs: TCanvasRefs,
  selectionRefs: TSelectionToolRefs,
  setClassName: (className: string | null) => void,
): void => {
  disarmDrag(canvas, event, dispatch, selectionRefs.dragStateRef, canvasRefs);
  disarmEndpointDrag(canvas, event, selectionRefs.endpointDragRef);
  disarmPathOffsetDrag(canvas, event, selectionRefs.pathOffsetDragRef, setClassName);
  disarmResizeDrag(canvas, event, dispatch, selectionRefs.resizeDragRef, canvasRefs);
  disarmRotateDrag(canvas, event, dispatch, canvasRefs.transform.rotateDragRef, canvasRefs);
  disarmCornerRadiusDrag(canvas, event, canvasRefs.cornerRadius.cornerRadiusDragRef);
  disarmPolygonCornerRadiusDrag(canvas, event, canvasRefs.cornerRadius.polygonCornerRadiusDragRef);
  disarmStarCornerRadiusDrag(canvas, event, canvasRefs.cornerRadius.starCornerRadiusDragRef);
  disarmPolygonVertexCountDrag(canvas, event, canvasRefs.vertexCount.polygonVertexCountDragRef);
  disarmStarVertexCountDrag(canvas, event, canvasRefs.vertexCount.starVertexCountDragRef);
  disarmStarRatioDrag(canvas, event, selectionRefs.starRatioDragRef);
  disarmEllipseArcDrag(canvas, event, canvasRefs.ellipseArc.ellipseArcDragRef);
  disarmEllipseArcRotateDrag(canvas, event, canvasRefs.ellipseArc.ellipseArcRotateDragRef);
  disarmEllipseArcRatioDrag(canvas, event, canvasRefs.ellipseArc.ellipseArcRatioDragRef);
  disarmMarqueeDrag(canvas, event, selectionRefs.marqueeStartRef, canvasRefs.lassoMarquee.marqueeRef);
  disarmVectorVertexDrag(canvas, event, dispatch, canvasRefs, selectionRefs, setClassName);
  disarmVectorHandleDrag(canvas, event, dispatch, canvasRefs, selectionRefs, setClassName);
  disarmVectorLassoDrag(canvas, event, canvasRefs, setClassName);
  disarmVectorPaintDrag(canvas, event, canvasRefs, setClassName);
  disarmVectorShapeBuilderDrag(canvas, event, dispatch, canvasRefs, setClassName);
  disarmVectorMultiDrag(canvas, event, dispatch, canvasRefs, setClassName);
  disarmVectorMultiSelectResizeDrag(canvas, event, canvasRefs);
  disarmVectorMultiSelectRotateDrag(canvas, event, canvasRefs);
  disarmVectorSegmentBendDrag(canvas, event, dispatch, canvasRefs, selectionRefs.vectorSegmentBendDragRef, setClassName);
  disarmVectorCutDrag(canvas, event, dispatch, canvasRefs, selectionRefs, setClassName);
  disarmVectorEraseDrag(canvas, event, dispatch, canvasRefs, selectionRefs, setClassName);
  disarmVectorMarqueeDrag(canvas, event, canvasRefs, selectionRefs.vectorMarqueeStartRef, selectionRefs.vectorMarqueeModeRef);
  disarmVectorWidthPointDrag(canvas, event, dispatch, canvasRefs, setClassName);
  resolveVectorCutMarkConsumption(canvasRefs);
  disarmShapeContactGuides(canvasRefs);
  dispatch(endHistoryGesture());
};
