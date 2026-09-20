// types
import { TRoundedRect } from 'utils/canvas/shapes/getRoundedRectPoints';

// utils
import { drawEffectShapeFan } from './drawEffectShapeFan';

export const drawEffectSilhouette = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  holeRect: TRoundedRect,
  targetWidth: number,
  targetHeight: number,
  color: [number, number, number],
): void => {
  gl.clearColor(color[0], color[1], color[2], 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  if (holeRect.width > 0 && holeRect.height > 0) {
    gl.blendFuncSeparate(gl.ZERO, gl.ONE, gl.ZERO, gl.ZERO);
    drawEffectShapeFan(gl, program, buffer, holeRect, targetWidth, targetHeight, [0, 0, 0, 0]);
  }
};
