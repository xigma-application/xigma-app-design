// store
import {
  selectActiveTool,
  selectEditingNodeId,
  selectEditingSelectionChangedAt,
  selectEditingSelectionEnd,
  selectEditingSelectionStart,
  selectEditingTextBox,
  selectEditingTextContent,
  selectNodes,
  selectPenActiveVertexId,
  selectRenderOrderedNodes,
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
import { drawDraftFrameNameLabel } from './drawFrameNameLabels/drawDraftFrameNameLabel';
import { drawDraftSectionNameLabel } from './drawSectionNameLabels/drawDraftSectionNameLabel';
import { drawEditingPathTextHandle } from './drawEditingPathTextHandle';
import { drawEditingText } from './drawEditingText';
import { drawEllipseArcHandleLayer } from './drawEllipseArcHandleLayer/drawEllipseArcHandleLayer';
import { drawFrame } from './drawFrame';
import { drawFrameNameLabels } from './drawFrameNameLabels/drawFrameNameLabels';
import { drawHoverOutline } from './drawHoverOutline';
import { drawMarquee } from 'utils/canvas/drawMarquee';
import { drawPencilPreview } from './drawPencilPreview/drawPencilPreview';
import { drawPenPreview } from './drawPenPreview/drawPenPreview';
import { drawPixelGrid } from 'utils/canvas/drawPixelGrid';
import { drawSceneBackground } from 'utils/canvas/drawSceneBackground';
import { drawSceneNodes } from './drawSceneNodes';
import { drawSectionNameLabels } from './drawSectionNameLabels/drawSectionNameLabels';
import { drawSelectionOutline } from './drawSelectionOutline';
import { drawSelectionSizeLabel } from './drawSelectionSizeLabel';
import { drawShapeContactGuides } from './drawShapeContactGuides';
import { drawSliceDraft } from 'utils/canvas/drawSliceDraft';
import { drawStarRatioHandleLayer } from './drawStarRatioHandleLayer';
import { drawTransformAlignmentGuide } from './drawTransformAlignmentGuide';
import { drawVectorDraggedFillPreview } from './drawVectorDraggedFillPreview';
import { drawVectorEditAlignmentGuide } from './drawVectorEditAlignmentGuide';
import { drawVectorEditHandlesLayer } from './drawVectorEditHandlesLayer/drawVectorEditHandlesLayer/drawVectorEditHandlesLayer';
import { drawVectorFaceSelectHoverPreview } from './drawVectorFaceSelectHoverPreview';
import { drawVectorLasso } from './drawVectorLasso';
import { drawVectorCutHoverPreview } from './drawVectorCutHoverPreview';
import { drawVectorCutPreview } from './drawVectorCutPreview';
import { drawVectorEraseBrush } from './drawVectorEraseBrush';
import { drawVectorPaintHoverPreview } from './drawVectorPaintHoverPreview';
import { drawVectorPaintPath } from './drawVectorPaintPath';
import { drawVectorPaintTouchedFacesPreview } from './drawVectorPaintTouchedFacesPreview';
import { drawVectorSelectedFillPreview } from './drawVectorSelectedFillPreview';
import { drawVectorShapeBuilderHoverPreview } from './drawVectorShapeBuilderHoverPreview';
import { drawVectorShapeBuilderPath } from './drawVectorShapeBuilderPath';
import { drawVectorWidthPointsPreview } from './drawVectorWidthPointsPreview/drawVectorWidthPointsPreview';
import { drawVertexCountHandlesLayer } from './drawVertexCountHandlesLayer';
import { getEraseAwareNodesById } from './getEraseAwareNodesById';
import { getErasePreviewNodes } from './getErasePreviewNodes';
import { getPathOutlineStyles } from './getPathOutlineStyles';
import { getPreviewSceneNodes } from './getPreviewSceneNodes';
import { getShapeBuilderPreviewFaces } from './getShapeBuilderPreviewFaces';
import { getVisibleHoveredNode } from './getVisibleHoveredNode';
import { getVisibleSelectedNodes } from './getVisibleSelectedNodes';

export const drawScene = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  imageContext: TImageRenderContext,
  canvas: HTMLCanvasElement,
  refs: TCanvasRefs,
): void => {
  const marqueeRect = refs.lassoMarquee.marqueeRef.current;
  const hoveredNodeId = refs.hover.hoverRef.current;
  const sliceRect = refs.slice.sliceRef.current;
  const state = store.getState();
  const activeTool = selectActiveTool(state);
  const viewport = selectViewport(state);
  const { clientHeight, clientWidth } = canvas;
  const editingNodeId = selectEditingNodeId(state);
  const editingTextBox = selectEditingTextBox(state);
  const nodesById = selectNodes(state);
  const vectorEditingNodeIds = selectVectorEditingNodeIds(state);
  const shapeBuilderPreviewFaces = getShapeBuilderPreviewFaces(refs);
  const penActiveVertexId = selectPenActiveVertexId(state);
  const filteredNodes = selectRenderOrderedNodes(state).filter((node) => !node.hidden);
  const previewSceneNodes = getPreviewSceneNodes(filteredNodes, editingNodeId, refs);
  const sceneNodes = getErasePreviewNodes(previewSceneNodes, vectorEditingNodeIds, activeTool, refs, viewport);
  const eraseAwareNodesById = getEraseAwareNodesById(nodesById, sceneNodes, vectorEditingNodeIds, activeTool);
  const allSelectedNodes = selectSelectedNodes(state);
  const selectedNodes = getVisibleSelectedNodes(allSelectedNodes, editingNodeId, refs);
  const selectedIds = new Set(allSelectedNodes.map((node) => node.id));
  const hoveredNode = getVisibleHoveredNode(nodesById, hoveredNodeId, editingNodeId, refs);
  const valuesNodeByid = Object.values(nodesById);
  const editingPathNode = editingTextBox?.pathId ? nodesById[editingTextBox.pathId] : undefined;
  const rootOrder = state.design.pages[state.design.activePageId].rootOrder;
  const pathId = editingTextBox?.pathId;

  drawSceneBackground(gl);
  drawPixelGrid(gl, imageContext.gridProgram, imageContext.gridBuffer, clientWidth, clientHeight, viewport);
  drawSceneNodes(
    gl,
    program,
    buffer,
    imageContext,
    sceneNodes,
    clientWidth,
    clientHeight,
    viewport,
    getPathOutlineStyles(valuesNodeByid, selectedIds, editingNodeId, hoveredNode?.id ?? null, pathId),
    refs,
    nodesById,
    pathId,
  );
  drawHoverOutline(gl, program, buffer, hoveredNode, clientWidth, clientHeight, viewport, vectorEditingNodeIds, nodesById);
  drawSelectionOutline(gl, program, buffer, selectedNodes, clientWidth, clientHeight, viewport, vectorEditingNodeIds, nodesById, pathId);
  drawSelectionSizeLabel(
    gl,
    program,
    buffer,
    imageContext,
    selectedNodes,
    clientWidth,
    clientHeight,
    viewport,
    vectorEditingNodeIds,
    pathId,
  );
  drawFrameNameLabels(gl, imageContext, filteredNodes, selectedIds, refs, clientWidth, clientHeight, viewport);
  drawSectionNameLabels(gl, program, buffer, imageContext, filteredNodes, refs, clientWidth, clientHeight, viewport);
  drawCornerRadiusHandlesLayer(gl, program, buffer, hoveredNode, selectedNodes, refs, clientWidth, clientHeight, viewport);
  drawVertexCountHandlesLayer(gl, program, buffer, hoveredNode, selectedNodes, clientWidth, clientHeight, viewport);
  drawStarRatioHandleLayer(gl, program, buffer, hoveredNode, selectedNodes, clientWidth, clientHeight, viewport);
  drawVectorEditHandlesLayer(
    gl,
    program,
    buffer,
    imageContext.vertexDotBufferCache,
    eraseAwareNodesById,
    vectorEditingNodeIds,
    refs,
    penActiveVertexId,
    clientWidth,
    clientHeight,
    viewport,
  );
  drawEllipseArcHandleLayer(gl, program, buffer, hoveredNode, selectedNodes, refs, clientWidth, clientHeight, viewport);
  drawFrame(gl, program, buffer, imageContext, refs, clientWidth, clientHeight, viewport);
  drawDraftFrameNameLabel(gl, imageContext, refs, nodesById, clientWidth, clientHeight, viewport);
  drawDraftSectionNameLabel(gl, program, buffer, imageContext, refs, nodesById, clientWidth, clientHeight, viewport);
  drawPenPreview(gl, program, buffer, refs, nodesById, vectorEditingNodeIds[0] ?? null, clientWidth, clientHeight, viewport);
  drawPencilPreview(gl, program, buffer, refs, clientWidth, clientHeight, viewport);
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
    editingPathNode,
  );
  drawEditingPathTextHandle(gl, program, buffer, editingTextBox, clientWidth, clientHeight, viewport, editingPathNode);
  drawVectorEditAlignmentGuide(gl, program, buffer, refs, clientWidth, clientHeight, viewport);
  drawTransformAlignmentGuide(gl, program, buffer, refs, clientWidth, clientHeight, viewport);
  drawVectorLasso(gl, program, buffer, refs, clientWidth, clientHeight, viewport);
  drawVectorShapeBuilderPath(gl, program, buffer, refs, clientWidth, clientHeight, viewport);
  drawVectorShapeBuilderHoverPreview(
    gl,
    program,
    buffer,
    nodesById,
    rootOrder,
    vectorEditingNodeIds,
    shapeBuilderPreviewFaces,
    refs,
    clientWidth,
    clientHeight,
    viewport,
  );
  drawVectorPaintHoverPreview(gl, program, buffer, nodesById, refs, clientWidth, clientHeight, viewport);
  drawVectorPaintTouchedFacesPreview(gl, program, buffer, nodesById, refs, clientWidth, clientHeight, viewport);
  drawVectorPaintPath(gl, program, buffer, refs, clientWidth, clientHeight, viewport);
  drawVectorFaceSelectHoverPreview(gl, program, buffer, nodesById, refs, clientWidth, clientHeight, viewport);
  drawVectorDraggedFillPreview(gl, program, buffer, nodesById, refs, clientWidth, clientHeight, viewport);
  drawVectorSelectedFillPreview(gl, program, buffer, nodesById, vectorEditingNodeIds, refs, clientWidth, clientHeight, viewport);
  drawVectorCutHoverPreview(gl, program, buffer, nodesById, refs, clientWidth, clientHeight, viewport);
  drawVectorCutPreview(gl, program, buffer, refs, clientWidth, clientHeight, viewport);
  drawVectorEraseBrush(gl, program, buffer, refs, activeTool, clientWidth, clientHeight, viewport);
  drawVectorWidthPointsPreview(
    gl,
    program,
    buffer,
    imageContext,
    nodesById,
    vectorEditingNodeIds,
    refs,
    activeTool,
    clientWidth,
    clientHeight,
    viewport,
  );
  drawMarquee(gl, program, buffer, marqueeRect, clientWidth, clientHeight, viewport);
  drawSliceDraft(gl, program, buffer, sliceRect, clientWidth, clientHeight, viewport);
  drawShapeContactGuides(gl, program, buffer, refs, clientWidth, clientHeight, viewport);
};
