// others
import { PENCIL_STROKE, PENCIL_STROKE_WIDTH } from '../../../../../constants';

// types
import { TFlattenedVectorSegment } from 'utils/canvas/vectorNetwork/flattenVectorSegments';
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawVectorStroke } from 'utils/canvas/drawVectorNode/drawVectorStroke';

export const drawRawPencilPreview = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  points: TPoint[] | null,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (points && points.length > 1) {
    const segment: TFlattenedVectorSegment = {
      endId: 'pencil-raw-preview-end',
      points,
      segmentId: 'pencil-raw-preview',
      startId: 'pencil-raw-preview-start',
    };

    drawVectorStroke(gl, program, buffer, [segment], PENCIL_STROKE, PENCIL_STROKE_WIDTH, canvasWidth, canvasHeight, viewport);
  }
};
