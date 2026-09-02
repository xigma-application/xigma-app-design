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
import { drawCornerRadiusHandlesLayer } from './drawCornerRadiusHandlesLayer/drawCornerRadiusHandlesLayer';
import { drawDraftFrameNameLabel } from './drawFrameNameLabels/drawDraftFrameNameLabel';
import { drawDistanceGuides } from './drawDistanceGuides/drawDistanceGuides';
import { drawDraftSectionNameLabel } from './drawSectionNameLabels/drawDraftSectionNameLabel';
import { drawDraftSizeLabel } from './drawDraftSizeLabel';
import { drawEditingPathTextHandle } from './drawEditingPathTextHandle';
import { drawEditingText } from './drawEditingText';
import { drawEllipseArcHandleLayer } from './drawEllipseArcHandleLayer/drawEllipseArcHandleLayer';
import { drawEqualSpacingGuides } from './drawEqualSpacingGuides';
import { drawFrame } from './drawFrame';
import { drawFrameNameLabels } from './drawFrameNameLabels/drawFrameNameLabels';
import { drawHoverOutline } from './drawHoverOutline';
import { drawMarquee } from 'utils/canvas/drawMarquee';
import { drawPencilPreview } from './drawPencilPreview/drawPencilPreview';
import { drawPenPreview } from './drawPenPreview/drawPenPreview';
import { drawPixelGrid } from 'utils/canvas/drawPixelGrid';
import { drawSceneBackground } from 'utils/canvas/drawSceneBackground';
import { drawSceneNodes } from './drawSceneNodes/drawSceneNodes';
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
    canvasHeight: clientHeight,
    canvasWidth: clientWidth,
    gl,
    imageContext,
    program,
    viewport,
  };

  drawSceneBackground(gl);
  drawPixelGrid(gl, imageContext.gridProgram, imageContext.gridBuffer, clientWidth, clientHeight, viewport);
  drawSceneNodes(ctx, sceneNodes, rootOrder, pathOutlineStyles, refs, nodesById, pathId);
  drawHoverOutline(ctx, hoveredNode, vectorEditingNodeIds, nodesById);
  drawSelectionOutline(ctx, selectedNodes, vectorEditingNodeIds, nodesById, pathId);
  drawSelectionSizeLabel(ctx, selectedNodes, vectorEditingNodeIds, pathId);
  drawFrameNameLabels(ctx, filteredNodes, selectedIds, refs);
  drawSectionNameLabels(ctx, filteredNodes, refs);
  drawCornerRadiusHandlesLayer(ctx, hoveredNode, selectedNodes, refs);
  drawVertexCountHandlesLayer(ctx, hoveredNode, selectedNodes, refs);
  drawStarRatioHandleLayer(ctx, hoveredNode, selectedNodes, refs);
  drawVectorEditHandlesLayer(ctx, vertexDotBufferCache, eraseAwareNodesById, vectorEditingNodeIds, refs, penActiveVertexId);
  drawEllipseArcHandleLayer(ctx, hoveredNode, selectedNodes, refs);
  drawFrame(ctx, refs);
  drawDraftSizeLabel(ctx, refs);
  drawDraftFrameNameLabel(ctx, refs, nodesById);
  drawDraftSectionNameLabel(ctx, refs, nodesById);
  drawPenPreview(ctx, refs, nodesById, vectorEditingNodeIds[0] ?? null);
  drawPencilPreview(ctx, refs);
  drawEditingText(ctx, editingTextBox, editingTextContent, selectionStart, selectionEnd, selectionChangedAt, editingPathNode);
  drawEditingPathTextHandle(ctx, editingTextBox, editingPathNode);
  drawVectorEditAlignmentGuide(ctx, refs);
  drawTransformAlignmentGuide(ctx, refs);
  drawVectorLasso(ctx, refs);
  drawVectorShapeBuilderPath(ctx, refs);
  drawVectorShapeBuilderHoverPreview(ctx, nodesById, rootOrder, vectorEditingNodeIds, shapeBuilderPreviewFaces, refs);
  drawVectorPaintHoverPreview(ctx, nodesById, refs);
  drawVectorPaintTouchedFacesPreview(ctx, nodesById, refs);
  drawVectorPaintPath(ctx, refs);
  drawVectorFaceSelectHoverPreview(ctx, nodesById, refs);
  drawVectorDraggedFillPreview(ctx, nodesById, refs);
  drawVectorSelectedFillPreview(ctx, nodesById, vectorEditingNodeIds, refs);
  drawVectorCutHoverPreview(ctx, nodesById, refs);
  drawVectorCutPreview(ctx, refs);
  drawVectorEraseBrush(ctx, refs, activeTool);
  drawVectorWidthPointsPreview(ctx, nodesById, vectorEditingNodeIds, refs, activeTool);
  drawMarquee(gl, program, buffer, marqueeRect, clientWidth, clientHeight, viewport);
  drawSliceDraft(gl, program, buffer, sliceRect, clientWidth, clientHeight, viewport);
  drawShapeContactGuides(ctx, refs);
  drawEqualSpacingGuides(ctx, refs);
  drawDistanceGuides(ctx, refs);
};
