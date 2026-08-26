// others
import { VECTOR_VERTEX_FILL, VECTOR_VERTEX_HOVER_SCALE } from 'constant/canvas';

// types
import { TVectorVertex, TViewport } from 'types/design/types';

// utils
import { drawVertexDot } from './drawVertexDot';

export const drawHoveredVertexDot = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  vertex: TVectorVertex,
  baseSize: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void =>
  drawVertexDot(
    gl,
    program,
    buffer,
    vertex.x,
    vertex.y,
    baseSize * VECTOR_VERTEX_HOVER_SCALE,
    VECTOR_VERTEX_FILL,
    canvasWidth,
    canvasHeight,
    viewport,
  );
