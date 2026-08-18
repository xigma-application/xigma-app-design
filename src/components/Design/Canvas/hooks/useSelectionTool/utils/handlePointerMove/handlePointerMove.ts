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
import { continueRotateDrag } from './continueRotateDrag';
import { continueStarCornerRadiusDrag } from './continueStarCornerRadiusDrag';
import { continueStarRatioDrag } from './continueStarRatioDrag';
import { continueStarVertexCountDrag } from './continueStarVertexCountDrag';

export const handlePointerMove = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  canvasRefs: TCanvasRefs,
  selectionRefs: TSelectionToolRefs,
): void => {
  continueDrag(canvas, event, dispatch, selectionRefs.dragStateRef);
  continueEndpointDrag(canvas, event, dispatch, selectionRefs.endpointDragRef);
  continuePathOffsetDrag(canvas, event, dispatch, selectionRefs.pathOffsetDragRef);
  continueResizeDrag(canvas, event, dispatch, selectionRefs.resizeDragRef);
  continueRotateDrag(canvas, event, dispatch, selectionRefs.rotateDragRef);
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
};
