// others
import { DRAFT_FRAME_STROKE, VECTOR_STROKE_WIDTH, VECTOR_VERTEX_SIZE } from 'constant/canvas';

// types
import { TPenPreview } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawTangentHandle } from '../drawVectorEditHandlesLayer/drawVectorTangentHandles/drawTangentHandle';
import { drawVectorStroke } from 'utils/canvas/drawVectorNode/drawVectorStroke';
import { drawVertexPreviewDot } from './drawVertexPreviewDot';
import { flattenSegment } from 'utils/canvas/vectorNetwork/flattenSegment';
import { getVectorCurveSegmentCount } from 'utils/canvas/vectorNetwork/getVectorCurveSegmentCount';
import { rotatePoint } from 'utils/math/rotatePoint';

const ORIGIN: TPoint = { x: 0, y: 0 };

export const drawPenSegmentPreview = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  preview: TPenPreview,
  isDragArmable: boolean,
  pivot: TPoint,
  rotation: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const from = rotatePoint(preview.from, pivot, rotation);
  const to = rotatePoint(preview.to, pivot, rotation);
  const tangentFromOffset = preview.tangentFromOffset ? rotatePoint(preview.tangentFromOffset, ORIGIN, rotation) : null;

  if (from.x !== to.x || from.y !== to.y) {
    const points = flattenSegment(from, to, tangentFromOffset, null, getVectorCurveSegmentCount(from, to, tangentFromOffset, null));

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
  }

  if (tangentFromOffset) {
    const handle: TPoint = { x: from.x + tangentFromOffset.x, y: from.y + tangentFromOffset.y };

    drawTangentHandle(
      gl,
      program,
      buffer,
      from,
      handle,
      VECTOR_VERTEX_SIZE / viewport.zoom,
      false,
      false,
      canvasWidth,
      canvasHeight,
      viewport,
    );
  }

  drawVertexPreviewDot(gl, program, buffer, to, isDragArmable, canvasWidth, canvasHeight, viewport);
};
