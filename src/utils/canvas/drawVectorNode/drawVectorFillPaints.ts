// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TPaint } from 'types/design/paint/types';
import { TViewport } from 'types/design/types';

// utils
import { drawVectorFill } from './drawVectorFill';
import { drawVectorGradientFill } from './drawVectorGradientFill';
import { drawVectorImageFill } from './drawVectorImageFill';
import { drawVectorPatternFill } from './drawVectorPatternFill';
import { getOrLoadTexture, TTextureSize } from '../getOrLoadTexture';
import { TPatternSourceTile } from './drawVectorPatternSourceTile';

export const drawVectorFillPaints = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  gradientProgram: WebGLProgram,
  patternTileProgram: WebGLProgram,
  imageProgram: WebGLProgram,
  imageTextureCache: Map<string, WebGLTexture>,
  imageTextureSizeCache: Map<string, TTextureSize>,
  buffer: WebGLBuffer,
  faceBufferCache: WeakMap<TPoint[], WebGLBuffer> | null,
  nodeBounds: TDraftRect | null,
  faces: TPoint[][],
  paints: TPaint[],
  patternSourceTiles: (TPatternSourceTile | null)[],
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  isAlphaWriteEnabled: boolean,
): void => {
  paints.forEach((paint, index) => {
    if (paint.visible !== false) {
      const alpha = paint.opacity / 100;

      if (paint.type === 'solid') {
        drawVectorFill(
          gl,
          program,
          buffer,
          faceBufferCache,
          nodeBounds,
          faces,
          paint.color,
          canvasWidth,
          canvasHeight,
          viewport,
          isAlphaWriteEnabled,
          alpha,
        );
      } else if (paint.type === 'pattern') {
        drawVectorPatternFill(
          gl,
          program,
          patternTileProgram,
          buffer,
          faceBufferCache,
          nodeBounds,
          faces,
          patternSourceTiles[index] ?? null,
          paint,
          canvasWidth,
          canvasHeight,
          viewport,
          isAlphaWriteEnabled,
          alpha,
        );
      } else if (paint.type === 'image') {
        drawVectorImageFill(
          gl,
          program,
          imageProgram,
          buffer,
          faceBufferCache,
          nodeBounds,
          faces,
          paint.ref ? getOrLoadTexture(gl, imageTextureCache, paint.ref, imageTextureSizeCache) : null,
          imageTextureSizeCache.get(paint.ref),
          canvasWidth,
          canvasHeight,
          viewport,
          isAlphaWriteEnabled,
          alpha,
          paint.rotation,
          paint.scaleMode,
        );
      } else {
        drawVectorGradientFill(
          gl,
          gradientProgram,
          buffer,
          faceBufferCache,
          nodeBounds,
          faces,
          paint,
          canvasWidth,
          canvasHeight,
          viewport,
          isAlphaWriteEnabled,
          alpha,
        );
      }
    }
  });
};
