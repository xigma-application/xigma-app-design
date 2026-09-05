// types
import { TDraftRect } from 'types/canvas';
import { TSmartSelectionGap } from 'types/design/smartSelection/types';
import { TViewport } from 'types/design/types';

// utils
import { drawFillRect } from './drawFillRect';

export const drawGapFill = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  gap: TSmartSelectionGap,
  axis: 'x' | 'y',
  extent: TDraftRect,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const half = gap.value / 2;
  const rect: TDraftRect =
    axis === 'x'
      ? { height: extent.height, width: gap.value, x: gap.midpoint.x - half, y: extent.y }
      : { height: gap.value, width: extent.width, x: extent.x, y: gap.midpoint.y - half };

  drawFillRect(gl, program, buffer, rect, canvasWidth, canvasHeight, viewport);
};
