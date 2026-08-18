// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawLine } from './drawLine';
import { getEllipseArcHandlePosition } from './ellipseArc/getEllipseArcHandlePosition';
import { rotatePoint } from 'utils/math/rotatePoint';

export const drawEllipseArcGuideLine = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  bounds: TDraftRect,
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
  const handlePosition = getEllipseArcHandlePosition(bounds, arcEndAngle, { flipX, flipY });
  const rotatedHandlePosition = rotatePoint(handlePosition, center, rotation);

  drawLine(
    gl,
    program,
    buffer,
    { x1: center.x, x2: rotatedHandlePosition.x, y1: center.y, y2: rotatedHandlePosition.y },
    color,
    strokeWidth / viewport.zoom,
    canvasWidth,
    canvasHeight,
    viewport,
  );
};
