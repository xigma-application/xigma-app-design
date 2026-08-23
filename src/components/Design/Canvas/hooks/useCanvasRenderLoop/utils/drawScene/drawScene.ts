// store
import {
  selectEditingNodeId,
  selectEditingSelectionChangedAt,
  selectEditingSelectionEnd,
  selectEditingSelectionStart,
  selectEditingTextBox,
  selectEditingTextContent,
  selectNodes,
  selectOrderedNodes,
  selectPenActiveVertexId,
  selectSelectedNodes,
  selectVectorEditingNodeIds,
  selectViewport,
} from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TImageRenderContext } from '../../types';

// utils
import { drawCornerRadiusHandlesLayer } from './drawCornerRadiusHandlesLayer';
import { drawEditingPathTextHandle } from './drawEditingPathTextHandle';
import { drawEditingText } from './drawEditingText';
import { drawEllipseArcHandleLayer } from './drawEllipseArcHandleLayer/drawEllipseArcHandleLayer';
import { drawFrame } from './drawFrame';
import { drawHoverOutline } from './drawHoverOutline';
import { drawMarquee } from 'utils/canvas/drawMarquee';
import { drawPenPreview } from './drawPenPreview/drawPenPreview';
import { drawPixelGrid } from 'utils/canvas/drawPixelGrid';
import { drawSceneBackground } from 'utils/canvas/drawSceneBackground';
import { drawSceneNodes } from './drawSceneNodes';
import { drawSelectionOutline } from './drawSelectionOutline';
import { drawSliceDraft } from 'utils/canvas/drawSliceDraft';
import { drawStarRatioHandleLayer } from './drawStarRatioHandleLayer';
import { drawVectorAlignmentGuide } from './drawVectorAlignmentGuide';
import { drawVectorDraggedFillPreview } from './drawVectorDraggedFillPreview';
import { drawVectorEditHandlesLayer } from './drawVectorEditHandlesLayer/drawVectorEditHandlesLayer/drawVectorEditHandlesLayer';
import { drawVectorLasso } from './drawVectorLasso';
import { drawVectorCutHoverPreview } from './drawVectorCutHoverPreview';
import { drawVectorCutPreview } from './drawVectorCutPreview';
import { drawVectorPaintHoverPreview } from './drawVectorPaintHoverPreview';
import { drawVertexCountHandlesLayer } from './drawVertexCountHandlesLayer';
import { getPathOutlineStyles } from './getPathOutlineStyles';
import { hasCornerRadiusDragMoved } from './hasCornerRadiusDragMoved';

