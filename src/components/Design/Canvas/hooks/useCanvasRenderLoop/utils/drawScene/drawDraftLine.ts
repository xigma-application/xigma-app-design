// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';

// types
import { TDraftLine, TViewport } from 'types/design/types';

// utils
import { drawLineEndpointHandles } from 'utils/canvas/drawLineEndpointHandles';
import { drawVectorFill } from 'utils/canvas/drawVectorNode/drawVectorFill';
import { getBooleanStrokeColor } from 'utils/canvas/booleanOperation/getBooleanStrokeColor';
import { getLineStrokePolygon } from 'utils/canvas/shapes/getLineStrokePolygon';

const drawDraftLineStroke = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  draftShape: TDraftLine,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const polygon = getLineStrokePolygon(draftShape);
  const color = getBooleanStrokeColor(draftShape);

  if (polygon) {
    if (color) {
      drawVectorFill(gl, program, buffer, null, null, [polygon], color, canvasWidth, canvasHeight, viewport, true);
    }
  }
};

export const drawDraftLine = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  draftShape: TDraftLine,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  drawDraftLineStroke(gl, program, buffer, draftShape, canvasWidth, canvasHeight, viewport);
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
