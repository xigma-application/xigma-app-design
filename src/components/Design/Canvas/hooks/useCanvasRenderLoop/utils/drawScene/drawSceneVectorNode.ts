// types
import { TVectorNode, TViewport } from 'types/design/types';
import { TVectorNodeDragSnapshot, TVectorNodeResizeSnapshot } from 'types/design/canvas/types';

// utils
import { drawVectorNode } from 'utils/canvas/drawVectorNode/drawVectorNode';
import { drawVectorNodeDragSnapshot } from 'utils/canvas/drawVectorNode/drawVectorNodeDragSnapshot';
import { drawVectorNodeResizeSnapshot } from 'utils/canvas/drawVectorNode/drawVectorNodeResizeSnapshot';

export const drawSceneVectorNode = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  node: TVectorNode,
  draggedVectorNodeSnapshots: Map<string, TVectorNodeDragSnapshot> | null,
  resizedVectorNodeSnapshots: Map<string, TVectorNodeResizeSnapshot> | null,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const dragSnapshot = draggedVectorNodeSnapshots?.get(node.id);
  const resizeSnapshot = resizedVectorNodeSnapshots?.get(node.id);

  switch (true) {
    case Boolean(dragSnapshot):
      drawVectorNodeDragSnapshot(gl, program, buffer, dragSnapshot!, canvasWidth, canvasHeight, viewport);
      break;
    case Boolean(resizeSnapshot):
      drawVectorNodeResizeSnapshot(gl, program, buffer, resizeSnapshot!, canvasWidth, canvasHeight, viewport);
      break;
    default:
      drawVectorNode(gl, program, buffer, node, canvasWidth, canvasHeight, viewport);
  }
};
