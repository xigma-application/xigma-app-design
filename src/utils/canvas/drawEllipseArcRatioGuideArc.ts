// others
import { ELLIPSE_SEGMENTS } from 'constant/canvas';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawLine } from './drawLine';
import { flipPoint } from 'utils/math/flipPoint';
import { getEllipseArcPoints } from './shapes/getEllipseArcPoints';
import { rotatePoint } from 'utils/math/rotatePoint';

export const drawEllipseArcRatioGuideArc = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  bounds: TDraftRect,
  arcStartAngle: number,
  arcEndAngle: number,
  color: string,
  strokeWidth: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  rotation: number,
  flipX = false,
  flipY = false,
): void => {
  const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const points = getEllipseArcPoints(bounds, arcStartAngle, arcEndAngle, ELLIPSE_SEGMENTS)
    .map((point) => flipPoint(point, center, flipX, flipY))
    .map((point) => rotatePoint(point, center, rotation));

  points.slice(0, -1).forEach((point, index) => {
    const nextPoint = points[index + 1];

    drawLine(
      gl,
      program,
      buffer,
      { x1: point.x, x2: nextPoint.x, y1: point.y, y2: nextPoint.y },
      color,
      strokeWidth / viewport.zoom,
      canvasWidth,
      canvasHeight,
      viewport,
    );
  });
};
