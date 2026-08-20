// types
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';
import { TVectorHandleHover } from 'types/design/canvas/types';

// utils
import { bakeVectorNodeRotation } from '../../../../../utils/bakeVectorNodeRotation';
import { drawVectorEditOutline } from './drawVectorEditOutline/drawVectorEditOutline';
import { drawVectorMultiSelectBox } from './drawVectorMultiSelectBox';
import { drawVectorTangentHandles } from './drawVectorTangentHandles/drawVectorTangentHandles';
import { drawVectorVertexDots } from './drawVectorVertexDots';
import { getVectorEditingNode } from '../../../../../utils/getVectorEditingNode';

export const drawVectorEditHandlesLayer = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  nodes: Record<string, TSceneNode>,
  vectorEditingNodeId: string | null,
  selectedVertexIds: string[],
  hoveredNodeId: string | null,
  hoveredVertexId: string | null,
  hoveredSegmentId: string | null,
  hoveredHandle: TVectorHandleHover | null,
  selectedHandles: TVectorHandleHover[],
  penActiveVertexId: string | null,
  penDraggedHandlePosition: TPoint | null,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const editingNode = getVectorEditingNode(nodes, vectorEditingNodeId);

  if (editingNode) {
    const node = { ...editingNode, ...bakeVectorNodeRotation(editingNode) };
    const visualSelectedVertexIds = penActiveVertexId ? [...selectedVertexIds, penActiveVertexId] : selectedVertexIds;

    drawVectorEditOutline(gl, program, buffer, node, hoveredNodeId, hoveredSegmentId, canvasWidth, canvasHeight, viewport);
    drawVectorTangentHandles(
      gl,
      program,
      buffer,
      node,
      hoveredHandle,
      selectedHandles,
      penActiveVertexId,
      penDraggedHandlePosition,
      canvasWidth,
      canvasHeight,
      viewport,
    );
    drawVectorVertexDots(gl, program, buffer, node, visualSelectedVertexIds, hoveredVertexId, canvasWidth, canvasHeight, viewport);
    drawVectorMultiSelectBox(gl, program, buffer, node, selectedVertexIds, selectedHandles, canvasWidth, canvasHeight, viewport);
  }
};
