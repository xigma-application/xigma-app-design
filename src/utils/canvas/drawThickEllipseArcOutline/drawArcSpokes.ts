// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawLine } from '../drawLine';

export const drawArcSpokes = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  firstSpokeStart: TPoint,
  firstRimPoint: TPoint,
  lastSpokeStart: TPoint,
  lastRimPoint: TPoint,
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
    { x1: firstSpokeStart.x, x2: firstRimPoint.x, y1: firstSpokeStart.y, y2: firstRimPoint.y },
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
    { x1: lastSpokeStart.x, x2: lastRimPoint.x, y1: lastSpokeStart.y, y2: lastRimPoint.y },
    color,
    strokeWidth,
    canvasWidth,
    canvasHeight,
    viewport,
  );
};
