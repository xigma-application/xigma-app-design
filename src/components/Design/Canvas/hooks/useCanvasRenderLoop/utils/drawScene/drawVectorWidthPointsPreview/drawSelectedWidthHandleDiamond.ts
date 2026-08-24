// others
import {
  VECTOR_CUT_CROSSING_FILL,
  VECTOR_VERTEX_FILL,
  VECTOR_VERTEX_SELECTED_INNER_SCALE,
  VECTOR_VERTEX_SELECTED_SCALE,
} from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawHandleDiamond } from '../drawVectorEditHandlesLayer/drawVectorTangentHandles/drawHandleDiamond';

export const drawSelectedWidthHandleDiamond = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  handle: TPoint,
  size: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  drawHandleDiamond(
    gl,
    program,
    buffer,
    handle,
    size * VECTOR_VERTEX_SELECTED_SCALE,
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
    size * VECTOR_VERTEX_SELECTED_INNER_SCALE,
    VECTOR_CUT_CROSSING_FILL,
    canvasWidth,
    canvasHeight,
    viewport,
  );
};
