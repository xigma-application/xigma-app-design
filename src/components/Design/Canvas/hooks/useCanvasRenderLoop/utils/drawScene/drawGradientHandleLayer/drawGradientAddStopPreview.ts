// types
import { TPoint } from 'types/canvas';
import { TDrawContext } from '../types';

// utils
import { drawSingleGradientStopHandle } from './drawSingleGradientStopHandle';

export const drawGradientAddStopPreview = (
  ctx: TDrawContext,
  pointOnLine: TPoint,
  towardLineDirection: TPoint,
  color: string,
  opacity: number,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = ctx;

  drawSingleGradientStopHandle(
    gl,
    program,
    buffer,
    pointOnLine,
    towardLineDirection,
    color,
    opacity,
    false,
    canvasWidth,
    canvasHeight,
    viewport,
  );
};
