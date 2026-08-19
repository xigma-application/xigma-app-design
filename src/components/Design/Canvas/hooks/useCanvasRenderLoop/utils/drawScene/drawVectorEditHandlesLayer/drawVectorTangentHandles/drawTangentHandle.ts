// others
import {
  VECTOR_EDIT_OUTLINE_STROKE,
  VECTOR_HANDLE_FILL,
  VECTOR_HANDLE_HOVER_STROKE,
  VECTOR_VERTEX_FILL,
  VECTOR_VERTEX_HOVER_SCALE,
} from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawLine } from 'utils/canvas/drawLine';
import { drawRect } from 'utils/canvas/drawRect/drawRect';

const HANDLE_DIAMOND_ROTATION = 45;

export const drawTangentHandle = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  vertex: TPoint,
  handle: TPoint,
  dotSize: number,
  isHovered: boolean,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const size = isHovered ? dotSize * VECTOR_VERTEX_HOVER_SCALE : dotSize;

  drawLine(
    gl,
    program,
    buffer,
    { x1: vertex.x, x2: handle.x, y1: vertex.y, y2: handle.y },
    isHovered ? VECTOR_HANDLE_HOVER_STROKE : VECTOR_EDIT_OUTLINE_STROKE,
    1 / viewport.zoom,
    canvasWidth,
    canvasHeight,
    viewport,
  );
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
