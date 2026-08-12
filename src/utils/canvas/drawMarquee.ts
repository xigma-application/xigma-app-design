// others
import { DRAFT_FRAME_STROKE, MARQUEE_FILL_ALPHA } from 'constant/canvas';

// types
import { TDraftRect } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawRect } from './drawRect';

export const drawMarquee = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  marqueeRect: TDraftRect | null | undefined,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (marqueeRect) {
    drawRect(
      gl,
      program,
      buffer,
      { ...marqueeRect, fill: DRAFT_FRAME_STROKE, fillAlpha: MARQUEE_FILL_ALPHA, stroke: DRAFT_FRAME_STROKE },
      canvasWidth,
      canvasHeight,
      viewport,
    );
  }
};
