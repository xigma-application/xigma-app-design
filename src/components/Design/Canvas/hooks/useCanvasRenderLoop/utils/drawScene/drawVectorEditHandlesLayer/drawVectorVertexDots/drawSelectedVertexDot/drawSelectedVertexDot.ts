// others
import { VECTOR_VERTEX_FILL, VECTOR_VERTEX_SELECTED_INNER_SCALE, VECTOR_VERTEX_SELECTED_SCALE } from 'constant/canvas';

// types
import { TVectorVertex, TViewport } from 'types/design/types';

// utils
import { drawVertexDot } from '../drawVertexDot';
import { getSelectedVertexInnerFill } from './getSelectedVertexInnerFill';

export const drawSelectedVertexDot = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  vertex: TVectorVertex,
  isNew: boolean,
  isMeasuring: boolean,
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
    getSelectedVertexInnerFill(isNew, isMeasuring),
    canvasWidth,
    canvasHeight,
    viewport,
  );
};
