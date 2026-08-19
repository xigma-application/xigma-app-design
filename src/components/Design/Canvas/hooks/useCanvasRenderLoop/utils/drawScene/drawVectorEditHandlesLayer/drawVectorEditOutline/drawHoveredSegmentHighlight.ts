// others
import { HOVER_OUTLINE_WIDTH, VECTOR_CURVE_SEGMENTS, VECTOR_EDGE_HOVER_STROKE } from 'constant/canvas';

// types
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { drawVectorStroke } from 'utils/canvas/drawVectorNode/drawVectorStroke';
import { drawVertexPreviewDot } from '../../drawPenPreview/drawVertexPreviewDot';
import { flattenSegment } from 'utils/canvas/vectorNetwork/flattenSegment';
import { getSegmentMidpoint } from 'utils/canvas/vectorNetwork/getSegmentMidpoint';

export const drawHoveredSegmentHighlight = (
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
    const points = flattenSegment(start, end, hoveredSegment.tangentStart, hoveredSegment.tangentEnd, VECTOR_CURVE_SEGMENTS);

    drawVectorStroke(
      gl,
      program,
      buffer,
      [{ points, segmentId: hoveredSegment.id }],
      VECTOR_EDGE_HOVER_STROKE,
      HOVER_OUTLINE_WIDTH / viewport.zoom,
      canvasWidth,
      canvasHeight,
      viewport,
    );

    drawVertexPreviewDot(
      gl,
      program,
      buffer,
      getSegmentMidpoint(start, end, hoveredSegment.tangentStart, hoveredSegment.tangentEnd),
      canvasWidth,
      canvasHeight,
      viewport,
    );
  }
};
