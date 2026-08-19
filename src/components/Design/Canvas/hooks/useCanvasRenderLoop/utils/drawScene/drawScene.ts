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
  selectSelectedNodes,
  selectVectorEditingNodeId,
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
import { drawPenPreview } from './drawPenPreview';
import { drawPixelGrid } from 'utils/canvas/drawPixelGrid';
import { drawSceneBackground } from 'utils/canvas/drawSceneBackground';
import { drawSceneNodes } from './drawSceneNodes';
import { drawSelectionOutline } from './drawSelectionOutline';
import { drawSliceDraft } from 'utils/canvas/drawSliceDraft';
import { drawStarRatioHandleLayer } from './drawStarRatioHandleLayer';
import { drawVectorEditHandlesLayer } from './drawVectorEditHandlesLayer/drawVectorEditHandlesLayer';
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
  const vectorEditingNodeId = selectVectorEditingNodeId(state);
  const selectedVectorVertexIds = refs.selectedVectorVertexIdsRef.current;
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
  drawHoverOutline(gl, program, buffer, hoveredNode, clientWidth, clientHeight, viewport);
  drawSelectionOutline(gl, program, buffer, selectedNodes, clientWidth, clientHeight, viewport);
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
    vectorEditingNodeId,
    selectedVectorVertexIds,
    hoveredNodeId,
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
  drawPenPreview(gl, program, buffer, refs.penPreviewRef.current, refs.penHoverVertexRef.current, clientWidth, clientHeight, viewport);
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
  drawMarquee(gl, program, buffer, marqueeRect, clientWidth, clientHeight, viewport);
  drawSliceDraft(gl, program, buffer, sliceRect, clientWidth, clientHeight, viewport);
};
