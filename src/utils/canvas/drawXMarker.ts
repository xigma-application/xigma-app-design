// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawLine } from './drawLine';
import { rotatePoint } from 'utils/math/rotatePoint';

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
  rotation = 0,
): void => {
  const corners = [
    { x: center.x - halfSize, y: center.y - halfSize },
    { x: center.x + halfSize, y: center.y + halfSize },
    { x: center.x - halfSize, y: center.y + halfSize },
    { x: center.x + halfSize, y: center.y - halfSize },
  ].map((corner) => rotatePoint(corner, center, rotation));

  drawLine(
    gl,
    program,
    buffer,
    { x1: corners[0].x, x2: corners[1].x, y1: corners[0].y, y2: corners[1].y },
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
    { x1: corners[2].x, x2: corners[3].x, y1: corners[2].y, y2: corners[3].y },
    color,
    strokeWidth,
    canvasWidth,
    canvasHeight,
    viewport,
  );
};
