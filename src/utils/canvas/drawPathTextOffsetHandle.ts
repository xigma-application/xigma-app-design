// others
import { CORNER_HANDLE_FILL, CORNER_HANDLE_SIZE } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawEllipse } from './shapes/drawEllipse';

export const drawPathTextOffsetHandle = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  point: TPoint,
  strokeColor: string,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const handleSize = CORNER_HANDLE_SIZE / viewport.zoom;

  drawEllipse(
    gl,
    program,
    buffer,
    {
      fill: CORNER_HANDLE_FILL,
      height: handleSize,
      stroke: strokeColor,
      width: handleSize,
      x: point.x - handleSize / 2,
      y: point.y - handleSize / 2,
    },
    canvasWidth,
    canvasHeight,
    viewport,
    0,
  );
};
