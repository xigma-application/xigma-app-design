// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';

// types
import { TViewport } from 'types/design/types';

// utils
import { hexToRgbaFloat } from 'utils/canvas/hexToRgbaFloat';

export const drawCurvedSelectionOutline = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  points: number[],
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const positionLocation = gl.getAttribLocation(program, 'a_position');
  const colorLocation = gl.getUniformLocation(program, 'u_color');
  const viewportOffsetLocation = gl.getUniformLocation(program, 'u_viewportOffset');
  const zoomLocation = gl.getUniformLocation(program, 'u_zoom');
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');

  gl.useProgram(program);
  gl.uniform2f(viewportOffsetLocation, viewport.x, viewport.y);
  gl.uniform1f(zoomLocation, viewport.zoom);
  gl.uniform2f(resolutionLocation, canvasWidth, canvasHeight);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
  gl.uniform4fv(colorLocation, hexToRgbaFloat(DRAFT_FRAME_STROKE));
  gl.drawArrays(gl.LINES, 0, points.length / 2);
};
