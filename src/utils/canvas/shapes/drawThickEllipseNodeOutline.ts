// types
import { TDraftRect } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawThickEllipseArcOutline } from './drawThickEllipseArcOutline';
import { drawThickEllipseOutline } from './drawThickEllipseOutline';
import { hasEllipseArc } from '../ellipseArc/hasEllipseArc';

export const drawThickEllipseNodeOutline = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  ellipse: TDraftRect & { arcEndAngle: number; arcRatio?: number; arcRatioInverted?: boolean; arcStartAngle: number },
  color: string,
  strokeWidth: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  flipX: boolean,
  flipY: boolean,
  rotation: number,
): void => {
  if (hasEllipseArc(ellipse.arcStartAngle, ellipse.arcEndAngle) || (ellipse.arcRatio ?? 0) > 0) {
    drawThickEllipseArcOutline(
      gl,
      program,
      buffer,
      ellipse,
      color,
      strokeWidth,
      canvasWidth,
      canvasHeight,
      viewport,
      flipX,
      flipY,
      rotation,
    );
  } else {
    drawThickEllipseOutline(gl, program, buffer, ellipse, color, strokeWidth, canvasWidth, canvasHeight, viewport, rotation);
  }
};
