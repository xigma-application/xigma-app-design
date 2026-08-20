// others
import { HOVER_OUTLINE_WIDTH, VECTOR_HANDLE_FILL, VECTOR_SEGMENT_HOVER_FILL_ALPHA } from 'constant/canvas';

// types
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { drawVectorStroke } from 'utils/canvas/drawVectorNode/drawVectorStroke';
import { flattenSegment } from 'utils/canvas/vectorNetwork/flattenSegment';
import { getVectorCurveSegmentCount } from 'utils/canvas/vectorNetwork/getVectorCurveSegmentCount';

export const drawHoveredVectorSegmentHighlight = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  node: TVectorNode,
  hoveredSegmentId: string | null,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const hoveredSegment = hoveredSegmentId ? node.segments[hoveredSegmentId] : null;

  if (hoveredSegment) {
    const start = node.vertices[hoveredSegment.startId];
    const end = node.vertices[hoveredSegment.endId];
    const points = flattenSegment(
      start,
      end,
      hoveredSegment.tangentStart,
      hoveredSegment.tangentEnd,
      getVectorCurveSegmentCount(start, end, hoveredSegment.tangentStart, hoveredSegment.tangentEnd),
    );

    drawVectorStroke(
      gl,
      program,
      buffer,
      [{ endId: hoveredSegment.endId, points, segmentId: hoveredSegment.id, startId: hoveredSegment.startId }],
      VECTOR_HANDLE_FILL,
      HOVER_OUTLINE_WIDTH / viewport.zoom,
      canvasWidth,
      canvasHeight,
      viewport,
      VECTOR_SEGMENT_HOVER_FILL_ALPHA,
    );
  }
};
