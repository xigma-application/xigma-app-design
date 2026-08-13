// others
import { CORNER_HANDLE_FILL, CORNER_HANDLE_SIZE } from 'constant/canvas';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawRect } from './drawRect';
import { getRectCorners } from './getRectCorners';
import { rotatePoint } from 'utils/math/rotatePoint';

export const drawCornerHandles = (
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

  getRectCorners(rect).forEach((corner) => {
    const rotatedCorner = rotatePoint(corner, center, rotation);

    drawRect(
      gl,
      program,
      buffer,
      {
        fill: CORNER_HANDLE_FILL,
        height: handleSize,
        stroke: strokeColor,
        width: handleSize,
        x: rotatedCorner.x - handleSize / 2,
        y: rotatedCorner.y - handleSize / 2,
      },
      canvasWidth,
      canvasHeight,
      viewport,
      rotation,
    );
  });
};
