// store
import { setSelection } from 'store/design/slice';
import { selectOrderedNodes, selectSelectedIds, selectSelectedNodes, selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { MouseButton } from 'types/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';

// utils
import { armCornerRadiusDrag } from './armCornerRadiusDrag';
import { armEllipseArcDrag } from './armEllipseArcDrag';
import { armEllipseArcRatioDrag } from './armEllipseArcRatioDrag';
import { armEllipseArcRotateDrag } from './armEllipseArcRotateDrag';
import { armGroupBoundsDrag } from './armGroupBoundsDrag';
import { armHitDrag } from './armHitDrag';
import { armLineEndpointDrag } from './armLineEndpointDrag';
import { armMarqueeDrag } from './armMarqueeDrag';
import { armPathOffsetDrag } from './armPathOffsetDrag';
import { armPolygonCornerRadiusDrag } from './armPolygonCornerRadiusDrag';
import { armPolygonVertexCountDrag } from './armPolygonVertexCountDrag';
import { armResizeDrag } from './armResizeDrag';
import { armRotateDrag } from './armRotateDrag';
import { armStarCornerRadiusDrag } from './armStarCornerRadiusDrag';
import { armStarVertexCountDrag } from './armStarVertexCountDrag';
import { getCornerRadiusHandleAtPoint } from '../../../../utils/getCornerRadiusHandleAtPoint';
import { getEllipseArcHandleAtPoint } from '../../../../utils/getEllipseArcHandleAtPoint';
import { getEllipseArcRatioHandleAtPoint } from '../../../../utils/getEllipseArcRatioHandleAtPoint';
import { getEllipseArcRotateHandleAtPoint } from '../../../../utils/getEllipseArcRotateHandleAtPoint';
import { getLineEndpointAtPoint } from '../../../../utils/getLineEndpointAtPoint';
import { getNodeAtPoint } from '../../../../utils/getNodeAtPoint';
import { getPathTextOffsetHandleAtPoint } from '../../../../utils/getPathTextOffsetHandleAtPoint';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getPolygonCornerRadiusHandleAtPoint } from '../../../../utils/getPolygonCornerRadiusHandleAtPoint';
import { getPolygonVertexCountHandleAtPoint } from '../../../../utils/getPolygonVertexCountHandleAtPoint';
import { getResizeHandleAtPoint } from '../../../../utils/getResizeHandleAtPoint';
import { getRotateHandleAtPoint } from '../../../../utils/getRotateHandleAtPoint';
import { getStarCornerRadiusHandleAtPoint } from '../../../../utils/getStarCornerRadiusHandleAtPoint';
import { getStarVertexCountHandleAtPoint } from '../../../../utils/getStarVertexCountHandleAtPoint';
import { isPointInGroupBounds } from '../isPointInGroupBounds';
import { isPointInSelectedTextBounds } from '../isPointInSelectedTextBounds';
import { screenToWorld } from '../../../../utils/screenToWorld';
import { toggleSelection } from '../toggleSelection';

