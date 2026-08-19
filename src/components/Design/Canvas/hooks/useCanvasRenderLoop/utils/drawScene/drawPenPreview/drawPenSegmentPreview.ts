// others
import { DRAFT_FRAME_STROKE, VECTOR_CURVE_SEGMENTS, VECTOR_STROKE_WIDTH } from 'constant/canvas';

// types
import { TPenPreview } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawVectorStroke } from 'utils/canvas/drawVectorNode/drawVectorStroke';
import { drawVertexPreviewDot } from './drawVertexPreviewDot';
import { flattenSegment } from 'utils/canvas/vectorNetwork/flattenSegment';
import { rotatePoint } from 'utils/math/rotatePoint';

const ORIGIN: TPoint = { x: 0, y: 0 };

export const drawPenSegmentPreview = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  preview: TPenPreview,
  pivot: TPoint,
  rotation: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const from = rotatePoint(preview.from, pivot, rotation);
  const to = rotatePoint(preview.to, pivot, rotation);
  const tangentFromOffset = preview.tangentFromOffset ? rotatePoint(preview.tangentFromOffset, ORIGIN, rotation) : null;
  const points = flattenSegment(from, to, tangentFromOffset, null, VECTOR_CURVE_SEGMENTS);

  drawVectorStroke(
    gl,
    program,
    buffer,
    [{ points, segmentId: 'preview' }],
    DRAFT_FRAME_STROKE,
    VECTOR_STROKE_WIDTH / viewport.zoom,
    canvasWidth,
    canvasHeight,
    viewport,
  );
  drawVertexPreviewDot(gl, program, buffer, to, canvasWidth, canvasHeight, viewport);
};
