// others
import { HOVER_OUTLINE_WIDTH, VECTOR_EDIT_OUTLINE_STROKE } from 'constant/canvas';

// types
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { drawVectorStroke } from 'utils/canvas/drawVectorNode/drawVectorStroke';
import { flattenVectorSegments } from 'utils/canvas/vectorNetwork/flattenVectorSegments';

export const drawEditModeOutline = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  node: TVectorNode,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  drawVectorStroke(
    gl,
    program,
    buffer,
    flattenVectorSegments(node),
    VECTOR_EDIT_OUTLINE_STROKE,
    HOVER_OUTLINE_WIDTH / viewport.zoom,
    canvasWidth,
    canvasHeight,
    viewport,
  );
};
