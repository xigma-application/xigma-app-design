// others
import { ROUNDED_RECT_CORNER_SEGMENTS } from 'constant/canvas';

// utils
import { resetEffectVertexAttributes } from './resetEffectVertexAttributes';
import { getRoundedRectPoints, TRoundedRect } from 'utils/canvas/shapes/getRoundedRectPoints';
import { toFanVertices } from 'utils/canvas/toFanVertices';

export const drawEffectShapeFan = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  rect: TRoundedRect,
  targetWidth: number,
  targetHeight: number,
  color: [number, number, number, number],
): void => {
  const positionLocation = gl.getAttribLocation(program, 'a_position');
  const colorLocation = gl.getUniformLocation(program, 'u_color');
  const viewportOffsetLocation = gl.getUniformLocation(program, 'u_viewportOffset');
  const zoomLocation = gl.getUniformLocation(program, 'u_zoom');
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  const points = getRoundedRectPoints(rect, ROUNDED_RECT_CORNER_SEGMENTS);
  const center = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };

  gl.useProgram(program);
  gl.uniform2f(viewportOffsetLocation, 0, 0);
  gl.uniform1f(zoomLocation, 1);
  gl.uniform2f(resolutionLocation, targetWidth, targetHeight);
  gl.uniform4f(colorLocation, color[0], color[1], color[2], color[3]);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(toFanVertices(center, points)), gl.STATIC_DRAW);
  resetEffectVertexAttributes(gl, positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, points.length + 2);
};
