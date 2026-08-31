// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TViewport } from 'types/design/types';

// utils
import { drawAlignmentGuide } from './drawAlignmentGuide';

export const drawTransformAlignmentGuide = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  refs: TCanvasRefs,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  drawAlignmentGuide(gl, program, buffer, refs.transform.alignmentGuideRef.current, canvasWidth, canvasHeight, viewport);
};
