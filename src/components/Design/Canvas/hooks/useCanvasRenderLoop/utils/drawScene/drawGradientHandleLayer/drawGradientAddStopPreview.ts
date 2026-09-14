// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawSingleGradientStopHandle } from './drawSingleGradientStopHandle';

export const drawGradientAddStopPreview = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  pointOnLine: TPoint,
  color: string,
  opacity: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  drawSingleGradientStopHandle(gl, program, buffer, pointOnLine, color, opacity, false, canvasWidth, canvasHeight, viewport);
};
