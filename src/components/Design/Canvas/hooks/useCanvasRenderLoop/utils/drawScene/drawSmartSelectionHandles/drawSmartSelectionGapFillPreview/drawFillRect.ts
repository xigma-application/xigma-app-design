// others
import { SMART_SELECTION_SWAP_HANDLE_FILL } from 'constant/canvas';

// types
import { TDraftRect } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawRect } from 'utils/canvas/drawRect/drawRect';

const FILL_ALPHA = 0.3;

export const drawFillRect = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  rect: TDraftRect,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  drawRect(
    gl,
    program,
    buffer,
    { ...rect, fill: SMART_SELECTION_SWAP_HANDLE_FILL, fillAlpha: FILL_ALPHA },
    canvasWidth,
    canvasHeight,
    viewport,
    0,
  );
};
