// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TViewport } from 'types/design/types';

// utils
import { drawRawPencilPreview } from './drawRawPencilPreview';
import { drawSmoothedPencilPreview } from './drawSmoothedPencilPreview';

export const drawPencilPreview = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  refs: TCanvasRefs,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const previewPoints = refs.pencil.pencilPreviewPointsRef.current;
  const rawPreviewPoints = refs.pencil.pencilRawPreviewPointsRef.current;
  const showRawPreview = refs.pencil.pencilShowRawPreviewRef.current;

  if (showRawPreview) {
    drawRawPencilPreview(gl, program, buffer, rawPreviewPoints, canvasWidth, canvasHeight, viewport);
  } else {
    drawSmoothedPencilPreview(gl, program, buffer, previewPoints, canvasWidth, canvasHeight, viewport);
  }
};
