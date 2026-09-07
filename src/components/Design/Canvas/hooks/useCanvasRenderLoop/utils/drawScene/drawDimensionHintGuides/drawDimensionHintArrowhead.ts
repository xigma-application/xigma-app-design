// others
import { DIMENSION_HINT_GUIDE_ARROW_PX } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawLine } from 'utils/canvas/drawLine';

const SPREAD = Math.PI / 7;

export const drawDimensionHintArrowhead = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  tip: TPoint,
  from: TPoint,
  color: string,
  strokeWidth: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const angle = Math.atan2(tip.y - from.y, tip.x - from.x);
  const size = DIMENSION_HINT_GUIDE_ARROW_PX / viewport.zoom;

  [angle - SPREAD, angle + SPREAD].forEach((wingAngle) => {
    drawLine(
      gl,
      program,
      buffer,
      { x1: tip.x, x2: tip.x - Math.cos(wingAngle) * size, y1: tip.y, y2: tip.y - Math.sin(wingAngle) * size },
      color,
      strokeWidth,
      canvasWidth,
      canvasHeight,
      viewport,
    );
  });
};
