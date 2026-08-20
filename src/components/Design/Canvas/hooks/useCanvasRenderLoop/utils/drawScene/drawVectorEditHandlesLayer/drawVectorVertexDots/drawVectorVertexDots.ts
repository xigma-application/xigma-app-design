// others
import {
  VECTOR_VERTEX_FILL,
  VECTOR_VERTEX_HOVER_SCALE,
  VECTOR_VERTEX_SELECTED_FILL,
  VECTOR_VERTEX_SELECTED_INNER_SCALE,
  VECTOR_VERTEX_SELECTED_SCALE,
  VECTOR_VERTEX_SIZE,
} from 'constant/canvas';

// types
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { drawVertexDot } from './drawVertexDot';

export const drawVectorVertexDots = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  node: TVectorNode,
  selectedVertexIds: string[],
  hoveredVertexId: string | null,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const baseSize = VECTOR_VERTEX_SIZE / viewport.zoom;
  const selected = new Set(selectedVertexIds);

  Object.values(node.vertices).forEach((vertex) => {
    if (selected.has(vertex.id)) {
      drawVertexDot(
        gl,
        program,
        buffer,
        vertex.x,
        vertex.y,
        baseSize * VECTOR_VERTEX_SELECTED_SCALE,
        VECTOR_VERTEX_FILL,
        canvasWidth,
        canvasHeight,
        viewport,
      );
      drawVertexDot(
        gl,
        program,
        buffer,
        vertex.x,
        vertex.y,
        baseSize * VECTOR_VERTEX_SELECTED_INNER_SCALE,
        VECTOR_VERTEX_SELECTED_FILL,
        canvasWidth,
        canvasHeight,
        viewport,
      );
    } else {
      const size = vertex.id === hoveredVertexId ? baseSize * VECTOR_VERTEX_HOVER_SCALE : baseSize;

      drawVertexDot(gl, program, buffer, vertex.x, vertex.y, size, VECTOR_VERTEX_FILL, canvasWidth, canvasHeight, viewport);
    }
  });
};
