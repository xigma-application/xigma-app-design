// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TImageScaleMode } from 'types/design/paint/types';
import { TTextureSize } from '../getOrLoadTexture';
import { TViewport } from 'types/design/types';

// utils
import { getImageFillContainRect } from './getImageFillContainRect';
import { getImageFillCoverUv, TImageFillCoverUv } from './getImageFillCoverUv';
import { getImageFillPlaceholderVertices } from './getImageFillPlaceholderVertices';
import { getOrCreateFaceBuffer } from './getOrCreateFaceBuffer';
import { getRotatedFillUvCorner } from './getRotatedFillUvCorner';
import { getVectorFillBounds } from './getVectorFillBounds';
import { hexToRgbaFloat } from '../hexToRgbaFloat';

// constant
import { IMAGE_FILL_PLACEHOLDER_COLOR_A, IMAGE_FILL_PLACEHOLDER_COLOR_B } from 'constant/canvas';

const FULL_IMAGE_UV: TImageFillCoverUv = { uMax: 1, uMin: 0, vMax: 1, vMin: 0 };

const drawImageStencilMask = (
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

const getImageFillQuadVertices = (rect: TDraftRect, uv: TImageFillCoverUv, rotation: number): number[] => {
  const { height, width, x, y } = rect;
  const x1 = x;
  const y1 = y;
  const x2 = x + width;
  const y2 = y;
  const x3 = x + width;
  const y3 = y + height;
  const x4 = x;
  const y4 = y + height;
  const tl = getRotatedFillUvCorner(uv.uMin, uv.vMin, rotation);
  const tr = getRotatedFillUvCorner(uv.uMax, uv.vMin, rotation);
  const br = getRotatedFillUvCorner(uv.uMax, uv.vMax, rotation);
  const bl = getRotatedFillUvCorner(uv.uMin, uv.vMax, rotation);

  return [x1, y1, tl.u, tl.v, x2, y2, tr.u, tr.v, x3, y3, br.u, br.v, x1, y1, tl.u, tl.v, x3, y3, br.u, br.v, x4, y4, bl.u, bl.v];
};

const drawImageTexture = (
  gl: WebGL2RenderingContext,
  imageProgram: WebGLProgram,
  buffer: WebGLBuffer,
  faceBufferCache: WeakMap<TPoint[], WebGLBuffer> | null,
  faces: TPoint[][],
  bounds: TDraftRect,
  texture: WebGLTexture,
  imageSize: TTextureSize | undefined,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  isAlphaWriteEnabled: boolean,
  alpha: number,
  rotation: number,
  scaleMode: TImageScaleMode,
): void => {
  const isSideways = rotation === 90 || rotation === 270;
  const effectiveImageWidth = (isSideways ? imageSize?.height : imageSize?.width) ?? 0;
  const effectiveImageHeight = (isSideways ? imageSize?.width : imageSize?.height) ?? 0;
  const isFit = scaleMode === 'fit';
  const quadRect = isFit ? getImageFillContainRect(bounds, effectiveImageWidth, effectiveImageHeight) : bounds;
  const uv = isFit ? FULL_IMAGE_UV : getImageFillCoverUv(bounds.width, bounds.height, effectiveImageWidth, effectiveImageHeight);
  const positionLocation = gl.getAttribLocation(imageProgram, 'a_position');
  const texCoordLocation = gl.getAttribLocation(imageProgram, 'a_texCoord');
  const textureLocation = gl.getUniformLocation(imageProgram, 'u_texture');
  const opacityLocation = gl.getUniformLocation(imageProgram, 'u_opacity');
  const viewportOffsetLocation = gl.getUniformLocation(imageProgram, 'u_viewportOffset');
  const zoomLocation = gl.getUniformLocation(imageProgram, 'u_zoom');
  const resolutionLocation = gl.getUniformLocation(imageProgram, 'u_resolution');
  const stride = 4 * Float32Array.BYTES_PER_ELEMENT;

  gl.useProgram(imageProgram);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(textureLocation, 0);
  gl.uniform1f(opacityLocation, alpha);
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
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(getImageFillQuadVertices(quadRect, uv, rotation)), gl.STATIC_DRAW);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, stride, 0);
  gl.enableVertexAttribArray(texCoordLocation);
  gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  gl.disable(gl.STENCIL_TEST);
};

const drawImagePlaceholder = (
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

export const drawVectorImageFill = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  imageProgram: WebGLProgram,
  buffer: WebGLBuffer,
  faceBufferCache: WeakMap<TPoint[], WebGLBuffer> | null,
  nodeBounds: TDraftRect | null,
  faces: TPoint[][],
  texture: WebGLTexture | null,
  imageSize: TTextureSize | undefined,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  isAlphaWriteEnabled: boolean,
  alpha = 1,
  rotation = 0,
  scaleMode: TImageScaleMode = 'fill',
): void => {
  if (faces.length !== 0) {
    const bounds = getVectorFillBounds(faces, nodeBounds);

    if (texture) {
      drawImageTexture(
        gl,
        imageProgram,
        buffer,
        faceBufferCache,
        faces,
        bounds,
        texture,
        imageSize,
        canvasWidth,
        canvasHeight,
        viewport,
        isAlphaWriteEnabled,
        alpha,
        rotation,
        scaleMode,
      );
    } else {
      drawImagePlaceholder(gl, program, buffer, faceBufferCache, faces, bounds, canvasWidth, canvasHeight, viewport, isAlphaWriteEnabled);
    }
  }
};
