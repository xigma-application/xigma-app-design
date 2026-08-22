// types
import { RefObject } from 'react';
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';
import { TVectorHandleHover, TVectorMultiSelectBox } from 'types/design/canvas/types';
import { TVectorMultiSelectResizeDragState, TVectorMultiSelectRotateDragState } from 'types/design/selectionTool/types';

// utils
import { bakeVectorNodeRotation } from '../../../../../utils/bakeVectorNodeRotation';
import { drawVectorEditOutline } from './drawVectorEditOutline/drawVectorEditOutline';
import { drawVectorEdgeInsertPreview } from './drawVectorEdgeInsertPreview';
import { drawVectorMultiSelectBox } from './drawVectorMultiSelectBox/drawVectorMultiSelectBox';
import { drawVectorTangentHandles } from './drawVectorTangentHandles/drawVectorTangentHandles';
import { drawVectorVertexDots } from './drawVectorVertexDots/drawVectorVertexDots';
import { getBakedVectorEditingNodes } from './getBakedVectorEditingNodes';
import { getOneHopVectorVertexIds } from 'utils/canvas/vectorNetwork/getOneHopVectorVertexIds';
import { getTangentVisibilityVertexIds } from 'utils/canvas/vectorNetwork/getTangentVisibilityVertexIds';
import { getVectorEditingNode } from '../../../../../utils/getVectorEditingNode';
import { getVisualSelectedVectorVertexIds } from 'utils/canvas/vectorNetwork/getVisualSelectedVectorVertexIds';

export const drawVectorEditHandlesLayer = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  nodes: Record<string, TSceneNode>,
  vectorEditingNodeIds: string[],
  selectedVertexIds: string[],
  preMarqueeVertexIds: string[],
  selectedSegmentIds: string[],
  preMarqueeSegmentIds: string[],
  hoveredVertexId: string | null,
  hoveredSegmentId: string | null,
  hoveredVectorSegmentId: string | null,
  hoveredVectorEdgeInsertPoint: TPoint | null,
  hoveredHandle: TVectorHandleHover | null,
  selectedHandles: TVectorHandleHover[],
  snappedHandle: TVectorHandleHover | null,
  penActiveVertexId: string | null,
  dragOriginVertexId: string | null,
  penDraggedHandlePosition: TPoint | null,
  isPenDraggedHandleSnapped: boolean,
  vectorMultiSelectBoxRef: RefObject<TVectorMultiSelectBox | null>,
  vectorMultiSelectResizeDrag: TVectorMultiSelectResizeDragState | null,
  vectorMultiSelectRotateDrag: TVectorMultiSelectRotateDragState | null,
  isVectorMultiDragMoving: boolean,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const bakedNodes = getBakedVectorEditingNodes(nodes, vectorEditingNodeIds);

  vectorEditingNodeIds.forEach((vectorEditingNodeId) => {
    const editingNode = getVectorEditingNode(nodes, vectorEditingNodeId);

    if (editingNode) {
      const node = { ...editingNode, ...bakeVectorNodeRotation(editingNode) };
      const visualSelectedVertexIds = getVisualSelectedVectorVertexIds(selectedVertexIds, penActiveVertexId ?? dragOriginVertexId);
      const visualSelectedVertexIdsTotal = [...visualSelectedVertexIds, ...preMarqueeVertexIds];
      const tangentVisibilityVertexIds = getTangentVisibilityVertexIds(node, visualSelectedVertexIdsTotal, selectedHandles);
      const oneHopVertexIds = getOneHopVectorVertexIds(node, tangentVisibilityVertexIds);
      const tangentVisibilitySegmentIds = [...selectedSegmentIds, ...preMarqueeSegmentIds];

      drawVectorEditOutline(
        gl,
        program,
        buffer,
        node,
        selectedSegmentIds,
        hoveredSegmentId,
        hoveredVectorSegmentId,
        canvasWidth,
        canvasHeight,
        viewport,
      );
      drawVectorTangentHandles(
        gl,
        program,
        buffer,
        node,
        hoveredHandle,
        selectedHandles,
        snappedHandle,
        tangentVisibilityVertexIds,
        oneHopVertexIds,
        tangentVisibilitySegmentIds,
        dragOriginVertexId,
        penDraggedHandlePosition,
        isPenDraggedHandleSnapped,
        canvasWidth,
        canvasHeight,
        viewport,
      );
      drawVectorVertexDots(gl, program, buffer, node, visualSelectedVertexIds, hoveredVertexId, canvasWidth, canvasHeight, viewport);
      drawVectorEdgeInsertPreview(gl, program, buffer, hoveredVectorEdgeInsertPoint, canvasWidth, canvasHeight, viewport);
    }
  });

  drawVectorMultiSelectBox(
    gl,
    program,
    buffer,
    bakedNodes,
    vectorEditingNodeIds,
    selectedVertexIds,
    selectedSegmentIds,
    selectedHandles,
    vectorMultiSelectBoxRef,
    vectorMultiSelectResizeDrag,
    vectorMultiSelectRotateDrag,
    isVectorMultiDragMoving,
    canvasWidth,
    canvasHeight,
    viewport,
  );
};
