// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawRawPencilPreview } from './drawRawPencilPreview';
import { drawSmoothedPencilPreview } from './drawSmoothedPencilPreview';

export const drawPencilPreview = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  previewPoints: TPoint[] | null,
  rawPreviewPoints: TPoint[] | null,
  showRawPreview: boolean,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (showRawPreview) {
    drawRawPencilPreview(gl, program, buffer, rawPreviewPoints, canvasWidth, canvasHeight, viewport);
  } else {
    drawSmoothedPencilPreview(gl, program, buffer, previewPoints, canvasWidth, canvasHeight, viewport);
  }
};
