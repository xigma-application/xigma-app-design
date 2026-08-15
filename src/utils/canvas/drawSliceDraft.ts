// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';

// types
import { TDraftRect } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawCornerHandles } from './drawCornerHandles';
import { drawRect } from './drawRect';

export const drawSliceDraft = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  sliceRect: (TDraftRect & { rotation: number }) | null | undefined,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (sliceRect) {
    drawRect(gl, program, buffer, { ...sliceRect, stroke: DRAFT_FRAME_STROKE }, canvasWidth, canvasHeight, viewport, sliceRect.rotation);
    drawCornerHandles(gl, program, buffer, sliceRect, DRAFT_FRAME_STROKE, canvasWidth, canvasHeight, viewport, sliceRect.rotation);
  }
};
