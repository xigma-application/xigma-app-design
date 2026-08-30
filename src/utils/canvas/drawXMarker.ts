// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawLine } from './drawLine';

export const drawXMarker = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  center: TPoint,
  halfSize: number,
  color: string,
  strokeWidth: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  drawLine(
    gl,
    program,
    buffer,
    { x1: center.x - halfSize, x2: center.x + halfSize, y1: center.y - halfSize, y2: center.y + halfSize },
    color,
    strokeWidth,
    canvasWidth,
    canvasHeight,
    viewport,
  );
  drawLine(
    gl,
    program,
    buffer,
    { x1: center.x - halfSize, x2: center.x + halfSize, y1: center.y + halfSize, y2: center.y - halfSize },
    color,
    strokeWidth,
    canvasWidth,
    canvasHeight,
    viewport,
  );
};
