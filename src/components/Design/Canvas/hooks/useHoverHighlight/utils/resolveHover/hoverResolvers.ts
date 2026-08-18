// types
import { NodeType, ToolName } from 'types/design/enums';
import { THoverResolverContext, THoverResult } from './types';

// utils
import { getCollidesWithEditingText } from '../getCollidesWithEditingText';
import { getCornerRadiusHandleAtPoint } from '../../../../utils/getCornerRadiusHandleAtPoint';
import { getEllipseArcHandleAtPoint } from '../../../../utils/getEllipseArcHandleAtPoint';
import { getEllipseArcRatioHandleAtPoint } from '../../../../utils/getEllipseArcRatioHandleAtPoint';
import { getEllipseArcRotateHandleAtPoint } from '../../../../utils/getEllipseArcRotateHandleAtPoint';
import { getLineEndpointAtPoint } from '../../../../utils/getLineEndpointAtPoint';
import { getNodeAtPoint } from '../../../../utils/getNodeAtPoint';
import { getPathOffsetHandleHit } from '../getPathOffsetHandleHit';
import { getPolygonCornerRadiusHandleHit } from '../getPolygonCornerRadiusHandleHit';
import { getPolygonVertexCountHandleAtPoint } from '../../../../utils/getPolygonVertexCountHandleAtPoint';
import { getResizeCursorAngle } from 'utils/math/getResizeCursorAngle';
import { getRotateCursorAngle } from 'utils/math/getRotateCursorAngle';
import { getRotateHandleAtPoint } from '../../../../utils/getRotateHandleAtPoint';
import { getRotatedResizeCursorUrl } from 'utils/canvas/getRotatedResizeCursorUrl';
import { getRotatedRotateCursorUrl } from 'utils/canvas/getRotatedRotateCursorUrl';
import { getRotatedScaleCursorUrl } from 'utils/canvas/getRotatedScaleCursorUrl';
import { getStarCornerRadiusHandleHit } from '../getStarCornerRadiusHandleHit';
import { getStarRatioHandleAtPoint } from '../../../../utils/getStarRatioHandleAtPoint';
import { getStarVertexCountHandleAtPoint } from '../../../../utils/getStarVertexCountHandleAtPoint';

export const resolveLineEndpointHover = ({ point, resizableSelectedNodes, viewport }: THoverResolverContext): THoverResult | undefined => {
  const [selectedNode] = resizableSelectedNodes;
  const lineEndpointHit = getLineEndpointAtPoint(point, resizableSelectedNodes, viewport);

  if (lineEndpointHit && selectedNode.type === NodeType.line) {
    return { className: 'positioning', cursor: '', nodeId: lineEndpointHit.nodeId };
  }
};

export const resolvePathOffsetHover = ({
  point,
  editingTextBox,
  editingNodeId,
  selectedNodes,
  viewport,
}: THoverResolverContext): THoverResult | undefined => {
  const pathOffsetHandleHit = getPathOffsetHandleHit(point, editingTextBox, editingNodeId, selectedNodes, viewport);

  if (pathOffsetHandleHit.hit) {
    return { className: 'hand', cursor: '', nodeId: pathOffsetHandleHit.nodeId };
  }
};

export const resolveEditingTextHover = ({
  point,
  editingTextBox,
  editingContent,
  viewport,
}: THoverResolverContext): THoverResult | undefined => {
  if (getCollidesWithEditingText(editingTextBox, editingContent, point, viewport.zoom)) {
    return { className: null, cursor: 'text', nodeId: null };
  }
};

export const resolvePolygonVertexHover = ({ point, resizableSelectedNodes, viewport }: THoverResolverContext): THoverResult | undefined => {
  const polygonVertexCountHandleHit = getPolygonVertexCountHandleAtPoint(point, resizableSelectedNodes, viewport);

  if (polygonVertexCountHandleHit) {
    return { className: 'vertices', cursor: '', nodeId: polygonVertexCountHandleHit.nodeId };
  }
};

