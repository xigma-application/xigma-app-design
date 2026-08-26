// others
import { HOVER_OUTLINE_WIDTH, VECTOR_HANDLE_FILL } from 'constant/canvas';

// types
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { drawVectorStroke } from 'utils/canvas/drawVectorNode/drawVectorStroke';
import { flattenVectorSegments } from 'utils/canvas/vectorNetwork/flattenVectorSegments';

export const drawSelectedSegmentsHighlight = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  node: TVectorNode,
  selectedSegmentIds: string[],
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const selectedSegmentIdSet = new Set(selectedSegmentIds);
  const flattened = flattenVectorSegments(node).filter((segment) => selectedSegmentIdSet.has(segment.segmentId));

  if (flattened.length > 0) {
    drawVectorStroke(
      gl,
      program,
      buffer,
      flattened,
      VECTOR_HANDLE_FILL,
      HOVER_OUTLINE_WIDTH / viewport.zoom,
      canvasWidth,
      canvasHeight,
      viewport,
    );
  }
};
