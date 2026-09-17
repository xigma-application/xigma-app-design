// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawImageStencilMask } from './drawImageStencilMask';
import { getImageFillPlaceholderVertices } from '../getImageFillPlaceholderVertices';
import { hexToRgbaFloat } from '../../hexToRgbaFloat';

// constant
import { IMAGE_FILL_PLACEHOLDER_COLOR_A, IMAGE_FILL_PLACEHOLDER_COLOR_B } from 'constant/canvas';

export const drawImagePlaceholder = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  faceBufferCache: WeakMap<TPoint[], WebGLBuffer> | null,
  faces: TPoint[][],
  bounds: TDraftRect,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  isAlphaWriteEnabled: boolean,
): void => {
  const positionLocation = gl.getAttribLocation(program, 'a_position');
  const colorLocation = gl.getUniformLocation(program, 'u_color');
  const viewportOffsetLocation = gl.getUniformLocation(program, 'u_viewportOffset');
  const zoomLocation = gl.getUniformLocation(program, 'u_zoom');
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  const { squaresA, squaresB } = getImageFillPlaceholderVertices(bounds);

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

  drawImageStencilMask(gl, positionLocation, faceBufferCache, buffer, faces);

  gl.colorMask(true, true, true, isAlphaWriteEnabled);
  gl.stencilFunc(gl.NOTEQUAL, 0, 0xff);
  gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(squaresA), gl.STATIC_DRAW);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.uniform4fv(colorLocation, hexToRgbaFloat(IMAGE_FILL_PLACEHOLDER_COLOR_A, 1));
  gl.drawArrays(gl.TRIANGLES, 0, squaresA.length / 2);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(squaresB), gl.STATIC_DRAW);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.uniform4fv(colorLocation, hexToRgbaFloat(IMAGE_FILL_PLACEHOLDER_COLOR_B, 1));
  gl.drawArrays(gl.TRIANGLES, 0, squaresB.length / 2);

  gl.disable(gl.STENCIL_TEST);
};
