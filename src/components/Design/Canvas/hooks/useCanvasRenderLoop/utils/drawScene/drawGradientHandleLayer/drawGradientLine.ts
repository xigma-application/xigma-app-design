// others
import { DIMENSION_HINT_GUIDE_BLUE } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawLine } from 'utils/canvas/drawLine';

export const drawGradientLine = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  start: TPoint,
  end: TPoint,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  drawLine(
    gl,
    program,
    buffer,
    { x1: start.x, y1: start.y, x2: end.x, y2: end.y },
    DIMENSION_HINT_GUIDE_BLUE,
    1 / viewport.zoom,
    canvasWidth,
    canvasHeight,
    viewport,
  );
};
