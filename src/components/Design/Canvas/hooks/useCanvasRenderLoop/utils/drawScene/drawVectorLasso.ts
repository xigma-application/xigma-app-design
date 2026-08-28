// others
import { DRAFT_FRAME_STROKE, MARQUEE_FILL_ALPHA, VECTOR_LASSO_DASH_GAP_PX, VECTOR_LASSO_DASH_LENGTH_PX } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawDashedPolylineOutline } from 'utils/canvas/drawDashedPolylineOutline/drawDashedPolylineOutline';
import { drawVectorFill } from 'utils/canvas/drawVectorNode/drawVectorFill';

export const drawVectorLasso = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  path: TPoint[] | null,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (!path || path.length < 2) {
    return;
  }

  drawVectorFill(gl, program, buffer, null, [path], DRAFT_FRAME_STROKE, canvasWidth, canvasHeight, viewport, MARQUEE_FILL_ALPHA);
  drawDashedPolylineOutline(
    gl,
    program,
    buffer,
    path,
    true,
    DRAFT_FRAME_STROKE,
    canvasWidth,
    canvasHeight,
    viewport,
    VECTOR_LASSO_DASH_LENGTH_PX,
    VECTOR_LASSO_DASH_GAP_PX,
  );
};
