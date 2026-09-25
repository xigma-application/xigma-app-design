// constant
import { IMAGE_PLACEHOLDER_TEXTURE_SIZE_PX } from 'constant/canvas';

// types
import { TDraftRect, TFillRule, TImageFilterQuality, TPoint } from 'types/canvas';
import { TImageAdjustments, TImageCrop, TImageScaleMode } from 'types/design/paint/types';
import { TViewport } from 'types/design/types';

// utils
import { drawImagePlaceholder } from './drawImagePlaceholder';
import { drawImageTexture } from './drawImageTexture';
import { getOrCreateImagePlaceholderTexture } from './getOrCreateImagePlaceholderTexture';
import { getOrLoadTexture, TTextureSize } from '../../getOrLoadTexture';
import { getVectorFillBounds } from '../getVectorFillBounds';
import { TBoxFillRotation } from '../drawVectorPatternSourceTile';

const IMAGE_PLACEHOLDER_TEXTURE_SIZE: TTextureSize = {
  height: IMAGE_PLACEHOLDER_TEXTURE_SIZE_PX,
  width: IMAGE_PLACEHOLDER_TEXTURE_SIZE_PX,
};

export const drawVectorImageFill = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  imageProgram: WebGLProgram,
  buffer: WebGLBuffer,
  faceBufferCache: WeakMap<TPoint[], WebGLBuffer> | null,
  nodeBounds: TDraftRect | null,
  faces: TPoint[][],
  ref: string,
  imageTextureCache: Map<string, WebGLTexture>,
  imageTextureSizeCache: Map<string, TTextureSize>,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  isAlphaWriteEnabled: boolean,
  alpha = 1,
  imageFilterQuality: TImageFilterQuality | undefined = 'basic',
  rotation = 0,
  scaleMode: TImageScaleMode = 'fill',
  crop?: TImageCrop,
  flipX = false,
  flipY = false,
  boxRotation?: TBoxFillRotation,
  scale?: number,
  adjustments?: TImageAdjustments,
  fillRule: TFillRule = 'evenOdd',
): void => {
  if (faces.length !== 0) {
    const bounds = getVectorFillBounds(faces, nodeBounds);
    const imageSize = ref ? imageTextureSizeCache.get(ref) : IMAGE_PLACEHOLDER_TEXTURE_SIZE;
    const texture = ref
      ? getOrLoadTexture(gl, imageTextureCache, ref, imageTextureSizeCache)
      : getOrCreateImagePlaceholderTexture(gl, imageTextureCache);

    if (texture) {
      // the placeholder texture never gets a mipmap chain generated, so it must never be sampled with a mipmap filter
      const resolvedFilterQuality: TImageFilterQuality = ref ? imageFilterQuality : 'basic';

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
        resolvedFilterQuality,
        rotation,
        scaleMode,
        crop,
        flipX,
        flipY,
        boxRotation,
        scale,
        adjustments,
        fillRule,
      );
    } else {
      drawImagePlaceholder(
        gl,
        program,
        buffer,
        faceBufferCache,
        faces,
        bounds,
        canvasWidth,
        canvasHeight,
        viewport,
        isAlphaWriteEnabled,
        fillRule,
      );
    }
  }
};
