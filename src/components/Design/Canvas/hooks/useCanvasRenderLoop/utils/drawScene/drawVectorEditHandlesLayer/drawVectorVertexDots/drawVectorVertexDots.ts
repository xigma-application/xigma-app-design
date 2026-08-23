// others
import {
  VECTOR_CUT_CROSSING_FILL,
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
import { drawVertexDot } from './drawVertexDot';

export const drawVectorVertexDots = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  node: TVectorNode,
  selectedVertexIds: string[],
  hoveredVertexId: string | null,
  newVertexIds: Set<string>,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const baseSize = VECTOR_VERTEX_SIZE / viewport.zoom;
  const selected = new Set(selectedVertexIds);

  Object.values(node.vertices).forEach((vertex) => {
    const isNew = newVertexIds.has(vertex.id);

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
        isNew ? VECTOR_CUT_CROSSING_FILL : VECTOR_VERTEX_SELECTED_FILL,
        canvasWidth,
        canvasHeight,
        viewport,
      );
    } else {
      const size = vertex.id === hoveredVertexId ? baseSize * VECTOR_VERTEX_HOVER_SCALE : baseSize;

      if (isNew) {
        drawEllipse(
          gl,
          program,
          buffer,
          {
            fill: VECTOR_VERTEX_FILL,
            height: size,
            stroke: VECTOR_CUT_CROSSING_FILL,
            width: size,
            x: vertex.x - size / 2,
            y: vertex.y - size / 2,
          },
          canvasWidth,
          canvasHeight,
          viewport,
          0,
        );
      } else {
        drawVertexDot(gl, program, buffer, vertex.x, vertex.y, size, VECTOR_VERTEX_FILL, canvasWidth, canvasHeight, viewport);
      }
    }
  });
};
