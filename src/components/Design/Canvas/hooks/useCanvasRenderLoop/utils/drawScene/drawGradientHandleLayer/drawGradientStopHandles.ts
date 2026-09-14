// types
import { TPoint } from 'types/canvas';
import { TGradientStop } from 'types/design/paint/types';
import { TViewport } from 'types/design/types';

// utils
import { drawSingleGradientStopHandle } from './drawSingleGradientStopHandle';

export const drawGradientStopHandles = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  stops: TGradientStop[],
  positions: TPoint[],
  selectedStopIndex: number | null,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  stops.forEach((stop, index) => {
    drawSingleGradientStopHandle(
      gl,
      program,
      buffer,
      positions[index],
      stop.color,
      stop.opacity,
      index === selectedStopIndex,
      canvasWidth,
      canvasHeight,
      viewport,
    );
  });
};
