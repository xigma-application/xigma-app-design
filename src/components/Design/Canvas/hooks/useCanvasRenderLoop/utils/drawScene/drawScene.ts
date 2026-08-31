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
import { TDrawSceneContext } from './types';
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
  const pathOutlineStyles = getPathOutlineStyles(valuesNodeByid, selectedIds, editingNodeId, hoveredNode?.id ?? null, pathId);
  const editingTextContent = selectEditingTextContent(state);
  const selectionStart = selectEditingSelectionStart(state);
  const selectionEnd = selectEditingSelectionEnd(state);
  const selectionChangedAt = selectEditingSelectionChangedAt(state);
  const vertexDotBufferCache = imageContext.vertexDotBufferCache;
  const ctx: TDrawSceneContext = {
    buffer,
    gl,
    imageContext,
    program,
    viewport,
  };

  drawSceneBackground(gl);
  drawPixelGrid(gl, imageContext.gridProgram, imageContext.gridBuffer, clientWidth, clientHeight, viewport);
  drawSceneNodes(ctx, sceneNodes, clientWidth, clientHeight, pathOutlineStyles, refs, nodesById, pathId);
  drawHoverOutline(ctx, hoveredNode, clientWidth, clientHeight, vectorEditingNodeIds, nodesById);
  drawSelectionOutline(ctx, selectedNodes, clientWidth, clientHeight, vectorEditingNodeIds, nodesById, pathId);
  drawSelectionSizeLabel(ctx, selectedNodes, clientWidth, clientHeight, vectorEditingNodeIds, pathId);
  drawFrameNameLabels(ctx, filteredNodes, selectedIds, refs, clientWidth, clientHeight);
  drawSectionNameLabels(ctx, filteredNodes, refs, clientWidth, clientHeight);
  drawCornerRadiusHandlesLayer(ctx, hoveredNode, selectedNodes, refs, clientWidth, clientHeight);
  drawVertexCountHandlesLayer(ctx, hoveredNode, selectedNodes, clientWidth, clientHeight);
  drawStarRatioHandleLayer(ctx, hoveredNode, selectedNodes, clientWidth, clientHeight);
  drawVectorEditHandlesLayer(
    ctx,
    vertexDotBufferCache,
    eraseAwareNodesById,
    vectorEditingNodeIds,
    refs,
    penActiveVertexId,
    clientWidth,
    clientHeight,
  );
  drawEllipseArcHandleLayer(ctx, hoveredNode, selectedNodes, refs, clientWidth, clientHeight);
  drawFrame(ctx, refs, clientWidth, clientHeight);
  drawDraftFrameNameLabel(ctx, refs, nodesById, clientWidth, clientHeight);
  drawDraftSectionNameLabel(ctx, refs, nodesById, clientWidth, clientHeight);
  drawPenPreview(ctx, refs, nodesById, vectorEditingNodeIds[0] ?? null, clientWidth, clientHeight);
  drawPencilPreview(ctx, refs, clientWidth, clientHeight);
  drawEditingText(
    ctx,
    editingTextBox,
    editingTextContent,
    selectionStart,
    selectionEnd,
    selectionChangedAt,
    clientWidth,
    clientHeight,
    editingPathNode,
  );
  drawEditingPathTextHandle(ctx, editingTextBox, clientWidth, clientHeight, editingPathNode);
  drawVectorEditAlignmentGuide(ctx, refs, clientWidth, clientHeight);
  drawTransformAlignmentGuide(ctx, refs, clientWidth, clientHeight);
  drawVectorLasso(ctx, refs, clientWidth, clientHeight);
  drawVectorShapeBuilderPath(ctx, refs, clientWidth, clientHeight);
  drawVectorShapeBuilderHoverPreview(
    ctx,
    nodesById,
    rootOrder,
    vectorEditingNodeIds,
    shapeBuilderPreviewFaces,
    refs,
    clientWidth,
    clientHeight,
  );
  drawVectorPaintHoverPreview(ctx, nodesById, refs, clientWidth, clientHeight);
  drawVectorPaintTouchedFacesPreview(ctx, nodesById, refs, clientWidth, clientHeight);
  drawVectorPaintPath(ctx, refs, clientWidth, clientHeight);
  drawVectorFaceSelectHoverPreview(ctx, nodesById, refs, clientWidth, clientHeight);
  drawVectorDraggedFillPreview(ctx, nodesById, refs, clientWidth, clientHeight);
  drawVectorSelectedFillPreview(ctx, nodesById, vectorEditingNodeIds, refs, clientWidth, clientHeight);
  drawVectorCutHoverPreview(ctx, nodesById, refs, clientWidth, clientHeight);
  drawVectorCutPreview(ctx, refs, clientWidth, clientHeight);
  drawVectorEraseBrush(ctx, refs, activeTool, clientWidth, clientHeight);
  drawVectorWidthPointsPreview(ctx, nodesById, vectorEditingNodeIds, refs, activeTool, clientWidth, clientHeight);
  drawMarquee(gl, program, buffer, marqueeRect, clientWidth, clientHeight, viewport);
  drawSliceDraft(gl, program, buffer, sliceRect, clientWidth, clientHeight, viewport);
  drawShapeContactGuides(ctx, refs, clientWidth, clientHeight);
};
