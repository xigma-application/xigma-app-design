// store
import { setSelection } from 'store/design/slice';

// types
import { TArmContext } from './types';

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
import { getPathTextOffsetHandleAtPoint } from '../../../../utils/getPathTextOffsetHandleAtPoint';
import { getPolygonCornerRadiusHandleAtPoint } from '../../../../utils/getPolygonCornerRadiusHandleAtPoint';
import { getPolygonVertexCountHandleAtPoint } from '../../../../utils/getPolygonVertexCountHandleAtPoint';
import { getResizeHandleAtPoint } from '../../../../utils/getResizeHandleAtPoint';
import { getRotateHandleAtPoint } from '../../../../utils/getRotateHandleAtPoint';
import { getStarCornerRadiusHandleAtPoint } from '../../../../utils/getStarCornerRadiusHandleAtPoint';
import { getStarVertexCountHandleAtPoint } from '../../../../utils/getStarVertexCountHandleAtPoint';
import { isPointInGroupBounds } from '../isPointInGroupBounds';
import { isPointInSelectedTextBounds } from '../isPointInSelectedTextBounds';
import { toggleSelection } from '../toggleSelection';

export const armPathOffsetOnPointerDown = ({
  canvas,
  event,
  point,
  selectedNodes,
  selectionRefs,
  setClassName,
  viewport,
}: TArmContext): true | undefined => {
  const pathOffsetHandleHit = getPathTextOffsetHandleAtPoint(point, selectedNodes, viewport);

  if (pathOffsetHandleHit) {
    armPathOffsetDrag(canvas, event, selectionRefs.pathOffsetDragRef, pathOffsetHandleHit.nodeId, setClassName);

    return true;
  }
};

export const armPolygonVertexCountOnPointerDown = ({
  canvas,
  event,
  point,
  selectedNodes,
  selectionRefs,
  viewport,
}: TArmContext): true | undefined => {
  const polygonVertexCountHandleHit = getPolygonVertexCountHandleAtPoint(point, selectedNodes, viewport);

  if (polygonVertexCountHandleHit) {
    armPolygonVertexCountDrag(
      canvas,
      event,
      selectionRefs.polygonVertexCountDragRef,
      polygonVertexCountHandleHit.bounds,
      polygonVertexCountHandleHit.nodeId,
      polygonVertexCountHandleHit.rotation,
      polygonVertexCountHandleHit.flipX,
      polygonVertexCountHandleHit.flipY,
    );

    return true;
  }
};

export const armStarVertexCountOnPointerDown = ({
  canvas,
  event,
  point,
  selectedNodes,
  selectionRefs,
  viewport,
}: TArmContext): true | undefined => {
  const starVertexCountHandleHit = getStarVertexCountHandleAtPoint(point, selectedNodes, viewport);

  if (starVertexCountHandleHit) {
    armStarVertexCountDrag(
      canvas,
      event,
      selectionRefs.starVertexCountDragRef,
      starVertexCountHandleHit.bounds,
      starVertexCountHandleHit.nodeId,
      starVertexCountHandleHit.rotation,
      starVertexCountHandleHit.flipX,
      starVertexCountHandleHit.flipY,
    );

    return true;
  }
};

export const armEllipseArcOnPointerDown = ({
  canvas,
  canvasRefs,
  event,
  point,
  selectedNodes,
  viewport,
}: TArmContext): true | undefined => {
  const ellipseArcHandleHit = getEllipseArcHandleAtPoint(point, selectedNodes, viewport);

  if (ellipseArcHandleHit) {
    armEllipseArcDrag(
      canvas,
      event,
      canvasRefs.ellipseArcDragRef,
      ellipseArcHandleHit.bounds,
      ellipseArcHandleHit.nodeId,
      ellipseArcHandleHit.rotation,
      ellipseArcHandleHit.flipX,
      ellipseArcHandleHit.flipY,
    );

    return true;
  }
};

export const armEllipseArcRotateOnPointerDown = ({
  canvas,
  canvasRefs,
  event,
  point,
  selectedNodes,
  viewport,
}: TArmContext): true | undefined => {
  const ellipseArcRotateHandleHit = getEllipseArcRotateHandleAtPoint(point, selectedNodes, viewport);

  if (ellipseArcRotateHandleHit) {
    armEllipseArcRotateDrag(
      canvas,
      event,
      canvasRefs.ellipseArcRotateDragRef,
      ellipseArcRotateHandleHit.bounds,
      ellipseArcRotateHandleHit.nodeId,
      ellipseArcRotateHandleHit.rotation,
      ellipseArcRotateHandleHit.flipX,
      ellipseArcRotateHandleHit.flipY,
    );

    return true;
  }
};

export const armEllipseArcRatioOnPointerDown = ({
  canvas,
  canvasRefs,
  event,
  point,
  selectedNodes,
  viewport,
}: TArmContext): true | undefined => {
  const ellipseArcRatioHandleHit = getEllipseArcRatioHandleAtPoint(point, selectedNodes, viewport);

  if (ellipseArcRatioHandleHit) {
    armEllipseArcRatioDrag(
      canvas,
      event,
      canvasRefs.ellipseArcRatioDragRef,
      ellipseArcRatioHandleHit.bounds,
      ellipseArcRatioHandleHit.nodeId,
      ellipseArcRatioHandleHit.rotation,
      ellipseArcRatioHandleHit.flipX,
      ellipseArcRatioHandleHit.flipY,
    );

    return true;
  }
};

