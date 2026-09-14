// types
import { TPoint } from 'types/canvas';
import { TGradientStop } from 'types/design/paint/types';
import { TDrawContext } from '../types';

// utils
import { drawSingleGradientStopHandle } from './drawSingleGradientStopHandle';

export const drawGradientStopHandles = (
  ctx: TDrawContext,
  stops: TGradientStop[],
  positions: TPoint[],
  towardLineDirections: TPoint[],
  selectedStopIndex: number | null,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = ctx;

  stops.forEach((stop, index) => {
    drawSingleGradientStopHandle(
      gl,
      program,
      buffer,
      positions[index],
      towardLineDirections[index],
      stop.color,
      stop.opacity,
      index === selectedStopIndex,
      canvasWidth,
      canvasHeight,
      viewport,
    );
  });
};