export const handlePointerDown = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  canvasRefs: TCanvasRefs,
  selectionRefs: TSelectionToolRefs,
  setClassName: (className: string | null) => void,
): void => {
  if (event.button === MouseButton.primary) {
    const state = store.getState();
    const viewport = selectViewport(state);
    const point = screenToWorld(getPointerPosition(canvas, event), viewport);
    const hit = getNodeAtPoint(point, selectOrderedNodes(state), viewport);
    const currentSelection = selectSelectedIds(state);
    const selectedNodes = selectSelectedNodes(state);
    const lineEndpointHit = getLineEndpointAtPoint(point, selectedNodes, viewport);
    const pathOffsetHandleHit = getPathTextOffsetHandleAtPoint(point, selectedNodes, viewport);
    const resizeHandleHit = getResizeHandleAtPoint(point, selectedNodes, viewport);
    const rotateHandleHit = getRotateHandleAtPoint(point, selectedNodes, viewport);
    const polygonVertexCountHandleHit = getPolygonVertexCountHandleAtPoint(point, selectedNodes, viewport);
    const starVertexCountHandleHit = getStarVertexCountHandleAtPoint(point, selectedNodes, viewport);
    const ellipseArcHandleHit = getEllipseArcHandleAtPoint(point, selectedNodes, viewport);
    const ellipseArcRotateHandleHit = getEllipseArcRotateHandleAtPoint(point, selectedNodes, viewport);
    const ellipseArcRatioHandleHit = getEllipseArcRatioHandleAtPoint(point, selectedNodes, viewport);
    const cornerRadiusHandleHit = resizeHandleHit ? null : getCornerRadiusHandleAtPoint(point, selectedNodes, viewport);
    const polygonCornerRadiusHandleHit = resizeHandleHit ? null : getPolygonCornerRadiusHandleAtPoint(point, selectedNodes, viewport);
    const starCornerRadiusHandleHit = resizeHandleHit ? null : getStarCornerRadiusHandleAtPoint(point, selectedNodes, viewport);

    switch (true) {
      case Boolean(pathOffsetHandleHit):
        armPathOffsetDrag(canvas, event, selectionRefs.pathOffsetDragRef, pathOffsetHandleHit!.nodeId, setClassName);
        break;
      case Boolean(polygonVertexCountHandleHit):
        armPolygonVertexCountDrag(
          canvas,
          event,
          selectionRefs.polygonVertexCountDragRef,
          polygonVertexCountHandleHit!.bounds,
          polygonVertexCountHandleHit!.nodeId,
          polygonVertexCountHandleHit!.rotation,
          polygonVertexCountHandleHit!.flipX,
          polygonVertexCountHandleHit!.flipY,
        );
        break;
      case Boolean(starVertexCountHandleHit):
        armStarVertexCountDrag(
          canvas,
          event,
          selectionRefs.starVertexCountDragRef,
          starVertexCountHandleHit!.bounds,
          starVertexCountHandleHit!.nodeId,
          starVertexCountHandleHit!.rotation,
          starVertexCountHandleHit!.flipX,
          starVertexCountHandleHit!.flipY,
        );
        break;
      case Boolean(ellipseArcHandleHit):
        armEllipseArcDrag(
          canvas,
          event,
          canvasRefs.ellipseArcDragRef,
          ellipseArcHandleHit!.bounds,
          ellipseArcHandleHit!.nodeId,
          ellipseArcHandleHit!.rotation,
          ellipseArcHandleHit!.flipX,
          ellipseArcHandleHit!.flipY,
        );
        break;
      case Boolean(ellipseArcRotateHandleHit):
        armEllipseArcRotateDrag(
          canvas,
          event,
          canvasRefs.ellipseArcRotateDragRef,
          ellipseArcRotateHandleHit!.bounds,
          ellipseArcRotateHandleHit!.nodeId,
          ellipseArcRotateHandleHit!.rotation,
          ellipseArcRotateHandleHit!.flipX,
          ellipseArcRotateHandleHit!.flipY,
        );
        break;
      case Boolean(ellipseArcRatioHandleHit):
        armEllipseArcRatioDrag(
          canvas,
          event,
          canvasRefs.ellipseArcRatioDragRef,
          ellipseArcRatioHandleHit!.bounds,
          ellipseArcRatioHandleHit!.nodeId,
          ellipseArcRatioHandleHit!.rotation,
          ellipseArcRatioHandleHit!.flipX,
          ellipseArcRatioHandleHit!.flipY,
        );
        break;
      case Boolean(resizeHandleHit):
        armResizeDrag(canvas, event, selectionRefs.resizeDragRef, selectedNodes, resizeHandleHit!.handle, resizeHandleHit!.bounds);
        break;
      case Boolean(cornerRadiusHandleHit):
        armCornerRadiusDrag(
          canvas,
          event,
          canvasRefs.cornerRadiusDragRef,
          cornerRadiusHandleHit!.bounds,
          cornerRadiusHandleHit!.corners,
          cornerRadiusHandleHit!.nodeId,
          cornerRadiusHandleHit!.rotation,
          point,
        );
        break;
      case Boolean(polygonCornerRadiusHandleHit):
        armPolygonCornerRadiusDrag(
          canvas,
          event,
          canvasRefs.polygonCornerRadiusDragRef,
          polygonCornerRadiusHandleHit!.bounds,
          polygonCornerRadiusHandleHit!.nodeId,
          polygonCornerRadiusHandleHit!.rotation,
          polygonCornerRadiusHandleHit!.sides,
          polygonCornerRadiusHandleHit!.flipX,
          polygonCornerRadiusHandleHit!.flipY,
        );
        break;
      case Boolean(starCornerRadiusHandleHit):
        armStarCornerRadiusDrag(
          canvas,
          event,
          canvasRefs.starCornerRadiusDragRef,
          starCornerRadiusHandleHit!.bounds,
          starCornerRadiusHandleHit!.nodeId,
          starCornerRadiusHandleHit!.rotation,
          starCornerRadiusHandleHit!.points,
          starCornerRadiusHandleHit!.ratio,
          starCornerRadiusHandleHit!.flipX,
          starCornerRadiusHandleHit!.flipY,
        );
        break;
      case Boolean(rotateHandleHit):
        armRotateDrag(canvas, event, selectionRefs.rotateDragRef, selectedNodes, rotateHandleHit!.bounds, rotateHandleHit!.rotation, point);
        break;
      case Boolean(lineEndpointHit) && !event.shiftKey:
        armLineEndpointDrag(canvas, event, selectionRefs.endpointDragRef, lineEndpointHit!.nodeId, lineEndpointHit!.endpoint);
        break;
      case Boolean(hit) && event.shiftKey:
        dispatch(setSelection(toggleSelection(currentSelection, hit!.id)));
        break;
      case Boolean(hit):
        armHitDrag(canvas, event, dispatch, selectionRefs.dragStateRef, hit!, currentSelection, selectedNodes, point);
        break;
      case !event.shiftKey && isPointInSelectedTextBounds(point, selectedNodes):
        armHitDrag(canvas, event, dispatch, selectionRefs.dragStateRef, selectedNodes[0], currentSelection, selectedNodes, point);
        break;
      case !event.shiftKey && isPointInGroupBounds(point, selectedNodes):
        armGroupBoundsDrag(canvas, event, selectionRefs.dragStateRef, currentSelection, point);
        break;
      case !event.shiftKey:
        armMarqueeDrag(canvas, event, dispatch, selectionRefs.marqueeStartRef, point);
        break;
      default:
        break;
    }
  }
};
