// others
import {
  VECTOR_VERTEX_FILL,
  VECTOR_VERTEX_SELECTED_FILL,
  VECTOR_VERTEX_SELECTED_INNER_SCALE,
  VECTOR_VERTEX_SELECTED_SCALE,
} from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawHandleDiamond } from './drawHandleDiamond';

export const drawSelectedTangentHandleDot = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  handle: TPoint,
  dotSize: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  drawHandleDiamond(
    gl,
    program,
    buffer,
    handle,
    dotSize * VECTOR_VERTEX_SELECTED_SCALE,
    VECTOR_VERTEX_FILL,
    canvasWidth,
    canvasHeight,
    viewport,
  );
  drawHandleDiamond(
    gl,
    program,
    buffer,
    handle,
    dotSize * VECTOR_VERTEX_SELECTED_INNER_SCALE,
    VECTOR_VERTEX_SELECTED_FILL,
    canvasWidth,
    canvasHeight,
    viewport,
  );
};
