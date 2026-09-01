// others
import { DISTANCE_GUIDE_STROKE, HOVER_OUTLINE_WIDTH } from 'constant/canvas';

// types
import { TDistanceGuides } from 'components/Design/Canvas/utils/getDistanceGuides/types';
import { TViewport } from 'types/design/types';

// utils
import { drawThickOutline } from 'utils/canvas/drawThickOutline/drawThickOutline';

export const drawDistanceGuideOutlines = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  guides: TDistanceGuides,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  [guides.activeRect, guides.targetRect].forEach((rect) => {
    if (rect) {
      drawThickOutline(gl, program, buffer, rect, DISTANCE_GUIDE_STROKE, HOVER_OUTLINE_WIDTH, canvasWidth, canvasHeight, viewport, 0);
    }
  });
};
