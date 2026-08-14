// types
import { TEllipseArcLengthSample, TPoint } from 'types/canvas';
import { TGlyphAtlasJson } from 'types/msdf';
import { TTextNode, TViewport } from 'types/design/types';

// utils
import { flipGlyphVertices } from './flipGlyphVertices';
import { getOrBuildTextGeometry, TTextGeometry } from './getOrBuildTextGeometry';
import { hexToRgbaFloat } from '../hexToRgbaFloat';
import { rotateVertices } from '../rotateVertices';

export const drawMsdfText = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  texture: WebGLTexture | null,
  atlas: TGlyphAtlasJson,
  cache: Map<string, TTextGeometry>,
  ellipseArcLengthCache: Map<string, TEllipseArcLengthSample[]>,
  node: TTextNode,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (texture) {
    const center: TPoint = { x: node.x + node.width / 2, y: node.y + node.height / 2 };
    const geometry = getOrBuildTextGeometry(atlas, cache, node, ellipseArcLengthCache);
    const vertices = rotateVertices(flipGlyphVertices(geometry.vertices, node), center, node.rotation);

    if (vertices.length > 0) {
      const positionLocation = gl.getAttribLocation(program, 'a_position');
      const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
      const textureLocation = gl.getUniformLocation(program, 'u_texture');
      const colorLocation = gl.getUniformLocation(program, 'u_color');
      const screenPxRangeLocation = gl.getUniformLocation(program, 'u_screenPxRange');
      const viewportOffsetLocation = gl.getUniformLocation(program, 'u_viewportOffset');
      const zoomLocation = gl.getUniformLocation(program, 'u_zoom');
      const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
      const stride = 4 * Float32Array.BYTES_PER_ELEMENT;
      const screenPxRange = (atlas.distanceField.distanceRange * geometry.effectiveFontSize * viewport.zoom) / atlas.info.size;

      gl.useProgram(program);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(textureLocation, 0);
      gl.uniform4fv(colorLocation, hexToRgbaFloat(node.fill));
      gl.uniform1f(screenPxRangeLocation, screenPxRange);
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
  }
};
