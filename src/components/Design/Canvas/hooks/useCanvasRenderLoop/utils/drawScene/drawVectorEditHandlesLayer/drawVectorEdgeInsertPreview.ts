// others
import { VECTOR_VERTEX_FILL, VECTOR_VERTEX_HOVER_SCALE, VECTOR_VERTEX_SIZE } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawVertexDot } from './drawVectorVertexDots/drawVertexDot';

export const drawVectorEdgeInsertPreview = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  point: TPoint | null,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (point) {
    const size = (VECTOR_VERTEX_SIZE / viewport.zoom) * VECTOR_VERTEX_HOVER_SCALE;

    drawVertexDot(gl, program, buffer, point.x, point.y, size, VECTOR_VERTEX_FILL, canvasWidth, canvasHeight, viewport);
  }
};
