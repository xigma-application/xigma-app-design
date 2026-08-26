// others
import { HOVER_OUTLINE_WIDTH, VECTOR_EDGE_HOVER_STROKE } from 'constant/canvas';

// types
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { drawVectorStroke } from 'utils/canvas/drawVectorNode/drawVectorStroke';
import { drawVertexPreviewDot } from '../../drawPenPreview/drawVertexPreviewDot';
import { flattenVectorSegmentById } from 'utils/canvas/vectorNetwork/flattenVectorSegmentById';
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
  const hoveredSegment = hoveredSegmentId ? flattenVectorSegmentById(node, hoveredSegmentId) : null;

  if (hoveredSegment) {
    const segment = node.segments[hoveredSegment.segmentId];
    const start = node.vertices[hoveredSegment.startId];
    const end = node.vertices[hoveredSegment.endId];

    drawVectorStroke(
      gl,
      program,
      buffer,
      [hoveredSegment],
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
      getSegmentMidpoint(start, end, segment.tangentStart, segment.tangentEnd),
      false,
      canvasWidth,
      canvasHeight,
      viewport,
    );
  }
};
