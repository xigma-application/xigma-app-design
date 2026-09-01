// others
import { DISTANCE_GUIDE_DASH_GAP_PX, DISTANCE_GUIDE_DASH_LENGTH_PX, DISTANCE_GUIDE_STROKE } from 'constant/canvas';

// types
import { TDistanceGuideLine } from 'components/Design/Canvas/utils/getDistanceGuides/types';
import { TViewport } from 'types/design/types';

// utils
import { drawDashedLine } from 'utils/canvas/drawDashedLine';
import { drawLine } from 'utils/canvas/drawLine';

export const drawDistanceGuideLine = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  line: TDistanceGuideLine,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const strokeWidth = 1 / viewport.zoom;

  if (line.dashed) {
    drawDashedLine(
      gl,
      program,
      buffer,
      line,
      DISTANCE_GUIDE_STROKE,
      strokeWidth,
      canvasWidth,
      canvasHeight,
      viewport,
      DISTANCE_GUIDE_DASH_LENGTH_PX,
      DISTANCE_GUIDE_DASH_GAP_PX,
    );
  } else {
    drawLine(gl, program, buffer, line, DISTANCE_GUIDE_STROKE, strokeWidth, canvasWidth, canvasHeight, viewport);
  }
};
