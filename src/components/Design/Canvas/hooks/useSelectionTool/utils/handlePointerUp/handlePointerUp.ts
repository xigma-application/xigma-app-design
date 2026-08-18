// store
import { AppDispatch } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';

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
  canvasRefs: TCanvasRefs,
  selectionRefs: TSelectionToolRefs,
  setClassName: (className: string | null) => void,
): void => {
  disarmDrag(canvas, event, dispatch, selectionRefs.dragStateRef);
  disarmEndpointDrag(canvas, event, selectionRefs.endpointDragRef);
  disarmPathOffsetDrag(canvas, event, selectionRefs.pathOffsetDragRef, setClassName);
  disarmResizeDrag(canvas, event, selectionRefs.resizeDragRef);
  disarmRotateDrag(canvas, event, selectionRefs.rotateDragRef);
  disarmCornerRadiusDrag(canvas, event, canvasRefs.cornerRadiusDragRef);
  disarmPolygonCornerRadiusDrag(canvas, event, canvasRefs.polygonCornerRadiusDragRef);
  disarmStarCornerRadiusDrag(canvas, event, canvasRefs.starCornerRadiusDragRef);
  disarmPolygonVertexCountDrag(canvas, event, selectionRefs.polygonVertexCountDragRef);
  disarmStarVertexCountDrag(canvas, event, selectionRefs.starVertexCountDragRef);
  disarmEllipseArcDrag(canvas, event, canvasRefs.ellipseArcDragRef);
  disarmEllipseArcRotateDrag(canvas, event, canvasRefs.ellipseArcRotateDragRef);
  disarmEllipseArcRatioDrag(canvas, event, canvasRefs.ellipseArcRatioDragRef);
  disarmMarqueeDrag(canvas, event, selectionRefs.marqueeStartRef, canvasRefs.marqueeRef);
};
