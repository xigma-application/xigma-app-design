// others
import { VECTOR_LASSO_DASH_GAP_PX, VECTOR_LASSO_DASH_LENGTH_PX, VECTOR_SHAPE_BUILDER_STROKE } from 'constant/canvas';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './types';

// utils
import { drawDashedPolylineOutline } from 'utils/canvas/drawDashedPolylineOutline/drawDashedPolylineOutline';

export const drawVectorPaintPath = (context: TDrawSceneContext, refs: TCanvasRefs, canvasWidth: number, canvasHeight: number): void => {
  const { buffer, gl, program, viewport } = context;
  const path = refs.vectorPaint.vectorPaintPathRef.current;

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
