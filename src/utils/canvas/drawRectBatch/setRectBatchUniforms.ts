// types
import { TViewport } from 'types/design/types';

export const setRectBatchUniforms = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  gl.useProgram(program);
  gl.uniform2f(gl.getUniformLocation(program, 'u_viewportOffset'), viewport.x, viewport.y);
  gl.uniform1f(gl.getUniformLocation(program, 'u_zoom'), viewport.zoom);
  gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), canvasWidth, canvasHeight);
};
