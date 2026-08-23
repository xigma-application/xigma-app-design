// types
import { RefObject } from 'react';
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';
import { TVectorHandleHover, TVectorMultiSelectBox } from 'types/design/canvas/types';
import { TVectorMultiSelectResizeDragState, TVectorMultiSelectRotateDragState } from 'types/design/selectionTool/types';

// utils
import { drawVectorEditHandlesForNode } from '../drawVectorEditHandlesForNode/drawVectorEditHandlesForNode';
import { drawVectorMultiSelectBox } from '../drawVectorMultiSelectBox/drawVectorMultiSelectBox';
import { getBakedVectorEditingNodes } from '../getBakedVectorEditingNodes';
import { getVectorEditingNode } from '../../../../../../utils/getVectorEditingNode';

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
  newVertexIds: Set<string>,
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
      drawVectorEditHandlesForNode(
        gl,
        program,
        buffer,
        editingNode,
        selectedVertexIds,
        preMarqueeVertexIds,
        selectedSegmentIds,
        preMarqueeSegmentIds,
        hoveredVertexId,
        newVertexIds,
        hoveredSegmentId,
        hoveredVectorSegmentId,
        hoveredVectorEdgeInsertPoint,
        hoveredHandle,
        selectedHandles,
        snappedHandle,
        penActiveVertexId,
        dragOriginVertexId,
        penDraggedHandlePosition,
        isPenDraggedHandleSnapped,
        canvasWidth,
        canvasHeight,
        viewport,
      );
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
