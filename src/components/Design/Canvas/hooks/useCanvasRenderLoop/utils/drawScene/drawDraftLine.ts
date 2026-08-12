// others
import { DRAFT_FRAME_STROKE, LINE_RENDER_STROKE_WIDTH } from 'constant/canvas';

// types
import { TDraftLine, TViewport } from 'types/design/types';

// utils
import { drawLine } from 'utils/canvas/drawLine';
import { drawLineEndpointHandles } from 'utils/canvas/drawLineEndpointHandles';

export const drawDraftLine = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  draftShape: TDraftLine,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  drawLine(gl, program, buffer, draftShape, draftShape.stroke, LINE_RENDER_STROKE_WIDTH, canvasWidth, canvasHeight, viewport);
  drawLineEndpointHandles(
    gl,
    program,
    buffer,
    [
      { x: draftShape.x1, y: draftShape.y1 },
      { x: draftShape.x2, y: draftShape.y2 },
    ],
    DRAFT_FRAME_STROKE,
    canvasWidth,
    canvasHeight,
    viewport,
  );
};
