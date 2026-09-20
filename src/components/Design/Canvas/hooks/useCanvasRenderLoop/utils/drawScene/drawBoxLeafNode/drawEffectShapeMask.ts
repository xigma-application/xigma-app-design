// types
import { TRoundedRect } from 'utils/canvas/shapes/getRoundedRectPoints';

// utils
import { drawEffectShapeFan } from './drawEffectShapeFan';

export const drawEffectShapeMask = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  shapeRect: TRoundedRect,
  targetWidth: number,
  targetHeight: number,
): void => {
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  drawEffectShapeFan(gl, program, buffer, shapeRect, targetWidth, targetHeight, [1, 1, 1, 1]);
};
