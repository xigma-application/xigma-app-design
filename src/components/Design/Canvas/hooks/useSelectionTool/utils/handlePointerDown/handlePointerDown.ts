import { RefObject } from 'react';

// store
import { setSelection } from 'store/design/slice';
import { selectOrderedNodes, selectSelectedIds, selectSelectedNodes, selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import {
  TCornerRadiusDragState,
  TDragState,
  TEndpointDragState,
  TPathOffsetDragState,
  TPolygonCornerRadiusDragState,
  TResizeDragState,
  TRotateDragState,
} from '../../types';
import { MouseButton } from 'types/enums';
import { TPoint } from 'types/canvas';

// utils
import { armCornerRadiusDrag } from './armCornerRadiusDrag';
import { armGroupBoundsDrag } from './armGroupBoundsDrag';
import { armHitDrag } from './armHitDrag';
import { armLineEndpointDrag } from './armLineEndpointDrag';
import { armMarqueeDrag } from './armMarqueeDrag';
import { armPathOffsetDrag } from './armPathOffsetDrag';
import { armPolygonCornerRadiusDrag } from './armPolygonCornerRadiusDrag';
import { armResizeDrag } from './armResizeDrag';
import { armRotateDrag } from './armRotateDrag';
import { getCornerRadiusHandleAtPoint } from '../../../../utils/getCornerRadiusHandleAtPoint';
import { getLineEndpointAtPoint } from '../../../../utils/getLineEndpointAtPoint';
import { getNodeAtPoint } from '../../../../utils/getNodeAtPoint';
import { getPathTextOffsetHandleAtPoint } from '../../../../utils/getPathTextOffsetHandleAtPoint';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getPolygonCornerRadiusHandleAtPoint } from '../../../../utils/getPolygonCornerRadiusHandleAtPoint';
import { getResizeHandleAtPoint } from '../../../../utils/getResizeHandleAtPoint';
import { getRotateHandleAtPoint } from '../../../../utils/getRotateHandleAtPoint';
import { isPointInGroupBounds } from '../isPointInGroupBounds';
import { isPointInSelectedTextBounds } from '../isPointInSelectedTextBounds';
import { screenToWorld } from '../../../../utils/screenToWorld';
import { toggleSelection } from '../toggleSelection';

export const handlePointerDown = (
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
  marqueeStartRef: RefObject<TPoint | null>,
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
    const cornerRadiusHandleHit = resizeHandleHit ? null : getCornerRadiusHandleAtPoint(point, selectedNodes, viewport);
    const polygonCornerRadiusHandleHit = resizeHandleHit ? null : getPolygonCornerRadiusHandleAtPoint(point, selectedNodes, viewport);

    switch (true) {
      case Boolean(pathOffsetHandleHit):
        armPathOffsetDrag(canvas, event, pathOffsetDragRef, pathOffsetHandleHit!.nodeId, setClassName);
        break;
      case Boolean(resizeHandleHit):
        armResizeDrag(canvas, event, resizeDragRef, selectedNodes, resizeHandleHit!.handle, resizeHandleHit!.bounds);
        break;
      case Boolean(cornerRadiusHandleHit):
        armCornerRadiusDrag(
          canvas,
          event,
          cornerRadiusDragRef,
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
          polygonCornerRadiusDragRef,
          polygonCornerRadiusHandleHit!.bounds,
          polygonCornerRadiusHandleHit!.nodeId,
          polygonCornerRadiusHandleHit!.rotation,
          polygonCornerRadiusHandleHit!.sides,
        );
        break;
      case Boolean(rotateHandleHit):
        armRotateDrag(canvas, event, rotateDragRef, selectedNodes, rotateHandleHit!.bounds, rotateHandleHit!.rotation, point);
        break;
      case Boolean(lineEndpointHit) && !event.shiftKey:
        armLineEndpointDrag(canvas, event, endpointDragRef, lineEndpointHit!.nodeId, lineEndpointHit!.endpoint);
        break;
      case Boolean(hit) && event.shiftKey:
        dispatch(setSelection(toggleSelection(currentSelection, hit!.id)));
        break;
      case Boolean(hit):
        armHitDrag(canvas, event, dispatch, dragStateRef, hit!, currentSelection, selectedNodes, point);
        break;
      case !event.shiftKey && isPointInSelectedTextBounds(point, selectedNodes):
        armHitDrag(canvas, event, dispatch, dragStateRef, selectedNodes[0], currentSelection, selectedNodes, point);
        break;
      case !event.shiftKey && isPointInGroupBounds(point, selectedNodes):
        armGroupBoundsDrag(canvas, event, dragStateRef, currentSelection, point);
        break;
      case !event.shiftKey:
        armMarqueeDrag(canvas, event, dispatch, marqueeStartRef, point);
        break;
      default:
        break;
    }
  }
};
