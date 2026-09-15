// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { hexToRgbaFloat } from 'utils/canvas/hexToRgbaFloat';

const POINTER_WIDTH = 6;
const POINTER_HEIGHT = 3;

export const drawGradientStopPointer = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  anchor: TPoint,
  direction: TPoint,
  fill: string,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const width = POINTER_WIDTH / viewport.zoom;
  const height = POINTER_HEIGHT / viewport.zoom;
  const perpendicular: TPoint = { x: -direction.y, y: direction.x };
  const baseLeft: TPoint = { x: anchor.x - (perpendicular.x * width) / 2, y: anchor.y - (perpendicular.y * width) / 2 };
  const baseRight: TPoint = { x: anchor.x + (perpendicular.x * width) / 2, y: anchor.y + (perpendicular.y * width) / 2 };
  const tip: TPoint = { x: anchor.x + direction.x * height, y: anchor.y + direction.y * height };
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
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([baseLeft.x, baseLeft.y, baseRight.x, baseRight.y, tip.x, tip.y]), gl.STATIC_DRAW);
  gl.uniform4fv(colorLocation, hexToRgbaFloat(fill));
  gl.drawArrays(gl.TRIANGLES, 0, 3);
};
