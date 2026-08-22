// others
import { HOVER_OUTLINE_WIDTH, VECTOR_HANDLE_FILL, VECTOR_SEGMENT_HOVER_FILL_ALPHA } from 'constant/canvas';

// types
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { drawVectorStroke } from 'utils/canvas/drawVectorNode/drawVectorStroke';
import { flattenVectorSegments } from 'utils/canvas/vectorNetwork/flattenVectorSegments';

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
  const hoveredSegment = hoveredSegmentId
    ? flattenVectorSegments(node).find((segment) => segment.segmentId === hoveredSegmentId)
    : undefined;

  if (hoveredSegment) {
    drawVectorStroke(
      gl,
      program,
      buffer,
      [hoveredSegment],
      VECTOR_HANDLE_FILL,
      HOVER_OUTLINE_WIDTH / viewport.zoom,
      canvasWidth,
      canvasHeight,
      viewport,
      VECTOR_SEGMENT_HOVER_FILL_ALPHA,
    );
  }
};
