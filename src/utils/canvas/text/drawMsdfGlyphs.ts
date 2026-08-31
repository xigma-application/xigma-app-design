// types
import { TGlyphAtlasJson } from 'types/msdf';
import { TViewport } from 'types/design/types';

// utils
import { hexToRgbaFloat } from '../hexToRgbaFloat';

export const drawMsdfGlyphs = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  texture: WebGLTexture | null,
  atlas: TGlyphAtlasJson,
  vertices: Float32Array,
  color: string,
  effectiveFontSize: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  strokeColor?: string,
  strokeWidth?: number,
): void => {
  if (texture && vertices.length > 0) {
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
    const textureLocation = gl.getUniformLocation(program, 'u_texture');
    const colorLocation = gl.getUniformLocation(program, 'u_color');
    const strokeColorLocation = gl.getUniformLocation(program, 'u_strokeColor');
    const strokeWidthLocation = gl.getUniformLocation(program, 'u_strokeWidth');
    const screenPxRangeLocation = gl.getUniformLocation(program, 'u_screenPxRange');
    const viewportOffsetLocation = gl.getUniformLocation(program, 'u_viewportOffset');
    const zoomLocation = gl.getUniformLocation(program, 'u_zoom');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const stride = 4 * Float32Array.BYTES_PER_ELEMENT;
    const screenPxRange = (atlas.distanceField.distanceRange * effectiveFontSize * viewport.zoom) / atlas.info.size;
    const hasStroke = Boolean(strokeColor && strokeWidth && strokeWidth > 0);
    const strokeWidthUniform = hasStroke ? ((strokeWidth as number) * viewport.zoom) / screenPxRange : 0;

    gl.useProgram(program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(textureLocation, 0);
    gl.uniform4fv(colorLocation, hexToRgbaFloat(color));
    gl.uniform4fv(strokeColorLocation, hexToRgbaFloat(hasStroke ? (strokeColor as string) : color));
    gl.uniform1f(screenPxRangeLocation, screenPxRange);
    gl.uniform1f(strokeWidthLocation, strokeWidthUniform);
    gl.uniform2f(viewportOffsetLocation, viewport.x, viewport.y);
    gl.uniform1f(zoomLocation, viewport.zoom);
    gl.uniform2f(resolutionLocation, canvasWidth, canvasHeight);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 4);
  }
};
