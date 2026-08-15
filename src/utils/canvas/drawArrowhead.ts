// others
import { ARROWHEAD_WING_ANGLE_DEGREES } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawEllipse } from './shapes/drawEllipse';
import { drawLine } from './drawLine';
import { rotatePoint } from 'utils/math/rotatePoint';

const ORIGIN: TPoint = { x: 0, y: 0 };

export const drawArrowhead = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  tip: TPoint,
  outwardDirection: TPoint,
  length: number,
  strokeWidth: number,
  color: string,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const backDirection: TPoint = { x: -outwardDirection.x, y: -outwardDirection.y };
  const wingEndpoints = [ARROWHEAD_WING_ANGLE_DEGREES, -ARROWHEAD_WING_ANGLE_DEGREES].map((angle) => {
    const wingDirection = rotatePoint(backDirection, ORIGIN, angle);

    return { x: tip.x + wingDirection.x * length, y: tip.y + wingDirection.y * length };
  });

  wingEndpoints.forEach((wingEndpoint) => {
    drawLine(
      gl,
      program,
      buffer,
      { x1: tip.x, x2: wingEndpoint.x, y1: tip.y, y2: wingEndpoint.y },
      color,
      strokeWidth,
      canvasWidth,
      canvasHeight,
      viewport,
    );
  });

  [tip, ...wingEndpoints].forEach((point) => {
    drawEllipse(
      gl,
      program,
      buffer,
      { fill: color, height: strokeWidth, width: strokeWidth, x: point.x - strokeWidth / 2, y: point.y - strokeWidth / 2 },
      canvasWidth,
      canvasHeight,
      viewport,
      0,
    );
  });
};
