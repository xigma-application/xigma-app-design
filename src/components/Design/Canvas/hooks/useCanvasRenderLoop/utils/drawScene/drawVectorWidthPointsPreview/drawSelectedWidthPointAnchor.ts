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
import { drawVertexDot } from '../drawVectorEditHandlesLayer/drawVectorVertexDots/drawVertexDot';

export const drawSelectedWidthPointAnchor = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  anchor: TPoint,
  size: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  drawVertexDot(
    gl,
    program,
    buffer,
    anchor.x,
    anchor.y,
    size * VECTOR_VERTEX_SELECTED_SCALE,
    VECTOR_VERTEX_FILL,
    canvasWidth,
    canvasHeight,
    viewport,
  );
  drawVertexDot(
    gl,
    program,
    buffer,
    anchor.x,
    anchor.y,
    size * VECTOR_VERTEX_SELECTED_INNER_SCALE,
    VECTOR_CUT_CROSSING_FILL,
    canvasWidth,
    canvasHeight,
    viewport,
  );
};
