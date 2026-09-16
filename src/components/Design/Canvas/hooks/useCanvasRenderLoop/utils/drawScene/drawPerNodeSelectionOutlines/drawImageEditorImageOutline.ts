// others
import { DRAFT_FRAME_STROKE, IMAGE_EDITOR_GUIDE_OUTLINE_INNER, IMAGE_EDITOR_GUIDE_OUTLINE_OUTER } from 'constant/canvas';

// types
import { TImageCrop } from 'types/design/paint/types';
import { TViewport } from 'types/design/types';

// utils
import { drawCornerHandles } from 'utils/canvas/drawCornerHandles';
import { drawRect } from 'utils/canvas/drawRect/drawRect';

const drawGuideOutline = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  crop: TImageCrop,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const { height, rotation, width, x, y } = crop;
  const inset = 1 / viewport.zoom;

  drawRect(
    gl,
    program,
    buffer,
    { height, stroke: IMAGE_EDITOR_GUIDE_OUTLINE_OUTER, width, x, y },
    canvasWidth,
    canvasHeight,
    viewport,
    rotation,
  );
  drawRect(
    gl,
    program,
    buffer,
    { height: height - inset * 2, stroke: IMAGE_EDITOR_GUIDE_OUTLINE_INNER, width: width - inset * 2, x: x + inset, y: y + inset },
    canvasWidth,
    canvasHeight,
    viewport,
    rotation,
  );
};

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
  if (isActive) {
    const { height, rotation, width, x, y } = crop;

    drawRect(gl, program, buffer, { height, stroke: DRAFT_FRAME_STROKE, width, x, y }, canvasWidth, canvasHeight, viewport, rotation);
    drawCornerHandles(gl, program, buffer, crop, DRAFT_FRAME_STROKE, canvasWidth, canvasHeight, viewport, rotation);
  } else {
    drawGuideOutline(gl, program, buffer, crop, canvasWidth, canvasHeight, viewport);
  }
};
