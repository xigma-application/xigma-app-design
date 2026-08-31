// others
import { VECTOR_LASSO_DASH_GAP_PX, VECTOR_LASSO_DASH_LENGTH_PX, VECTOR_SHAPE_BUILDER_STROKE } from 'constant/canvas';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TViewport } from 'types/design/types';

// utils
import { drawDashedPolylineOutline } from 'utils/canvas/drawDashedPolylineOutline/drawDashedPolylineOutline';
import { getRectCorners } from 'utils/canvas/getRectCorners';
import { toDraftRect } from 'components/Design/Canvas/utils/toDraftRect';

export const drawVectorShapeBuilderPath = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  refs: TCanvasRefs,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const path = refs.shapeBuilder.vectorShapeBuilderPathRef.current;
  const isBoxMode = refs.shapeBuilder.isVectorShapeBuilderBoxModeRef.current;

  if (path) {
    const points = isBoxMode ? getRectCorners(toDraftRect(path[0], path[path.length - 1])) : path;

    drawDashedPolylineOutline(
      gl,
      program,
      buffer,
      points,
      isBoxMode,
      VECTOR_SHAPE_BUILDER_STROKE,
      canvasWidth,
      canvasHeight,
      viewport,
      VECTOR_LASSO_DASH_LENGTH_PX,
      VECTOR_LASSO_DASH_GAP_PX,
    );
  }
};
