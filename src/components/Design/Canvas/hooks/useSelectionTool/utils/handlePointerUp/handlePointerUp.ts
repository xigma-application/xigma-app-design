// store
import { endHistoryGesture } from 'store/history/actions';
import { AppDispatch } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';

// utils
import { disarmAutoLayoutGapDrag } from './disarmAutoLayoutGapDrag';
import { disarmAutoLayoutPaddingDrag } from './disarmAutoLayoutPaddingDrag';
import { disarmCornerRadiusDrag } from './disarmCornerRadiusDrag';
import { disarmDrag } from './disarmDrag/disarmDrag';
import { disarmEllipseArcDrag } from './disarmEllipseArcDrag';
import { disarmEllipseArcRatioDrag } from './disarmEllipseArcRatioDrag';
import { disarmEllipseArcRotateDrag } from './disarmEllipseArcRotateDrag';
import { disarmEndpointDrag } from './disarmEndpointDrag';
import { disarmProgressiveBlurDrag } from './disarmProgressiveBlurDrag';
import { disarmGradientEndpointMoveDrag } from './disarmGradientEndpointMoveDrag';
import { disarmGradientRadiusDrag } from './disarmGradientRadiusDrag';
import { disarmGradientRotateDrag } from './disarmGradientRotateDrag';
import { disarmGradientStopDrag } from './disarmGradientStopDrag';
import { disarmGridTrackAffordanceDrag } from './disarmGridTrackAffordanceDrag';
import { disarmImageCropMoveDrag } from './disarmImageCropMoveDrag';
import { disarmImageCropResizeDrag } from './disarmImageCropResizeDrag';
import { disarmImageCropRotateDrag } from './disarmImageCropRotateDrag';
import { disarmImageTileScaleDrag } from './disarmImageTileScaleDrag';
import { disarmMarqueeDrag } from './disarmMarqueeDrag';
import { disarmPathOffsetDrag } from './disarmPathOffsetDrag';
import { disarmPolygonCornerRadiusDrag } from './disarmPolygonCornerRadiusDrag';
import { disarmPolygonVertexCountDrag } from './disarmPolygonVertexCountDrag';
import { disarmResizeDrag } from './disarmResizeDrag';
import { disarmRotateDrag } from './disarmRotateDrag';
import { disarmShapeContactGuides } from './disarmShapeContactGuides';
import { disarmSmartSelectionGapDrag } from './disarmSmartSelectionGapDrag';
import { disarmSmartSelectionSwapDrag } from './disarmSmartSelectionSwapDrag';
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
  disarmDrag(canvas, event, dispatch, selectionRefs.dragStateRef, canvasRefs, setClassName);
  disarmEndpointDrag(canvas, event, selectionRefs.endpointDragRef);
  disarmPathOffsetDrag(canvas, event, selectionRefs.pathOffsetDragRef, setClassName);
  disarmResizeDrag(canvas, event, dispatch, selectionRefs.resizeDragRef, canvasRefs);
  disarmRotateDrag(canvas, event, dispatch, canvasRefs.transform.rotateDragRef, canvasRefs);
  disarmCornerRadiusDrag(canvas, event, canvasRefs.cornerRadius.cornerRadiusDragRef);
  disarmAutoLayoutGapDrag(canvas, event, canvasRefs.transform.autoLayoutGapDragRef);
  disarmAutoLayoutPaddingDrag(canvas, event, dispatch, canvasRefs.transform.autoLayoutPaddingDragRef);
  disarmGridTrackAffordanceDrag(canvas, event, dispatch, canvasRefs.transform.gridTrackAffordanceDragRef);
  disarmSmartSelectionGapDrag(canvas, event, dispatch, canvasRefs.smartSelection.gapDragRef);
  disarmSmartSelectionSwapDrag(canvas, event, dispatch, canvasRefs.smartSelection.swapDragRef);
  disarmPolygonCornerRadiusDrag(canvas, event, canvasRefs.cornerRadius.polygonCornerRadiusDragRef);
  disarmStarCornerRadiusDrag(canvas, event, canvasRefs.cornerRadius.starCornerRadiusDragRef);
  disarmPolygonVertexCountDrag(canvas, event, canvasRefs.vertexCount.polygonVertexCountDragRef);
  disarmStarVertexCountDrag(canvas, event, canvasRefs.vertexCount.starVertexCountDragRef);
  disarmStarRatioDrag(canvas, event, canvasRefs.starRatio.starRatioDragRef);
  disarmEllipseArcDrag(canvas, event, canvasRefs.ellipseArc.ellipseArcDragRef);
  disarmEllipseArcRotateDrag(canvas, event, canvasRefs.ellipseArc.ellipseArcRotateDragRef);
  disarmEllipseArcRatioDrag(canvas, event, canvasRefs.ellipseArc.ellipseArcRatioDragRef);
  disarmGradientStopDrag(canvas, event, canvasRefs.gradientStop.gradientStopDragRef);
  disarmProgressiveBlurDrag(canvas, event, canvasRefs.progressiveBlur.dragRef, canvasRefs);
  disarmGradientEndpointMoveDrag(canvas, event, canvasRefs.gradientEndpointMove.gradientEndpointMoveDragRef, canvasRefs);
  disarmGradientRadiusDrag(canvas, event, canvasRefs.gradientRadius.gradientRadiusDragRef);
  disarmGradientRotateDrag(canvas, event, canvasRefs.gradientRotate.gradientRotateDragRef, canvasRefs);
  disarmImageCropMoveDrag(canvas, event, canvasRefs.imageCrop.imageCropMoveDragRef, canvasRefs);
  disarmImageCropResizeDrag(canvas, event, canvasRefs.imageCrop.imageCropResizeDragRef);
  disarmImageCropRotateDrag(canvas, event, canvasRefs.imageCrop.imageCropRotateDragRef);
  disarmImageTileScaleDrag(canvas, event, canvasRefs.imageCrop.imageTileScaleDragRef);
  disarmMarqueeDrag(canvas, event, selectionRefs.marqueeStartRef, canvasRefs.lassoMarquee.marqueeRef);
  disarmVectorVertexDrag(canvas, event, dispatch, canvasRefs, selectionRefs, setClassName);
  disarmVectorHandleDrag(canvas, event, dispatch, canvasRefs, selectionRefs, setClassName);
  disarmVectorLassoDrag(canvas, event, canvasRefs, setClassName);
  disarmVectorPaintDrag(canvas, event, dispatch, canvasRefs, setClassName);
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
