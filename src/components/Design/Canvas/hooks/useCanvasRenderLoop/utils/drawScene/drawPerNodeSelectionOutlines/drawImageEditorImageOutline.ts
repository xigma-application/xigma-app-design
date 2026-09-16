// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';

// types
import { TImageCrop } from 'types/design/paint/types';
import { TViewport } from 'types/design/types';

// utils
import { drawCornerHandles } from 'utils/canvas/drawCornerHandles';
import { drawRect } from 'utils/canvas/drawRect/drawRect';

export const drawImageEditorImageOutline = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  crop: TImageCrop,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  isActive: boolean,
): void => {
  const { height, rotation, width, x, y } = crop;

  drawRect(gl, program, buffer, { height, stroke: DRAFT_FRAME_STROKE, width, x, y }, canvasWidth, canvasHeight, viewport, rotation);

  if (isActive) {
    drawCornerHandles(gl, program, buffer, crop, DRAFT_FRAME_STROKE, canvasWidth, canvasHeight, viewport, rotation);
  }
};
