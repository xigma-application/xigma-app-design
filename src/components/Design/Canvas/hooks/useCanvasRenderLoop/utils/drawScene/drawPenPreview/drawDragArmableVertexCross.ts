// others
import { VECTOR_EDGE_HOVER_STROKE } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawLine } from 'utils/canvas/drawLine';

const CROSS_RADIUS_RATIO = 0.25;
const CROSS_STROKE_RATIO = 0.12;

export const drawDragArmableVertexCross = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  point: TPoint,
  vertexSize: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const crossRadius = vertexSize * CROSS_RADIUS_RATIO;
  const strokeWidth = vertexSize * CROSS_STROKE_RATIO;

  drawLine(
    gl,
    program,
    buffer,
    { x1: point.x - crossRadius, x2: point.x + crossRadius, y1: point.y - crossRadius, y2: point.y + crossRadius },
    VECTOR_EDGE_HOVER_STROKE,
    strokeWidth,
    canvasWidth,
    canvasHeight,
    viewport,
  );
  drawLine(
    gl,
    program,
    buffer,
    { x1: point.x - crossRadius, x2: point.x + crossRadius, y1: point.y + crossRadius, y2: point.y - crossRadius },
    VECTOR_EDGE_HOVER_STROKE,
    strokeWidth,
    canvasWidth,
    canvasHeight,
    viewport,
  );
};
