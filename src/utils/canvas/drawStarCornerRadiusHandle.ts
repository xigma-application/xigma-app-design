// others
import { RADIUS_HANDLE_FILL, RADIUS_HANDLE_SIZE } from 'constant/canvas';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawEllipse } from './shapes/drawEllipse';
import { getStarCornerRadiusHandlePosition } from './cornerRadius/star/getStarCornerRadiusHandlePosition';
import { rotatePoint } from 'utils/math/rotatePoint';

export const drawStarCornerRadiusHandle = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  bounds: TDraftRect,
  points: number,
  ratio: number,
  cornerRadius: number,
  strokeColor: string,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  rotation: number,
  isDragging = false,
): void => {
  const handleRadius = RADIUS_HANDLE_SIZE / 2 / viewport.zoom;
  const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const position = getStarCornerRadiusHandlePosition(bounds, points, ratio, cornerRadius, viewport, isDragging);
  const rotatedPosition = rotatePoint(position, center, rotation);

  drawEllipse(
    gl,
    program,
    buffer,
    {
      fill: RADIUS_HANDLE_FILL,
      height: handleRadius * 2,
      stroke: strokeColor,
      width: handleRadius * 2,
      x: rotatedPosition.x - handleRadius,
      y: rotatedPosition.y - handleRadius,
    },
    canvasWidth,
    canvasHeight,
    viewport,
    0,
  );
};
