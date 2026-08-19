// others
import { DRAFT_FRAME_STROKE, VECTOR_CURVE_SEGMENTS, VECTOR_SNAP_INDICATOR_RADIUS_PX, VECTOR_STROKE_WIDTH } from 'constant/canvas';

// types
import { TPenHoverVertex, TPenPreview } from 'types/design/canvas/types';
import { TViewport } from 'types/design/types';

// utils
import { drawEllipse } from 'utils/canvas/shapes/drawEllipse';
import { drawVectorStroke } from 'utils/canvas/drawVectorNode/drawVectorStroke';
import { flattenSegment } from 'utils/canvas/vectorNetwork/flattenSegment';

export const drawPenPreview = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  preview: TPenPreview | null,
  hoverVertex: TPenHoverVertex | null,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (preview) {
    const points = flattenSegment(preview.from, preview.to, preview.tangentFromOffset, null, VECTOR_CURVE_SEGMENTS);

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

  if (hoverVertex) {
    const radius = VECTOR_SNAP_INDICATOR_RADIUS_PX / viewport.zoom;

    drawEllipse(
      gl,
      program,
      buffer,
      {
        height: radius * 2,
        stroke: DRAFT_FRAME_STROKE,
        width: radius * 2,
        x: hoverVertex.point.x - radius,
        y: hoverVertex.point.y - radius,
      },
      canvasWidth,
      canvasHeight,
      viewport,
      0,
    );
  }
};
