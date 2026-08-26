// others
import { HOVER_OUTLINE_WIDTH, VECTOR_HANDLE_FILL } from 'constant/canvas';

// types
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { drawVectorStroke } from 'utils/canvas/drawVectorNode/drawVectorStroke';
import { flattenVectorSegmentById } from 'utils/canvas/vectorNetwork/flattenVectorSegmentById';
import { TFlattenedVectorSegment } from 'utils/canvas/vectorNetwork/flattenVectorSegments';

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
    .map((id) => flattenVectorSegmentById(node, id))
    .filter((segment): segment is TFlattenedVectorSegment => segment !== null);

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