export const armResizeOnPointerDown = ({ canvas, event, point, selectedNodes, selectionRefs, viewport }: TArmContext): true | undefined => {
  const resizeHandleHit = getResizeHandleAtPoint(point, selectedNodes, viewport);

  if (resizeHandleHit) {
    armResizeDrag(canvas, event, selectionRefs.resizeDragRef, selectedNodes, resizeHandleHit.handle, resizeHandleHit.bounds);

    return true;
  }
};

export const armCornerRadiusOnPointerDown = ({
  canvas,
  canvasRefs,
  event,
  point,
  selectedNodes,
  viewport,
}: TArmContext): true | undefined => {
  const cornerRadiusHandleHit = getCornerRadiusHandleAtPoint(point, selectedNodes, viewport);

  if (cornerRadiusHandleHit) {
    armCornerRadiusDrag(
      canvas,
      event,
      canvasRefs.cornerRadiusDragRef,
      cornerRadiusHandleHit.bounds,
      cornerRadiusHandleHit.corners,
      cornerRadiusHandleHit.nodeId,
      cornerRadiusHandleHit.rotation,
      point,
    );

    return true;
  }
};

export const armPolygonCornerRadiusOnPointerDown = ({
  canvas,
  canvasRefs,
  event,
  point,
  selectedNodes,
  viewport,
}: TArmContext): true | undefined => {
  const polygonCornerRadiusHandleHit = getPolygonCornerRadiusHandleAtPoint(point, selectedNodes, viewport);

  if (polygonCornerRadiusHandleHit) {
    armPolygonCornerRadiusDrag(
      canvas,
      event,
      canvasRefs.polygonCornerRadiusDragRef,
      polygonCornerRadiusHandleHit.bounds,
      polygonCornerRadiusHandleHit.nodeId,
      polygonCornerRadiusHandleHit.rotation,
      polygonCornerRadiusHandleHit.sides,
      polygonCornerRadiusHandleHit.flipX,
      polygonCornerRadiusHandleHit.flipY,
    );

    return true;
  }
};

export const armStarCornerRadiusOnPointerDown = ({
  canvas,
  canvasRefs,
  event,
  point,
  selectedNodes,
  viewport,
}: TArmContext): true | undefined => {
  const starCornerRadiusHandleHit = getStarCornerRadiusHandleAtPoint(point, selectedNodes, viewport);

  if (starCornerRadiusHandleHit) {
    armStarCornerRadiusDrag(
      canvas,
      event,
      canvasRefs.starCornerRadiusDragRef,
      starCornerRadiusHandleHit.bounds,
      starCornerRadiusHandleHit.nodeId,
      starCornerRadiusHandleHit.rotation,
      starCornerRadiusHandleHit.points,
      starCornerRadiusHandleHit.ratio,
      starCornerRadiusHandleHit.flipX,
      starCornerRadiusHandleHit.flipY,
    );

    return true;
  }
};

export const armRotateOnPointerDown = ({ canvas, event, point, selectedNodes, selectionRefs, viewport }: TArmContext): true | undefined => {
  const rotateHandleHit = getRotateHandleAtPoint(point, selectedNodes, viewport);

  if (rotateHandleHit) {
    armRotateDrag(canvas, event, selectionRefs.rotateDragRef, selectedNodes, rotateHandleHit.bounds, rotateHandleHit.rotation, point);

    return true;
  }
};

export const armLineEndpointOnPointerDown = ({
  canvas,
  event,
  point,
  selectedNodes,
  selectionRefs,
  viewport,
}: TArmContext): true | undefined => {
  const lineEndpointHit = getLineEndpointAtPoint(point, selectedNodes, viewport);

  if (lineEndpointHit && !event.shiftKey) {
    armLineEndpointDrag(canvas, event, selectionRefs.endpointDragRef, lineEndpointHit.nodeId, lineEndpointHit.endpoint);

    return true;
  }
};

export const toggleSelectionOnPointerDown = ({ currentSelection, dispatch, event, hit }: TArmContext): true | undefined => {
  if (hit && event.shiftKey) {
    dispatch(setSelection(toggleSelection(currentSelection, hit.id)));

    return true;
  }
};

export const armHitOnPointerDown = ({
  canvas,
  currentSelection,
  dispatch,
  event,
  hit,
  point,
  selectedNodes,
  selectionRefs,
}: TArmContext): true | undefined => {
  if (hit) {
    armHitDrag(canvas, event, dispatch, selectionRefs.dragStateRef, hit, currentSelection, selectedNodes, point);

    return true;
  }
};

export const armSelectedTextBoundsOnPointerDown = ({
  canvas,
  currentSelection,
  dispatch,
  event,
  point,
  selectedNodes,
  selectionRefs,
}: TArmContext): true | undefined => {
  if (!event.shiftKey && isPointInSelectedTextBounds(point, selectedNodes)) {
    armHitDrag(canvas, event, dispatch, selectionRefs.dragStateRef, selectedNodes[0], currentSelection, selectedNodes, point);

    return true;
  }
};

export const armGroupBoundsOnPointerDown = ({
  canvas,
  currentSelection,
  event,
  point,
  selectedNodes,
  selectionRefs,
}: TArmContext): true | undefined => {
  if (!event.shiftKey && isPointInGroupBounds(point, selectedNodes)) {
    armGroupBoundsDrag(canvas, event, selectionRefs.dragStateRef, currentSelection, point);

    return true;
  }
};

export const armMarqueeOnPointerDown = ({ canvas, dispatch, event, point, selectionRefs }: TArmContext): true | undefined => {
  if (!event.shiftKey) {
    armMarqueeDrag(canvas, event, dispatch, selectionRefs.marqueeStartRef, point);

    return true;
  }
};
