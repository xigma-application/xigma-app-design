// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawRect } from 'utils/canvas/drawRect/drawRect';

export const HANDLE_DIAMOND_ROTATION = 45;

export const drawHandleDiamond = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  handle: TPoint,
  size: number,
  fill: string,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  drawRect(
    gl,
    program,
    buffer,
    { fill, height: size, width: size, x: handle.x - size / 2, y: handle.y - size / 2 },
    canvasWidth,
    canvasHeight,
    viewport,
    HANDLE_DIAMOND_ROTATION,
  );
};
