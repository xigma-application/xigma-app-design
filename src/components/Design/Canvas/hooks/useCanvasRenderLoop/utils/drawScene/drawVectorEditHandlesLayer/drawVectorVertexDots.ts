// others
import { VECTOR_VERTEX_FILL, VECTOR_VERTEX_SELECTED_FILL, VECTOR_VERTEX_SIZE } from 'constant/canvas';

// types
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { drawEllipse } from 'utils/canvas/shapes/drawEllipse';

export const drawVectorVertexDots = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  node: TVectorNode,
  selectedVertexIds: string[],
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const vertexSize = VECTOR_VERTEX_SIZE / viewport.zoom;
  const selected = new Set(selectedVertexIds);

  Object.values(node.vertices).forEach((vertex) => {
    const fill = selected.has(vertex.id) ? VECTOR_VERTEX_SELECTED_FILL : VECTOR_VERTEX_FILL;

    drawEllipse(
      gl,
      program,
      buffer,
      { fill, height: vertexSize, width: vertexSize, x: vertex.x - vertexSize / 2, y: vertex.y - vertexSize / 2 },
      canvasWidth,
      canvasHeight,
      viewport,
      0,
    );
  });
};
