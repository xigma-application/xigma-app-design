// others
import { DIMENSION_HINT_GUIDE_BLUE, RADIUS_HANDLE_FILL, RADIUS_HANDLE_SIZE } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawEllipse } from 'utils/canvas/shapes/drawEllipse';

export const drawGradientEndpointHandles = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  points: [TPoint, TPoint],
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const handleRadius = RADIUS_HANDLE_SIZE / 2 / viewport.zoom;

  points.forEach((point) => {
    drawEllipse(
      gl,
      program,
      buffer,
      {
        fill: RADIUS_HANDLE_FILL,
        height: handleRadius * 2,
        stroke: DIMENSION_HINT_GUIDE_BLUE,
        width: handleRadius * 2,
        x: point.x - handleRadius,
        y: point.y - handleRadius,
      },
      canvasWidth,
      canvasHeight,
      viewport,
      0,
    );
  });
};
