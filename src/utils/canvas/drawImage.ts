// types
import { TDraftRect } from 'types/canvas';
import { TViewport } from 'types/design/types';

export const drawImage = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  texture: WebGLTexture | null,
  rect: TDraftRect,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (texture) {
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
    const textureLocation = gl.getUniformLocation(program, 'u_texture');
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

    // interleaved [x, y, u, v] per vertex, 2 triangles covering the rect
    const vertices = new Float32Array([x1, y1, 0, 0, x2, y2, 1, 0, x3, y3, 1, 1, x1, y1, 0, 0, x3, y3, 1, 1, x4, y4, 0, 1]);
    const stride = 4 * Float32Array.BYTES_PER_ELEMENT;

    gl.useProgram(program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(textureLocation, 0);
    gl.uniform2f(viewportOffsetLocation, viewport.x, viewport.y);
    gl.uniform1f(zoomLocation, viewport.zoom);
    gl.uniform2f(resolutionLocation, canvasWidth, canvasHeight);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
};
