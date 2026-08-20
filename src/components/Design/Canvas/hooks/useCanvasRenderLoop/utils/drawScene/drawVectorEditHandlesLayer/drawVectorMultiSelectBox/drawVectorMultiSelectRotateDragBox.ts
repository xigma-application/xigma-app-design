// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';

// types
import { TVectorMultiSelectRotateDragState } from 'types/design/selectionTool/types';
import { TViewport } from 'types/design/types';

// utils
import { drawRect } from 'utils/canvas/drawRect/drawRect';

export const drawVectorMultiSelectRotateDragBox = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  vectorMultiSelectRotateDrag: TVectorMultiSelectRotateDragState,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  drawRect(
    gl,
    program,
    buffer,
    { ...vectorMultiSelectRotateDrag.bounds, stroke: DRAFT_FRAME_STROKE },
    canvasWidth,
    canvasHeight,
    viewport,
    vectorMultiSelectRotateDrag.rotation + vectorMultiSelectRotateDrag.deltaDegrees,
    vectorMultiSelectRotateDrag.pivot,
  );
};
