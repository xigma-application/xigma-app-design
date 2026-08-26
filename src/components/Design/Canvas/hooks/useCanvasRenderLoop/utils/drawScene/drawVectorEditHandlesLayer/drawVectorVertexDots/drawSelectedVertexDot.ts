// others
import {
  VECTOR_CUT_CROSSING_FILL,
  VECTOR_VERTEX_FILL,
  VECTOR_VERTEX_SELECTED_FILL,
  VECTOR_VERTEX_SELECTED_INNER_SCALE,
  VECTOR_VERTEX_SELECTED_SCALE,
} from 'constant/canvas';

// types
import { TVectorVertex, TViewport } from 'types/design/types';

// utils
import { drawVertexDot } from './drawVertexDot';

export const drawSelectedVertexDot = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  vertex: TVectorVertex,
  isNew: boolean,
  baseSize: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
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
};
