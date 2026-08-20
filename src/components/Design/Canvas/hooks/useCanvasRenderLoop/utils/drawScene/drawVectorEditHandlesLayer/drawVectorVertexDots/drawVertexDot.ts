// types
import { TViewport } from 'types/design/types';

// utils
import { drawEllipse } from 'utils/canvas/shapes/drawEllipse';

export const drawVertexDot = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  x: number,
  y: number,
  size: number,
  fill: string,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  drawEllipse(
    gl,
    program,
    buffer,
    { fill, height: size, width: size, x: x - size / 2, y: y - size / 2 },
    canvasWidth,
    canvasHeight,
    viewport,
    0,
  );
};
