// others
import { DISTANCE_GUIDE_STROKE, VECTOR_VERTEX_FILL, VECTOR_VERTEX_HOVER_SCALE, VECTOR_VERTEX_SIZE } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawEllipse } from 'utils/canvas/shapes/drawEllipse';

export const drawDistanceGuideTargetDot = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  targetPoint: TPoint,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const size = (VECTOR_VERTEX_SIZE * VECTOR_VERTEX_HOVER_SCALE) / viewport.zoom;

  drawEllipse(
    gl,
    program,
    buffer,
    {
      fill: VECTOR_VERTEX_FILL,
      height: size,
      stroke: DISTANCE_GUIDE_STROKE,
      width: size,
      x: targetPoint.x - size / 2,
      y: targetPoint.y - size / 2,
    },
    canvasWidth,
    canvasHeight,
    viewport,
    0,
  );
};
