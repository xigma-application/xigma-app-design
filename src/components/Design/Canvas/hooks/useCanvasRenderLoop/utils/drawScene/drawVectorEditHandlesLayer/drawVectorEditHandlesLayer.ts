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
import { getOneHopVectorVertexIds } from 'utils/canvas/vectorNetwork/getOneHopVectorVertexIds';
import { getVectorEditingNode } from '../../../../../utils/getVectorEditingNode';
import { getVisualSelectedVectorVertexIds } from 'utils/canvas/vectorNetwork/getVisualSelectedVectorVertexIds';

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
    const visualSelectedVertexIds = getVisualSelectedVectorVertexIds(selectedVertexIds, penActiveVertexId);
    const oneHopVertexIds = getOneHopVectorVertexIds(node, visualSelectedVertexIds);

    drawVectorEditOutline(gl, program, buffer, node, hoveredNodeId, hoveredSegmentId, canvasWidth, canvasHeight, viewport);
    drawVectorTangentHandles(
      gl,
      program,
      buffer,
      node,
      hoveredHandle,
      selectedHandles,
      visualSelectedVertexIds,
      oneHopVertexIds,
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
