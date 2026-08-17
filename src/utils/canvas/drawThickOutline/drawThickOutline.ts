// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { getRoundedRingVertices } from './getRoundedRingVertices';
import { getSharpRingVertices } from './getSharpRingVertices';
import { hexToRgbaFloat } from '../hexToRgbaFloat';
import { rotateFlatVertices } from './rotateFlatVertices';

export const drawThickOutline = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  rect: TDraftRect & { cornerRadius?: number },
  color: string,
  strokeWidth: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  rotation: number,
): void => {
  const positionLocation = gl.getAttribLocation(program, 'a_position');
  const colorLocation = gl.getUniformLocation(program, 'u_color');
  const viewportOffsetLocation = gl.getUniformLocation(program, 'u_viewportOffset');
  const zoomLocation = gl.getUniformLocation(program, 'u_zoom');
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  const halfWidth = strokeWidth / viewport.zoom / 2;
  const cornerRadius = rect.cornerRadius ?? 0;

  const rawVertices = cornerRadius > 0 ? getRoundedRingVertices(rect, halfWidth, cornerRadius) : getSharpRingVertices(rect, halfWidth);
  const center: TPoint = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  const vertices = rotateFlatVertices(rawVertices, center, rotation);

  gl.useProgram(program);
  gl.uniform2f(viewportOffsetLocation, viewport.x, viewport.y);
  gl.uniform1f(zoomLocation, viewport.zoom);
  gl.uniform2f(resolutionLocation, canvasWidth, canvasHeight);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.uniform4fv(colorLocation, hexToRgbaFloat(color));
  gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);
};
