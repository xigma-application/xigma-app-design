// others
import { VALUE_LABEL_CORNER_RADIUS_PX } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawRect } from '../../drawRect/drawRect';

export const drawValueLabelBadge = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  center: TPoint,
  badgeWidth: number,
  badgeHeight: number,
  fill: string,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  angleDeg: number,
): void => {
  drawRect(
    gl,
    program,
    buffer,
    {
      cornerRadius: VALUE_LABEL_CORNER_RADIUS_PX / viewport.zoom,
      fill,
      height: badgeHeight,
      width: badgeWidth,
      x: center.x - badgeWidth / 2,
      y: center.y - badgeHeight / 2,
    },
    canvasWidth,
    canvasHeight,
    viewport,
    angleDeg,
  );
};
