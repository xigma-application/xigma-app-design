// types
import { TViewport } from 'types/design/types';

// utils
import { getOrCreateStrokeBuffer } from './getOrCreateStrokeBuffer';
import { hexToRgbaFloat } from '../hexToRgbaFloat';

export const drawVectorThickStrokeVertices = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  strokeBufferCache: WeakMap<number[], WebGLBuffer> | null,
  vertices: number[],
  color: string,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  alpha = 1,
): void => {
  if (vertices.length !== 0) {
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const colorLocation = gl.getUniformLocation(program, 'u_color');
    const viewportOffsetLocation = gl.getUniformLocation(program, 'u_viewportOffset');
    const zoomLocation = gl.getUniformLocation(program, 'u_zoom');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');

    gl.useProgram(program);
    gl.uniform2f(viewportOffsetLocation, viewport.x, viewport.y);
    gl.uniform1f(zoomLocation, viewport.zoom);
    gl.uniform2f(resolutionLocation, canvasWidth, canvasHeight);
    gl.enableVertexAttribArray(positionLocation);

    getOrCreateStrokeBuffer(gl, strokeBufferCache, buffer, vertices);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniform4fv(colorLocation, hexToRgbaFloat(color, alpha));
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);
  }
};
