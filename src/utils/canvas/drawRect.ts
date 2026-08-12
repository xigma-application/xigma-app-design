// types
import { TDraftRect } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { hexToRgbaFloat } from './hexToRgbaFloat';

export type TDrawableRect = TDraftRect & {
  fill?: string;
  fillAlpha?: number;
  stroke?: string;
};

export const drawRect = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  rect: TDrawableRect,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const positionLocation = gl.getAttribLocation(program, 'a_position');
  const colorLocation = gl.getUniformLocation(program, 'u_color');
  const viewportOffsetLocation = gl.getUniformLocation(program, 'u_viewportOffset');
  const zoomLocation = gl.getUniformLocation(program, 'u_zoom');
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');

  const x1 = rect.x;
  const y1 = rect.y;
  const x2 = rect.x + rect.width;
  const y2 = rect.y;
  const x3 = rect.x + rect.width;
  const y3 = rect.y + rect.height;
  const x4 = rect.x;
  const y4 = rect.y + rect.height;

  gl.useProgram(program);
  gl.uniform2f(viewportOffsetLocation, viewport.x, viewport.y);
  gl.uniform1f(zoomLocation, viewport.zoom);
  gl.uniform2f(resolutionLocation, canvasWidth, canvasHeight);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  if (rect.fill) {
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([x1, y1, x2, y2, x3, y3, x1, y1, x3, y3, x4, y4]), gl.STATIC_DRAW);
    gl.uniform4fv(colorLocation, hexToRgbaFloat(rect.fill, rect.fillAlpha));
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  if (rect.stroke) {
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([x1, y1, x2, y2, x3, y3, x4, y4]), gl.STATIC_DRAW);
    gl.uniform4fv(colorLocation, hexToRgbaFloat(rect.stroke));
    gl.drawArrays(gl.LINE_LOOP, 0, 4);
  }
};
