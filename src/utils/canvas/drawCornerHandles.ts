// others
import { CORNER_HANDLE_FILL, CORNER_HANDLE_SIZE } from 'constant/canvas';

// types
import { TDraftRect } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawRect } from './drawRect';
import { getRectCorners } from './getRectCorners';

export const drawCornerHandles = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  rect: TDraftRect,
  strokeColor: string,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const handleSize = CORNER_HANDLE_SIZE / viewport.zoom;

  getRectCorners(rect).forEach((corner) => {
    drawRect(
      gl,
      program,
      buffer,
      {
        fill: CORNER_HANDLE_FILL,
        height: handleSize,
        stroke: strokeColor,
        width: handleSize,
        x: corner.x - handleSize / 2,
        y: corner.y - handleSize / 2,
      },
      canvasWidth,
      canvasHeight,
      viewport,
    );
  });
};
