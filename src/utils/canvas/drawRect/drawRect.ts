// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawRoundedRect } from './drawRoundedRect';
import { drawStandardRect } from './drawStandardRect';

export type TDrawableRect = TDraftRect & {
  cornerRadius?: number;
  fill?: string;
  fillAlpha?: number;
  stroke?: string;
};

export const drawRect = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  rect: TDrawableRect,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  rotation: number,
  rotationCenter?: TPoint,
): void => {
  const center: TPoint = rotationCenter ?? { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };

  if (rect.cornerRadius) {
    drawRoundedRect(
      gl,
      program,
      buffer,
      { ...rect, cornerRadius: rect.cornerRadius },
      canvasWidth,
      canvasHeight,
      viewport,
      rotation,
      center,
    );
  } else {
    drawStandardRect(gl, program, buffer, rect, canvasWidth, canvasHeight, viewport, rotation, center);
  }
};
