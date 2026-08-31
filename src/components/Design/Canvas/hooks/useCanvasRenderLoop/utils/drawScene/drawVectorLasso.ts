// others
import { DRAFT_FRAME_STROKE, MARQUEE_FILL_ALPHA, VECTOR_LASSO_DASH_GAP_PX, VECTOR_LASSO_DASH_LENGTH_PX } from 'constant/canvas';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TViewport } from 'types/design/types';

// utils
import { drawDashedPolylineOutline } from 'utils/canvas/drawDashedPolylineOutline/drawDashedPolylineOutline';
import { drawVectorFill } from 'utils/canvas/drawVectorNode/drawVectorFill';

export const drawVectorLasso = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  refs: TCanvasRefs,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const path = refs.lassoMarquee.vectorLassoPathRef.current;

  if (!path || path.length < 2) {
    return;
  }

  drawVectorFill(gl, program, buffer, null, null, [path], DRAFT_FRAME_STROKE, canvasWidth, canvasHeight, viewport, MARQUEE_FILL_ALPHA);
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
