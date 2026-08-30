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
import { drawAlignmentGuide } from './drawAlignmentGuide';
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
import { drawVectorDraggedFillPreview } from './drawVectorDraggedFillPreview';
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
  const marqueeRect = refs.lassoMarquee.marqueeRef.current;
  const hoveredNodeId = refs.hover.hoverRef.current;
  const sliceRect = refs.slice.sliceRef.current;
  const isDraggingCornerRadius = hasCornerRadiusDragMoved(refs);
  const ellipseArcDraggedHandlePosition = refs.ellipseArc.ellipseArcDragRef.current?.draggedHandlePosition ?? null;
  const ellipseArcRotateDraggedHandlePosition = refs.ellipseArc.ellipseArcRotateDragRef.current?.draggedHandlePosition ?? null;
  const ellipseArcRatioDraggedHandlePosition = refs.ellipseArc.ellipseArcRatioDragRef.current?.draggedHandlePosition ?? null;
  const state = store.getState();
  const activeTool = selectActiveTool(state);
  const viewport = selectViewport(state);
  const { clientHeight, clientWidth } = canvas;
  const editingNodeId = selectEditingNodeId(state);
  const editingTextBox = selectEditingTextBox(state);
  const nodesById = selectNodes(state);
  const vectorEditingNodeIds = selectVectorEditingNodeIds(state);
  const hoveredVectorPaintFace = refs.hover.hoveredVectorPaintFaceKeyRef.current;
  const shapeBuilderPreviewFaces = getShapeBuilderPreviewFaces(refs);
  const hoveredVectorFaceSelect = refs.hover.hoveredVectorFaceSelectRef.current;
  const selectedVectorVertexIds = refs.vectorEdit.selectedVectorVertexIdsRef.current;
  const preMarqueeVectorVertexIds = refs.vectorEdit.preVectorMarqueeVertexIdsRef.current;
  const selectedVectorSegmentIds = refs.vectorEdit.selectedVectorSegmentIdsRef.current;
  const preMarqueeVectorSegmentIds = refs.vectorEdit.preVectorMarqueeSegmentIdsRef.current;
  const hoveredVectorVertexId = refs.hover.hoveredVectorVertexIdRef.current;
  const hoveredVectorHandle = refs.hover.hoveredVectorHandleRef.current;
  const selectedVectorHandles = refs.vectorEdit.selectedVectorHandlesRef.current;
  const hoveredSegmentId = refs.hover.hoveredSegmentIdRef.current;
  const hoveredVectorSegmentId = refs.hover.hoveredVectorSegmentIdRef.current;
  const hoveredVectorEdgeInsertPoint = refs.hover.hoveredVectorEdgeInsertPointRef.current;
  const penActiveVertexId = selectPenActiveVertexId(state);
  const dragOriginVertexId = refs.pen.penDragOriginRef.current?.vertexId ?? null;
  const penDraggedHandlePosition = refs.pen.penDraggedHandlePositionRef.current;
  const isPenDraggedHandleSnapped = refs.pen.penDraggedHandleIsSnappedRef.current;
  const snappedVectorHandle = refs.vectorEdit.snappedVectorHandleRef.current;
  const vectorMultiSelectResizeDrag = refs.vectorMultiSelect.vectorMultiSelectResizeDragRef.current;
  const vectorMultiSelectRotateDrag = refs.vectorMultiSelect.vectorMultiSelectRotateDragRef.current;
  const isVectorMultiDragMoving = Boolean(refs.vectorMultiSelect.vectorMultiDragRef.current?.hasMoved);
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
    getPathOutlineStyles(valuesNodeByid, selectedIds, editingNodeId, hoveredNode?.id ?? null, editingTextBox?.pathId),
    refs.vectorSnapshots.draggedVectorNodeSnapshotsRef.current,
    refs.vectorSnapshots.resizedVectorNodeSnapshotsRef.current,
    refs.vectorSnapshots.rotatedVectorNodeSnapshotsRef.current,
    nodesById,
    editingTextBox?.pathId,
  );
  drawHoverOutline(gl, program, buffer, hoveredNode, clientWidth, clientHeight, viewport, vectorEditingNodeIds, nodesById);
  drawSelectionOutline(
    gl,
    program,
    buffer,
    selectedNodes,
    clientWidth,
    clientHeight,
    viewport,
    vectorEditingNodeIds,
    nodesById,
    editingTextBox?.pathId,
  );
  drawSelectionSizeLabel(gl, program, buffer, imageContext, selectedNodes, clientWidth, clientHeight, viewport, vectorEditingNodeIds);
  drawFrameNameLabels(gl, imageContext, filteredNodes, selectedIds, refs, clientWidth, clientHeight, viewport);
  drawSectionNameLabels(gl, program, buffer, imageContext, filteredNodes, refs, clientWidth, clientHeight, viewport);
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
    imageContext.vertexDotBufferCache,
    eraseAwareNodesById,
    vectorEditingNodeIds,
    selectedVectorVertexIds,
    preMarqueeVectorVertexIds,
    selectedVectorSegmentIds,
    preMarqueeVectorSegmentIds,
    hoveredVectorVertexId,
    refs.vectorCut.newVectorCutVertexIdsRef.current,
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
    refs.vectorMultiSelect.vectorMultiSelectBoxRef,
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
  drawDraftFrameNameLabel(gl, imageContext, draftShape, nodesById, clientWidth, clientHeight, viewport);
  drawDraftSectionNameLabel(gl, program, buffer, imageContext, draftShape, nodesById, clientWidth, clientHeight, viewport);
  drawPenPreview(
    gl,
    program,
    buffer,
    refs.pen.penPreviewRef.current,
    refs.pen.penNewVertexPreviewRef.current,
    refs.pen.penHoveredDragArmableVertexRef.current,
    nodesById,
    vectorEditingNodeIds[0] ?? null,
    clientWidth,
    clientHeight,
    viewport,
  );
  drawPencilPreview(
    gl,
    program,
    buffer,
    refs.pencil.pencilPreviewPointsRef.current,
    refs.pencil.pencilRawPreviewPointsRef.current,
    refs.pencil.pencilShowRawPreviewRef.current,
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
    editingPathNode,
  );
  drawEditingPathTextHandle(gl, program, buffer, editingTextBox, clientWidth, clientHeight, viewport, editingPathNode);
  drawAlignmentGuide(gl, program, buffer, refs.vectorEdit.vectorAlignmentGuideRef.current, clientWidth, clientHeight, viewport);
  drawAlignmentGuide(gl, program, buffer, refs.transform.alignmentGuideRef.current, clientWidth, clientHeight, viewport);
  drawVectorLasso(gl, program, buffer, refs.lassoMarquee.vectorLassoPathRef.current, clientWidth, clientHeight, viewport);
  drawVectorShapeBuilderPath(
    gl,
    program,
    buffer,
    refs.shapeBuilder.vectorShapeBuilderPathRef.current,
    refs.shapeBuilder.isVectorShapeBuilderBoxModeRef.current,
    clientWidth,
    clientHeight,
    viewport,
  );
  drawVectorShapeBuilderHoverPreview(
    gl,
    program,
    buffer,
    nodesById,
    state.design.pages[state.design.activePageId].rootOrder,
    vectorEditingNodeIds,
    shapeBuilderPreviewFaces,
    refs.shapeBuilder.isVectorShapeBuilderSubtractRef.current,
    refs.shapeBuilder.vectorShapeBuilderPathRef.current,
    refs.shapeBuilder.isVectorShapeBuilderBoxModeRef.current,
    clientWidth,
    clientHeight,
    viewport,
  );
  drawVectorPaintHoverPreview(gl, program, buffer, nodesById, hoveredVectorPaintFace, clientWidth, clientHeight, viewport);
  drawVectorPaintTouchedFacesPreview(
    gl,
    program,
    buffer,
    nodesById,
    refs.vectorPaint.vectorPaintTouchedFacesRef.current,
    refs.vectorPaint.isVectorPaintRemoveRef.current,
    clientWidth,
    clientHeight,
    viewport,
  );
  drawVectorPaintPath(gl, program, buffer, refs.vectorPaint.vectorPaintPathRef.current, clientWidth, clientHeight, viewport);
  drawVectorFaceSelectHoverPreview(gl, program, buffer, nodesById, hoveredVectorFaceSelect, clientWidth, clientHeight, viewport);
  drawVectorDraggedFillPreview(
    gl,
    program,
    buffer,
    nodesById,
    refs.vectorSnapshots.draggedVectorFillFacesRef.current,
    clientWidth,
    clientHeight,
    viewport,
  );
  drawVectorSelectedFillPreview(
    gl,
    program,
    buffer,
    nodesById,
    vectorEditingNodeIds,
    selectedVectorVertexIds,
    clientWidth,
    clientHeight,
    viewport,
  );
  drawVectorCutHoverPreview(
    gl,
    program,
    buffer,
    nodesById,
    refs.hover.hoveredVectorCutSegmentRef.current,
    refs.hover.hoveredVectorCutPointRef.current,
    clientWidth,
    clientHeight,
    viewport,
  );
  drawVectorCutPreview(gl, program, buffer, refs.vectorCut.vectorCutPreviewRef.current, clientWidth, clientHeight, viewport);
  drawVectorEraseBrush(
    gl,
    program,
    buffer,
    refs.vectorErase.eraseBrushCenterRef.current,
    refs.vectorErase.eraserDiameterRef.current,
    activeTool,
    clientWidth,
    clientHeight,
    viewport,
  );
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
  drawShapeContactGuides(gl, program, buffer, refs.transform.contactGuidesRef.current, clientWidth, clientHeight, viewport);
};
