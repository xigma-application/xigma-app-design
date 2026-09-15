// constant
import { PATTERN_PLACEHOLDER_DOT_COLOR } from 'constant/canvas';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TPatternPaint } from 'types/design/paint/types';
import { TViewport } from 'types/design/types';

// utils
import { drawVectorPatternSourceTile, TPatternSourceTile } from './drawVectorPatternSourceTile';
import { getOrCreateFaceBuffer } from './getOrCreateFaceBuffer';
import { getPatternPlaceholderDotVertices } from './getPatternPlaceholderDotVertices';
import { getVectorFillBounds } from './getVectorFillBounds';
import { hexToRgbaFloat } from '../hexToRgbaFloat';

const drawPatternStencilMask = (
  gl: WebGL2RenderingContext,
  positionLocation: number,
  faceBufferCache: WeakMap<TPoint[], WebGLBuffer> | null,
  buffer: WebGLBuffer,
  faces: TPoint[][],
): void => {
  faces.forEach((face: TPoint[]) => {
    getOrCreateFaceBuffer(gl, faceBufferCache, buffer, face);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, face.length);
  });
};

const drawPatternPlaceholderDots = (
  gl: WebGL2RenderingContext,
  positionLocation: number,
  colorLocation: WebGLUniformLocation | null,
  buffer: WebGLBuffer,
  bounds: TDraftRect,
  alpha: number,
): void => {
  const dotVertices = getPatternPlaceholderDotVertices(bounds);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dotVertices), gl.STATIC_DRAW);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.uniform4fv(colorLocation, hexToRgbaFloat(PATTERN_PLACEHOLDER_DOT_COLOR, alpha));
  gl.drawArrays(gl.TRIANGLES, 0, dotVertices.length / 2);
};

export const drawVectorPatternFill = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  patternTileProgram: WebGLProgram,
  buffer: WebGLBuffer,
  faceBufferCache: WeakMap<TPoint[], WebGLBuffer> | null,
  nodeBounds: TDraftRect | null,
  faces: TPoint[][],
  sourceTile: TPatternSourceTile | null,
  paint: TPatternPaint,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  isAlphaWriteEnabled: boolean,
  alpha = 1,
): void => {
  if (faces.length !== 0) {
    if (sourceTile) {
      drawVectorPatternSourceTile(
        gl,
        patternTileProgram,
        buffer,
        faceBufferCache,
        nodeBounds,
        faces,
        sourceTile,
        paint,
        canvasWidth,
        canvasHeight,
        viewport,
        isAlphaWriteEnabled,
        alpha,
      );
    } else {
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

      gl.clear(gl.STENCIL_BUFFER_BIT);
      gl.enable(gl.STENCIL_TEST);
      gl.colorMask(false, false, false, false);
      gl.stencilFunc(gl.ALWAYS, 1, 0xff);
      gl.stencilOp(gl.KEEP, gl.KEEP, gl.INVERT);

      drawPatternStencilMask(gl, positionLocation, faceBufferCache, buffer, faces);

      gl.colorMask(true, true, true, isAlphaWriteEnabled);
      gl.stencilFunc(gl.NOTEQUAL, 0, 0xff);
      gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);

      drawPatternPlaceholderDots(gl, positionLocation, colorLocation, buffer, getVectorFillBounds(faces, nodeBounds), alpha);

      gl.disable(gl.STENCIL_TEST);
    }
  }
};
