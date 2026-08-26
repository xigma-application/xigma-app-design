// types
import { TVectorNode, TViewport } from 'types/design/types';
import { TVectorNodeDragSnapshot } from 'types/design/canvas/types';

// utils
import { drawVectorNode } from 'utils/canvas/drawVectorNode/drawVectorNode';
import { drawVectorNodeDragSnapshot } from 'utils/canvas/drawVectorNode/drawVectorNodeDragSnapshot';

export const drawSceneVectorNode = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  node: TVectorNode,
  draggedVectorNodeSnapshots: Map<string, TVectorNodeDragSnapshot> | null,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const snapshot = draggedVectorNodeSnapshots?.get(node.id);

  if (snapshot) {
    drawVectorNodeDragSnapshot(gl, program, buffer, snapshot, canvasWidth, canvasHeight, viewport);
  } else {
    drawVectorNode(gl, program, buffer, node, canvasWidth, canvasHeight, viewport);
  }
};
