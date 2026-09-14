// types
import { TPoint } from 'types/canvas';
import { TDrawContext } from '../types';

// utils
import { drawEllipse } from 'utils/canvas/shapes/drawEllipse';

const ENDPOINT_HANDLE_SIZE = 8;
const ENDPOINT_HANDLE_FILL = '#ffffff';
const ENDPOINT_HANDLE_SHADOW_COLOR = '#000000';
const ENDPOINT_HANDLE_SHADOW_ALPHA = 0.35;
const ENDPOINT_HANDLE_SHADOW_EXTRA_SIZE = 3;

export const drawGradientEndpointHandles = (ctx: TDrawContext, points: TPoint[]): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = ctx;
  const handleRadius = ENDPOINT_HANDLE_SIZE / 2 / viewport.zoom;
  const shadowRadius = (ENDPOINT_HANDLE_SIZE + ENDPOINT_HANDLE_SHADOW_EXTRA_SIZE) / 2 / viewport.zoom;

  points.forEach((point) => {
    drawEllipse(
      gl,
      program,
      buffer,
      {
        fill: ENDPOINT_HANDLE_SHADOW_COLOR,
        fillAlpha: ENDPOINT_HANDLE_SHADOW_ALPHA,
        height: shadowRadius * 2,
        width: shadowRadius * 2,
        x: point.x - shadowRadius,
        y: point.y - shadowRadius,
      },
      canvasWidth,
      canvasHeight,
      viewport,
      0,
    );

    drawEllipse(
      gl,
      program,
      buffer,
      {
        fill: ENDPOINT_HANDLE_FILL,
        height: handleRadius * 2,
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
