// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';

// types
import { TVectorMultiSelectResizeDragState } from 'types/design/selectionTool/types';
import { TViewport } from 'types/design/types';

// utils
import { drawRect } from 'utils/canvas/drawRect/drawRect';

export const drawVectorMultiSelectResizeDragBox = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  vectorMultiSelectResizeDrag: TVectorMultiSelectResizeDragState,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  drawRect(
    gl,
    program,
    buffer,
    { ...vectorMultiSelectResizeDrag.liveBounds, stroke: DRAFT_FRAME_STROKE },
    canvasWidth,
    canvasHeight,
    viewport,
    vectorMultiSelectResizeDrag.rotation,
  );
};
