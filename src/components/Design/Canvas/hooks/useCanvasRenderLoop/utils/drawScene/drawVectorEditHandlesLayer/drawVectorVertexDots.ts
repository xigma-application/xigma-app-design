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
import { drawEllipse } from 'utils/canvas/shapes/drawEllipse';

const drawVertexDot = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  x: number,
  y: number,
  size: number,
  fill: string,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  drawEllipse(
    gl,
    program,
    buffer,
    { fill, height: size, width: size, x: x - size / 2, y: y - size / 2 },
    canvasWidth,
    canvasHeight,
    viewport,
    0,
  );
};

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