export const drawScene = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  imageContext: TImageRenderContext,
  canvas: HTMLCanvasElement,
  refs: TCanvasRefs,
): void => {
  const draftShape = refs.draftRef.current;
  const marqueeRect = refs.marqueeRef.current;
  const hoveredNodeId = refs.hoverRef.current;
  const sliceRect = refs.sliceRef.current;
  const isDraggingCornerRadius = hasCornerRadiusDragMoved(refs);
  const ellipseArcDraggedHandlePosition = refs.ellipseArcDragRef.current?.draggedHandlePosition ?? null;
  const ellipseArcRotateDraggedHandlePosition = refs.ellipseArcRotateDragRef.current?.draggedHandlePosition ?? null;
  const ellipseArcRatioDraggedHandlePosition = refs.ellipseArcRatioDragRef.current?.draggedHandlePosition ?? null;
  const state = store.getState();
  const viewport = selectViewport(state);
  const { clientHeight, clientWidth } = canvas;
  const editingNodeId = selectEditingNodeId(state);
  const editingTextBox = selectEditingTextBox(state);
  const nodesById = selectNodes(state);
  const vectorEditingNodeIds = selectVectorEditingNodeIds(state);
  const hoveredVectorPaintFace = refs.hoveredVectorPaintFaceKeyRef.current;
  const selectedVectorVertexIds = refs.selectedVectorVertexIdsRef.current;
  const preMarqueeVectorVertexIds = refs.preVectorMarqueeVertexIdsRef.current;
  const selectedVectorSegmentIds = refs.selectedVectorSegmentIdsRef.current;
  const preMarqueeVectorSegmentIds = refs.preVectorMarqueeSegmentIdsRef.current;
  const hoveredVectorVertexId = refs.hoveredVectorVertexIdRef.current;
  const hoveredVectorHandle = refs.hoveredVectorHandleRef.current;
  const selectedVectorHandles = refs.selectedVectorHandlesRef.current;
  const hoveredSegmentId = refs.hoveredSegmentIdRef.current;
  const hoveredVectorSegmentId = refs.hoveredVectorSegmentIdRef.current;
  const hoveredVectorEdgeInsertPoint = refs.hoveredVectorEdgeInsertPointRef.current;
  const penActiveVertexId = selectPenActiveVertexId(state);
  const dragOriginVertexId = refs.penDragOriginRef.current?.vertexId ?? null;
  const penDraggedHandlePosition = refs.penDraggedHandlePositionRef.current;
  const isPenDraggedHandleSnapped = refs.penDraggedHandleIsSnappedRef.current;
  const snappedVectorHandle = refs.snappedVectorHandleRef.current;
  const vectorMultiSelectResizeDrag = refs.vectorMultiSelectResizeDragRef.current;
  const vectorMultiSelectRotateDrag = refs.vectorMultiSelectRotateDragRef.current;
  const isVectorMultiDragMoving = Boolean(refs.vectorMultiDragRef.current?.hasMoved);
  const sceneNodes = selectOrderedNodes(state).filter((node) => node.id !== editingNodeId);
  const allSelectedNodes = selectSelectedNodes(state);
  const selectedNodes = allSelectedNodes.filter((node) => node.id !== editingNodeId);
  const hoveredNode = hoveredNodeId && hoveredNodeId !== editingNodeId ? nodesById[hoveredNodeId] : null;
  const selectedIds = new Set(allSelectedNodes.map((node) => node.id));
  const pathOutlineStyles = getPathOutlineStyles(
    Object.values(nodesById),
    selectedIds,
    editingNodeId,
    hoveredNode?.id ?? null,
    editingTextBox?.pathId,
  );

  drawSceneBackground(gl);
  drawPixelGrid(gl, imageContext.gridProgram, imageContext.gridBuffer, clientWidth, clientHeight, viewport);
  drawSceneNodes(gl, program, buffer, imageContext, sceneNodes, clientWidth, clientHeight, viewport, pathOutlineStyles);
  drawHoverOutline(gl, program, buffer, hoveredNode, clientWidth, clientHeight, viewport, vectorEditingNodeIds);
  drawSelectionOutline(gl, program, buffer, selectedNodes, clientWidth, clientHeight, viewport, vectorEditingNodeIds);
  drawCornerRadiusHandlesLayer(
    gl,
    program,
    buffer,
    hoveredNode,
    selectedNodes,
    clientWidth,
    clientHeight,
    viewport,
    isDraggingCornerRadius,
  );
  drawVertexCountHandlesLayer(gl, program, buffer, hoveredNode, selectedNodes, clientWidth, clientHeight, viewport);
  drawStarRatioHandleLayer(gl, program, buffer, hoveredNode, selectedNodes, clientWidth, clientHeight, viewport);
  drawVectorEditHandlesLayer(
    gl,
    program,
    buffer,
    nodesById,
    vectorEditingNodeIds,
    selectedVectorVertexIds,
    preMarqueeVectorVertexIds,
    selectedVectorSegmentIds,
    preMarqueeVectorSegmentIds,
    hoveredVectorVertexId,
    refs.newVectorCutVertexIdsRef.current,
    hoveredSegmentId,
    hoveredVectorSegmentId,
    hoveredVectorEdgeInsertPoint,
    hoveredVectorHandle,
    selectedVectorHandles,
    snappedVectorHandle,
    penActiveVertexId,
    dragOriginVertexId,
    penDraggedHandlePosition,
    isPenDraggedHandleSnapped,
    refs.vectorMultiSelectBoxRef,
    vectorMultiSelectResizeDrag,
    vectorMultiSelectRotateDrag,
    isVectorMultiDragMoving,
    clientWidth,
    clientHeight,
    viewport,
  );
  drawEllipseArcHandleLayer(
    gl,
    program,
    buffer,
    hoveredNode,
    selectedNodes,
    clientWidth,
    clientHeight,
    viewport,
    ellipseArcDraggedHandlePosition,
    ellipseArcRotateDraggedHandlePosition,
    ellipseArcRatioDraggedHandlePosition,
  );
  drawFrame(gl, program, buffer, imageContext, draftShape, clientWidth, clientHeight, viewport);
  drawPenPreview(
    gl,
    program,
    buffer,
    refs.penPreviewRef.current,
    refs.penNewVertexPreviewRef.current,
    refs.penHoveredDragArmableVertexRef.current,
    nodesById,
    vectorEditingNodeIds[0] ?? null,
    clientWidth,
    clientHeight,
    viewport,
  );
  drawEditingText(
    gl,
    program,
    buffer,
    imageContext,
    editingTextBox,
    selectEditingTextContent(state),
    selectEditingSelectionStart(state),
    selectEditingSelectionEnd(state),
    selectEditingSelectionChangedAt(state),
    clientWidth,
    clientHeight,
    viewport,
  );
  drawEditingPathTextHandle(gl, program, buffer, editingTextBox, clientWidth, clientHeight, viewport);
  drawVectorAlignmentGuide(gl, program, buffer, refs.vectorAlignmentGuideRef.current, clientWidth, clientHeight, viewport);
  drawVectorLasso(gl, program, buffer, refs.vectorLassoPathRef.current, clientWidth, clientHeight, viewport);
  drawVectorPaintHoverPreview(gl, program, buffer, nodesById, hoveredVectorPaintFace, clientWidth, clientHeight, viewport);
  drawVectorDraggedFillPreview(gl, program, buffer, nodesById, refs.draggedVectorFillFacesRef.current, clientWidth, clientHeight, viewport);
  drawVectorCutHoverPreview(
    gl,
    program,
    buffer,
    nodesById,
    refs.hoveredVectorCutSegmentRef.current,
    refs.hoveredVectorCutPointRef.current,
    clientWidth,
    clientHeight,
    viewport,
  );
  drawVectorCutPreview(gl, program, buffer, refs.vectorCutPreviewRef.current, clientWidth, clientHeight, viewport);
  drawMarquee(gl, program, buffer, marqueeRect, clientWidth, clientHeight, viewport);
  drawSliceDraft(gl, program, buffer, sliceRect, clientWidth, clientHeight, viewport);
};
