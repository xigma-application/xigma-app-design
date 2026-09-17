// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TImageAdjustments, TImageCrop, TImageScaleMode } from 'types/design/paint/types';
import { TTextureSize } from '../../getOrLoadTexture';
import { TViewport } from 'types/design/types';

// utils
import { drawImagePlaceholder } from './drawImagePlaceholder';
import { drawImageTexture } from './drawImageTexture';
import { getVectorFillBounds } from '../getVectorFillBounds';
import { TBoxFillRotation } from '../drawVectorPatternSourceTile';

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
  crop?: TImageCrop,
  flipX = false,
  flipY = false,
  boxRotation?: TBoxFillRotation,
  scale?: number,
  adjustments?: TImageAdjustments,
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
        crop,
        flipX,
        flipY,
        boxRotation,
        scale,
        adjustments,
      );
    } else {
      drawImagePlaceholder(gl, program, buffer, faceBufferCache, faces, bounds, canvasWidth, canvasHeight, viewport, isAlphaWriteEnabled);
    }
  }
};
