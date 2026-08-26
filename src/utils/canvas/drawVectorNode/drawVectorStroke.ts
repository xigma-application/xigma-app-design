// types
import { TViewport } from 'types/design/types';

// utils
import { drawVectorThickStrokeVertices } from './drawVectorThickStrokeVertices';
import { getThickVectorPathVertices } from '../vectorNetwork/getThickVectorPathVertices/getThickVectorPathVertices';
import { TFlattenedVectorSegment } from '../vectorNetwork/flattenVectorSegments';

export const drawVectorStroke = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  segments: TFlattenedVectorSegment[],
  color: string,
  strokeWidth: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  alpha = 1,
): void => {
  const vertices = getThickVectorPathVertices(segments, strokeWidth / 2);

  drawVectorThickStrokeVertices(gl, program, buffer, vertices, color, canvasWidth, canvasHeight, viewport, alpha);
};
