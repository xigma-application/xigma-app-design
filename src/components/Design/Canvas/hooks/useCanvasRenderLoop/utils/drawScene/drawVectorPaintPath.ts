// others
import { VECTOR_LASSO_DASH_GAP_PX, VECTOR_LASSO_DASH_LENGTH_PX, VECTOR_SHAPE_BUILDER_STROKE } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawDashedPolylineOutline } from 'utils/canvas/drawDashedPolylineOutline/drawDashedPolylineOutline';

export const drawVectorPaintPath = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  path: TPoint[] | null,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (path) {
    drawDashedPolylineOutline(
      gl,
      program,
      buffer,
      path,
      false,
      VECTOR_SHAPE_BUILDER_STROKE,
      canvasWidth,
      canvasHeight,
      viewport,
      VECTOR_LASSO_DASH_LENGTH_PX,
      VECTOR_LASSO_DASH_GAP_PX,
    );
  }
};
