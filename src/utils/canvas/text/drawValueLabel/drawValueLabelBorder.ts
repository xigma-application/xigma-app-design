// others
import { VALUE_LABEL_CORNER_RADIUS_PX, VALUE_LABEL_HOVER_BORDER_PX, VALUE_LABEL_HOVER_STROKE } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawRect } from '../../drawRect/drawRect';

export const drawValueLabelBorder = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  center: TPoint,
  badgeWidth: number,
  badgeHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  angleDeg: number,
): void => {
  const borderWidth = VALUE_LABEL_HOVER_BORDER_PX / viewport.zoom;

  drawRect(
    gl,
    program,
    buffer,
    {
      cornerRadius: VALUE_LABEL_CORNER_RADIUS_PX / viewport.zoom + borderWidth,
      fill: VALUE_LABEL_HOVER_STROKE,
      height: badgeHeight + borderWidth * 2,
      width: badgeWidth + borderWidth * 2,
      x: center.x - badgeWidth / 2 - borderWidth,
      y: center.y - badgeHeight / 2 - borderWidth,
    },
    canvasWidth,
    canvasHeight,
    viewport,
    angleDeg,
  );
};
