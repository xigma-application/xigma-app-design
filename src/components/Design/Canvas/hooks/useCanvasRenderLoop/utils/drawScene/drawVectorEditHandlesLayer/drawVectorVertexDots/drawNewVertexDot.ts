// others
import { VECTOR_CUT_CROSSING_FILL, VECTOR_VERTEX_FILL, VECTOR_VERTEX_HOVER_SCALE } from 'constant/canvas';

// types
import { TVectorVertex, TViewport } from 'types/design/types';

// utils
import { drawEllipse } from 'utils/canvas/shapes/drawEllipse';

export const drawNewVertexDot = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  vertex: TVectorVertex,
  isHovered: boolean,
  baseSize: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const size = isHovered ? baseSize * VECTOR_VERTEX_HOVER_SCALE : baseSize;

  drawEllipse(
    gl,
    program,
    buffer,
    {
      fill: VECTOR_VERTEX_FILL,
      height: size,
      stroke: VECTOR_CUT_CROSSING_FILL,
      width: size,
      x: vertex.x - size / 2,
      y: vertex.y - size / 2,
    },
    canvasWidth,
    canvasHeight,
    viewport,
    0,
  );
};
