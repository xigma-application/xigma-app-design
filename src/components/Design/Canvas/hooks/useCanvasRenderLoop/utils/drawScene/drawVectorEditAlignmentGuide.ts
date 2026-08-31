// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TViewport } from 'types/design/types';

// utils
import { drawAlignmentGuide } from './drawAlignmentGuide';

export const drawVectorEditAlignmentGuide = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  refs: TCanvasRefs,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  drawAlignmentGuide(gl, program, buffer, refs.vectorEdit.vectorAlignmentGuideRef.current, canvasWidth, canvasHeight, viewport);
};
