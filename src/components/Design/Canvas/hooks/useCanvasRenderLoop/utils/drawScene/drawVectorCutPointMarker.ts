// others
import { VECTOR_CUT_CROSSING_FILL, VECTOR_VERTEX_FILL, VECTOR_VERTEX_SIZE } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawEllipse } from 'utils/canvas/shapes/drawEllipse';

export const drawVectorCutPointMarker = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  point: TPoint,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const size = VECTOR_VERTEX_SIZE / viewport.zoom;

  drawEllipse(
    gl,
    program,
    buffer,
    { fill: VECTOR_VERTEX_FILL, height: size, stroke: VECTOR_CUT_CROSSING_FILL, width: size, x: point.x - size / 2, y: point.y - size / 2 },
    canvasWidth,
    canvasHeight,
    viewport,
    0,
  );
};
