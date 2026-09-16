// others
import { CORNER_HANDLE_FILL, CORNER_HANDLE_SIZE } from 'constant/canvas';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawRect } from './drawRect/drawRect';
import { getRectEdgeMidpoints } from './getRectEdgeMidpoints';
import { rotatePoint } from 'utils/math/rotatePoint';

export const drawEdgeMidpointHandles = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  rect: TDraftRect,
  strokeColor: string,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  rotation: number,
): void => {
  const handleSize = CORNER_HANDLE_SIZE / viewport.zoom;
  const center: TPoint = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };

  getRectEdgeMidpoints(rect).forEach((midpoint) => {
    const rotatedMidpoint = rotatePoint(midpoint, center, rotation);

    drawRect(
      gl,
      program,
      buffer,
      {
        fill: CORNER_HANDLE_FILL,
        height: handleSize,
        stroke: strokeColor,
        width: handleSize,
        x: rotatedMidpoint.x - handleSize / 2,
        y: rotatedMidpoint.y - handleSize / 2,
      },
      canvasWidth,
      canvasHeight,
      viewport,
      rotation,
    );
  });
};
