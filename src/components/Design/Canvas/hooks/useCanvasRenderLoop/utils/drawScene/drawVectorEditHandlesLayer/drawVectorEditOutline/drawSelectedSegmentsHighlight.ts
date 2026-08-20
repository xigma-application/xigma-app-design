// others
import { HOVER_OUTLINE_WIDTH, VECTOR_HANDLE_FILL } from 'constant/canvas';

// types
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { drawVectorStroke } from 'utils/canvas/drawVectorNode/drawVectorStroke';
import { flattenSegment } from 'utils/canvas/vectorNetwork/flattenSegment';
import { getVectorCurveSegmentCount } from 'utils/canvas/vectorNetwork/getVectorCurveSegmentCount';

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
  const flattened = selectedSegmentIds
    .map((segmentId) => node.segments[segmentId])
    .filter((segment) => segment !== undefined)
    .map((segment) => {
      const start = node.vertices[segment.startId];
      const end = node.vertices[segment.endId];

      return {
        endId: segment.endId,
        points: flattenSegment(
          start,
          end,
          segment.tangentStart,
          segment.tangentEnd,
          getVectorCurveSegmentCount(start, end, segment.tangentStart, segment.tangentEnd),
        ),
        segmentId: segment.id,
        startId: segment.startId,
      };
    });

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
