// others
import { VECTOR_HANDLE_FILL, VECTOR_VERTEX_FILL, VECTOR_VERTEX_HOVER_SCALE } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { HANDLE_DIAMOND_ROTATION } from './drawHandleDiamond';
import { drawRect } from 'utils/canvas/drawRect/drawRect';

export const drawDefaultTangentHandleDot = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  handle: TPoint,
  dotSize: number,
  isHovered: boolean,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const size = isHovered ? dotSize * VECTOR_VERTEX_HOVER_SCALE : dotSize;

  drawRect(
    gl,
    program,
    buffer,
    { fill: VECTOR_VERTEX_FILL, height: size, stroke: VECTOR_HANDLE_FILL, width: size, x: handle.x - size / 2, y: handle.y - size / 2 },
    canvasWidth,
    canvasHeight,
    viewport,
    HANDLE_DIAMOND_ROTATION,
  );
};