export const resolveStarVertexHover = ({ point, resizableSelectedNodes, viewport }: THoverResolverContext): THoverResult | undefined => {
  const starVertexCountHandleHit = getStarVertexCountHandleAtPoint(point, resizableSelectedNodes, viewport);

  if (starVertexCountHandleHit) {
    return { className: 'vertices', cursor: '', nodeId: starVertexCountHandleHit.nodeId };
  }
};

export const resolveStarRatioHover = ({ point, resizableSelectedNodes, viewport }: THoverResolverContext): THoverResult | undefined => {
  const starRatioHandleHit = getStarRatioHandleAtPoint(point, resizableSelectedNodes, viewport);

  if (starRatioHandleHit) {
    return { className: 'ratio', cursor: '', nodeId: starRatioHandleHit.nodeId };
  }
};

export const resolveEllipseArcHover = ({ point, resizableSelectedNodes, viewport }: THoverResolverContext): THoverResult | undefined => {
  const ellipseArcHandleHit = getEllipseArcHandleAtPoint(point, resizableSelectedNodes, viewport);

  if (ellipseArcHandleHit) {
    return { className: 'radius', cursor: '', nodeId: ellipseArcHandleHit.nodeId };
  }

  const ellipseArcRotateHandleHit = getEllipseArcRotateHandleAtPoint(point, resizableSelectedNodes, viewport);

  if (ellipseArcRotateHandleHit) {
    return { className: 'radius', cursor: '', nodeId: ellipseArcRotateHandleHit.nodeId };
  }

  const ellipseArcRatioHandleHit = getEllipseArcRatioHandleAtPoint(point, resizableSelectedNodes, viewport);

  if (ellipseArcRatioHandleHit) {
    return { className: 'radius', cursor: '', nodeId: ellipseArcRatioHandleHit.nodeId };
  }
};

export const resolveResizeHover = ({ resizeHandleHit, activeTool }: THoverResolverContext): THoverResult | undefined => {
  if (resizeHandleHit) {
    const getCursorUrl = activeTool === ToolName.scale ? getRotatedScaleCursorUrl : getRotatedResizeCursorUrl;
    const cursor = getCursorUrl(getResizeCursorAngle(resizeHandleHit.handle, resizeHandleHit.rotation)) ?? '';

    return { className: null, cursor, nodeId: null };
  }
};

export const resolveCornerRadiusHover = ({
  point,
  resizableSelectedNodes,
  viewport,
  resizeHandleHit,
}: THoverResolverContext): THoverResult | undefined => {
  const cornerRadiusHandleHit = getCornerRadiusHandleAtPoint(point, resizableSelectedNodes, viewport);

  if (cornerRadiusHandleHit) {
    return { className: 'radius', cursor: '', nodeId: cornerRadiusHandleHit.nodeId };
  }

  const polygonCornerRadiusHandleHit = getPolygonCornerRadiusHandleHit(point, resizeHandleHit, resizableSelectedNodes, viewport);

  if (polygonCornerRadiusHandleHit) {
    return { className: 'radius', cursor: '', nodeId: polygonCornerRadiusHandleHit.nodeId };
  }

  const starCornerRadiusHandleHit = getStarCornerRadiusHandleHit(point, resizeHandleHit, resizableSelectedNodes, viewport);

  if (starCornerRadiusHandleHit) {
    return { className: 'radius', cursor: '', nodeId: starCornerRadiusHandleHit.nodeId };
  }
};

export const resolveRotateHover = ({ point, resizableSelectedNodes, viewport }: THoverResolverContext): THoverResult | undefined => {
  const rotateHandleHit = getRotateHandleAtPoint(point, resizableSelectedNodes, viewport);

  if (rotateHandleHit) {
    const cursor = getRotatedRotateCursorUrl(getRotateCursorAngle(point, rotateHandleHit.bounds, rotateHandleHit.rotation)) ?? '';

    return { className: null, cursor, nodeId: null };
  }
};

export const resolvePlainNodeHover = ({ point, orderedNodes, viewport }: THoverResolverContext): THoverResult => {
  const hit = getNodeAtPoint(point, orderedNodes, viewport);

  return { className: null, cursor: '', nodeId: hit?.id ?? null };
};
