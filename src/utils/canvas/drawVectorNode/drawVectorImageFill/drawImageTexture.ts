// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TImageCrop, TImageScaleMode } from 'types/design/paint/types';
import { TTextureSize } from '../../getOrLoadTexture';
import { TViewport } from 'types/design/types';

// others
import { IMAGE_FILL_DEFAULT_TILE_SCALE } from 'constant/canvas';

// utils
import { drawImageStencilMask } from './drawImageStencilMask';
import { getFlippedImageFillUv } from '../getFlippedImageFillUv';
import { getImageFillContainRect } from '../getImageFillContainRect';
import { getImageFillCoverUv, TImageFillCoverUv } from '../getImageFillCoverUv';
import { getImageFillQuadVertices } from '../getImageFillQuadVertices';
import { getImageFillTileUv } from '../getImageFillTileUv';
import { TBoxFillRotation } from '../drawVectorPatternSourceTile';

const FULL_IMAGE_UV: TImageFillCoverUv = { uMax: 1, uMin: 0, vMax: 1, vMin: 0 };

type TImageFillUvMode = 'cover' | 'crop' | 'fit' | 'tile';

const getImageFillUvMode = (crop: TImageCrop | undefined, isFit: boolean, isTile: boolean): TImageFillUvMode => {
  switch (true) {
    case Boolean(crop):
      return 'crop';
    case isFit:
      return 'fit';
    case isTile:
      return 'tile';
    default:
      return 'cover';
  }
};

const getImageFillUv = (
  crop: TImageCrop | undefined,
  isFit: boolean,
  isTile: boolean,
  effectiveBounds: TDraftRect,
  effectiveImageWidth: number,
  effectiveImageHeight: number,
  scale: number,
): TImageFillCoverUv => {
  switch (getImageFillUvMode(crop, isFit, isTile)) {
    case 'crop':
    case 'fit':
      return FULL_IMAGE_UV;
    case 'tile':
      return getImageFillTileUv(effectiveBounds.width, effectiveBounds.height, effectiveImageWidth, effectiveImageHeight, scale);
    default:
      return getImageFillCoverUv(effectiveBounds.width, effectiveBounds.height, effectiveImageWidth, effectiveImageHeight);
  }
};

export const drawImageTexture = (
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
  crop: TImageCrop | undefined,
  flipX: boolean,
  flipY: boolean,
  boxRotation?: TBoxFillRotation,
  scale = IMAGE_FILL_DEFAULT_TILE_SCALE,
): void => {
  const isSideways = rotation === 90 || rotation === 270;
  const effectiveImageWidth = (isSideways ? imageSize?.height : imageSize?.width) ?? 0;
  const effectiveImageHeight = (isSideways ? imageSize?.width : imageSize?.height) ?? 0;
  const isFit = scaleMode === 'fit';
  const isTile = scaleMode === 'tile';
  const effectiveBounds = !crop && boxRotation ? boxRotation.localBounds : bounds;
  const quadRotation = crop ? crop.rotation : (boxRotation?.degrees ?? 0);
  const quadRect = crop ?? (isFit ? getImageFillContainRect(effectiveBounds, effectiveImageWidth, effectiveImageHeight) : effectiveBounds);
  const imageUv = getImageFillUv(crop, isFit, isTile, effectiveBounds, effectiveImageWidth, effectiveImageHeight, scale);
  const uv = getFlippedImageFillUv(imageUv, flipX, flipY);
  const wrapMode = isTile ? gl.REPEAT : gl.CLAMP_TO_EDGE;
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
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapMode);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapMode);
  gl.uniform1i(textureLocation, 0);
  gl.uniform1f(opacityLocation, alpha);
  gl.uniform2f(viewportOffsetLocation, viewport.x, viewport.y);
  gl.uniform1f(zoomLocation, viewport.zoom);
  gl.uniform2f(resolutionLocation, canvasWidth, canvasHeight);
  gl.enableVertexAttribArray(positionLocation);
  gl.disableVertexAttribArray(texCoordLocation);

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
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(getImageFillQuadVertices(quadRect, uv, rotation, quadRotation)), gl.STATIC_DRAW);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, stride, 0);
  gl.enableVertexAttribArray(texCoordLocation);
  gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  gl.disable(gl.STENCIL_TEST);
};
