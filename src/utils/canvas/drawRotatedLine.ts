// types
import { TLineSegment, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawLine } from './drawLine';
import { rotatePoint } from 'utils/math/rotatePoint';

export const drawRotatedLine = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  line: TLineSegment,
  color: string,
  strokeWidth: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  rotation: number,
  rotationCenter: TPoint,
): void => {
  const p1 = rotatePoint({ x: line.x1, y: line.y1 }, rotationCenter, rotation);
  const p2 = rotatePoint({ x: line.x2, y: line.y2 }, rotationCenter, rotation);

  drawLine(gl, program, buffer, { x1: p1.x, x2: p2.x, y1: p1.y, y2: p2.y }, color, strokeWidth, canvasWidth, canvasHeight, viewport);
};
