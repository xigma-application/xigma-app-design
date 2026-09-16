// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TTextureSize } from '../getOrLoadTexture';
import { TViewport } from 'types/design/types';

// utils
import { getImageFillCoverUv } from './getImageFillCoverUv';
import { getOrCreateFaceBuffer } from './getOrCreateFaceBuffer';
import { getRotatedFillUvCorner } from './getRotatedFillUvCorner';
import { getVectorFillBounds } from './getVectorFillBounds';

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

const getCoveringImageQuadVertices = (bounds: TDraftRect, uv: ReturnType<typeof getImageFillCoverUv>, rotation: number): number[] => {
  const { height, width, x, y } = bounds;
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

export const drawVectorImageFill = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
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
): void => {
  if (faces.length !== 0 && texture) {
    const bounds = getVectorFillBounds(faces, nodeBounds);
    const isSideways = rotation === 90 || rotation === 270;
    const effectiveImageWidth = (isSideways ? imageSize?.height : imageSize?.width) ?? 0;
    const effectiveImageHeight = (isSideways ? imageSize?.width : imageSize?.height) ?? 0;
    const uv = getImageFillCoverUv(bounds.width, bounds.height, effectiveImageWidth, effectiveImageHeight);
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
    const textureLocation = gl.getUniformLocation(program, 'u_texture');
    const opacityLocation = gl.getUniformLocation(program, 'u_opacity');
    const viewportOffsetLocation = gl.getUniformLocation(program, 'u_viewportOffset');
    const zoomLocation = gl.getUniformLocation(program, 'u_zoom');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const stride = 4 * Float32Array.BYTES_PER_ELEMENT;

    gl.useProgram(program);
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
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(getCoveringImageQuadVertices(bounds, uv, rotation)), gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.disable(gl.STENCIL_TEST);
  }
};
