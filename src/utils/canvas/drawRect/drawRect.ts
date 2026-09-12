// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawRoundedRect } from './drawRoundedRect';
import { drawStandardRect } from './drawStandardRect';

export type TDrawableRect = TDraftRect & {
  cornerRadius?: number;
  cornerRadiusBottomLeft?: number;
  cornerRadiusBottomRight?: number;
  cornerRadiusTopLeft?: number;
  cornerRadiusTopRight?: number;
  fill?: string;
  fillAlpha?: number;
  stroke?: string;
};

const hasRoundedCorner = (rect: TDrawableRect): boolean =>
  Boolean(
    rect.cornerRadius ||
    rect.cornerRadiusTopLeft ||
    rect.cornerRadiusTopRight ||
    rect.cornerRadiusBottomLeft ||
    rect.cornerRadiusBottomRight,
  );

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

  if (hasRoundedCorner(rect)) {
    drawRoundedRect(
      gl,
      program,
      buffer,
      { ...rect, cornerRadius: rect.cornerRadius ?? 0 },
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
