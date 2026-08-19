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
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const editingNode = getVectorEditingNode(nodes, vectorEditingNodeId);

  if (editingNode) {
    const node = { ...editingNode, ...bakeVectorNodeRotation(editingNode) };

    drawVectorEditOutline(gl, program, buffer, node, hoveredNodeId, canvasWidth, canvasHeight, viewport);
    drawVectorTangentHandles(gl, program, buffer, node, canvasWidth, canvasHeight, viewport);
    drawVectorVertexDots(gl, program, buffer, node, selectedVertexIds, canvasWidth, canvasHeight, viewport);
  }
};
