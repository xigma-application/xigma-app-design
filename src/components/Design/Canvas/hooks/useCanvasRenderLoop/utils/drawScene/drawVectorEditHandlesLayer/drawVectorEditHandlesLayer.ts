// types
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { bakeVectorNodeRotation } from '../../../../../utils/bakeVectorNodeRotation';
import { drawVectorEditOutline } from './drawVectorEditOutline';
import { drawVectorTangentHandles } from './drawVectorTangentHandles';
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
  penActiveVertexId: string | null,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const editingNode = getVectorEditingNode(nodes, vectorEditingNodeId);

  if (editingNode) {
    const node = { ...editingNode, ...bakeVectorNodeRotation(editingNode) };
    const visualSelectedVertexIds = penActiveVertexId ? [...selectedVertexIds, penActiveVertexId] : selectedVertexIds;

    drawVectorEditOutline(gl, program, buffer, node, hoveredNodeId, canvasWidth, canvasHeight, viewport);
    drawVectorTangentHandles(gl, program, buffer, node, canvasWidth, canvasHeight, viewport);
    drawVectorVertexDots(gl, program, buffer, node, visualSelectedVertexIds, hoveredVertexId, canvasWidth, canvasHeight, viewport);
  }
};
