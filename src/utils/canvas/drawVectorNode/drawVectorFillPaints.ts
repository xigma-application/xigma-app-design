// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TPaint } from 'types/design/paint/types';
import { TViewport } from 'types/design/types';

// utils
import { drawVectorFill } from './drawVectorFill';

export const drawVectorFillPaints = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  faceBufferCache: WeakMap<TPoint[], WebGLBuffer> | null,
  nodeBounds: TDraftRect | null,
  faces: TPoint[][],
  paints: TPaint[],
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  isAlphaWriteEnabled: boolean,
): void => {
  paints.forEach((paint) => {
    if (paint.visible !== false && paint.type === 'solid') {
      const alpha = paint.opacity / 100;

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
    }
  });
};
