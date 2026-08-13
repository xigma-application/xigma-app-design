// others
import { CORNER_HANDLE_FILL, CORNER_HANDLE_SIZE } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawRect } from './drawRect';

export const drawLineEndpointHandles = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  endpoints: [TPoint, TPoint],
  strokeColor: string,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const handleSize = CORNER_HANDLE_SIZE / viewport.zoom;

  endpoints.forEach((endpoint) => {
    drawRect(
      gl,
      program,
      buffer,
      {
        fill: CORNER_HANDLE_FILL,
        height: handleSize,
        stroke: strokeColor,
        width: handleSize,
        x: endpoint.x - handleSize / 2,
        y: endpoint.y - handleSize / 2,
      },
      canvasWidth,
      canvasHeight,
      viewport,
      0,
    );
  });
};
