// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TPaint } from 'types/design/paint/types';
import { TViewport } from 'types/design/types';

// utils
import { drawVectorFill } from './drawVectorFill';
import { drawVectorGradientFill } from './drawVectorGradientFill';
import { drawVectorPatternFill } from './drawVectorPatternFill';
import { TPatternSourceTile } from './drawVectorPatternSourceTile';

export const drawVectorFillPaints = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  gradientProgram: WebGLProgram,
  patternTileProgram: WebGLProgram,
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
      } else if (paint.type !== 'image') {
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
