// types
import { TDraftRect } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawEllipse, TDrawableEllipse } from './shapes/drawEllipse';
import { drawEllipseArc } from './drawEllipseArc';
import { hasEllipseArc } from './ellipseArc/hasEllipseArc';

export const drawEllipseNode = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  ellipse: TDrawableEllipse & TDraftRect & { arcEndAngle: number; arcRatio?: number; arcRatioInverted?: boolean; arcStartAngle: number },
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  flipX: boolean,
  flipY: boolean,
  rotation: number,
): void => {
  if (hasEllipseArc(ellipse.arcStartAngle, ellipse.arcEndAngle) || (ellipse.arcRatio ?? 0) > 0) {
    drawEllipseArc(gl, program, buffer, ellipse, canvasWidth, canvasHeight, viewport, flipX, flipY, rotation);
  } else {
    drawEllipse(gl, program, buffer, ellipse, canvasWidth, canvasHeight, viewport, rotation);
  }
};
