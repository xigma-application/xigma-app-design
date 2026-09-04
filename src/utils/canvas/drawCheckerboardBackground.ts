// others
import { CHECKERBOARD_COLOR_A, CHECKERBOARD_COLOR_B, CHECKERBOARD_SQUARE_SIZE_PX } from 'constant/canvas';

// types
import { TViewport } from 'types/design/types';

// utils
import { hexToRgbaFloat } from './hexToRgbaFloat';
import { hexToRgbFloat } from './hexToRgbFloat';

const FULL_VIEWPORT_QUAD = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);

export const drawCheckerboardBackground = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  paintColor: string,
  paintMix: number,
): void => {
  const positionLocation = gl.getAttribLocation(program, 'a_position');
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  const viewportOffsetLocation = gl.getUniformLocation(program, 'u_viewportOffset');
  const zoomLocation = gl.getUniformLocation(program, 'u_zoom');
  const colorALocation = gl.getUniformLocation(program, 'u_colorA');
  const colorBLocation = gl.getUniformLocation(program, 'u_colorB');
  const squareSizeLocation = gl.getUniformLocation(program, 'u_squareSize');
  const paintColorLocation = gl.getUniformLocation(program, 'u_paintColor');
  const paintMixLocation = gl.getUniformLocation(program, 'u_paintMix');

  gl.useProgram(program);
  gl.uniform2f(resolutionLocation, canvasWidth, canvasHeight);
  gl.uniform2f(viewportOffsetLocation, viewport.x, viewport.y);
  gl.uniform1f(zoomLocation, viewport.zoom);
  gl.uniform4fv(colorALocation, hexToRgbaFloat(CHECKERBOARD_COLOR_A));
  gl.uniform4fv(colorBLocation, hexToRgbaFloat(CHECKERBOARD_COLOR_B));
  gl.uniform1f(squareSizeLocation, CHECKERBOARD_SQUARE_SIZE_PX);
  gl.uniform3fv(paintColorLocation, hexToRgbFloat(paintColor));
  gl.uniform1f(paintMixLocation, paintMix);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, FULL_VIEWPORT_QUAD, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
};
