// others
import { DRAFT_FRAME_STROKE, VECTOR_VERTEX_FILL, VECTOR_VERTEX_SIZE } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawDragArmableVertexCross } from './drawDragArmableVertexCross';
import { drawEllipse } from 'utils/canvas/shapes/drawEllipse';

export const drawVertexPreviewDot = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  point: TPoint,
  isDragArmable: boolean,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const vertexSize = VECTOR_VERTEX_SIZE / viewport.zoom;

  drawEllipse(
    gl,
    program,
    buffer,
    {
      fill: VECTOR_VERTEX_FILL,
      height: vertexSize,
      stroke: DRAFT_FRAME_STROKE,
      width: vertexSize,
      x: point.x - vertexSize / 2,
      y: point.y - vertexSize / 2,
    },
    canvasWidth,
    canvasHeight,
    viewport,
    0,
  );

  if (isDragArmable) {
    drawDragArmableVertexCross(gl, program, buffer, point, vertexSize, canvasWidth, canvasHeight, viewport);
  }
};
