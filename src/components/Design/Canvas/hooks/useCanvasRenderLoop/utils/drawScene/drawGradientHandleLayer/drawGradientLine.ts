// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawLine } from 'utils/canvas/drawLine';

const GRADIENT_LINE_COLOR = '#ffffff';
const GRADIENT_LINE_WIDTH = 2;
const GRADIENT_LINE_SHADOW_COLOR = '#000000';
const GRADIENT_LINE_SHADOW_ALPHA = 0.35;
const GRADIENT_LINE_SHADOW_EXTRA_WIDTH = 3;

export const drawGradientLine = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  start: TPoint,
  end: TPoint,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const line = { x1: start.x, y1: start.y, x2: end.x, y2: end.y };

  drawLine(
    gl,
    program,
    buffer,
    line,
    GRADIENT_LINE_SHADOW_COLOR,
    (GRADIENT_LINE_WIDTH + GRADIENT_LINE_SHADOW_EXTRA_WIDTH) / viewport.zoom,
    canvasWidth,
    canvasHeight,
    viewport,
    GRADIENT_LINE_SHADOW_ALPHA,
  );

  drawLine(gl, program, buffer, line, GRADIENT_LINE_COLOR, GRADIENT_LINE_WIDTH / viewport.zoom, canvasWidth, canvasHeight, viewport);
};
