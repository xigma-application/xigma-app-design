// others
import { IMAGE_EDITOR_CORNER_ARM_LENGTH, IMAGE_EDITOR_HANDLE_THICKNESS } from 'constant/canvas';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawRect } from 'utils/canvas/drawRect/drawRect';
import { getRectCorners } from 'utils/canvas/getRectCorners';

const buildBarRect = (x0: number, y0: number, x1: number, y1: number): TDraftRect => ({
  height: Math.abs(y1 - y0),
  width: Math.abs(x1 - x0),
  x: Math.min(x0, x1),
  y: Math.min(y0, y1),
});

export const drawImageEditorCornerHandles = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  rect: TDraftRect,
  fill: string,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  rotation: number,
): void => {
  const armLength = IMAGE_EDITOR_CORNER_ARM_LENGTH / viewport.zoom;
  const thickness = IMAGE_EDITOR_HANDLE_THICKNESS / viewport.zoom;
  const center: TPoint = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };

  getRectCorners(rect).forEach((corner) => {
    const outwardX = Math.sign(corner.x - center.x);
    const outwardY = Math.sign(corner.y - center.y);
    const horizontalArm = buildBarRect(
      corner.x + outwardX * thickness,
      corner.y,
      corner.x - outwardX * armLength,
      corner.y + outwardY * thickness,
    );
    const verticalArm = buildBarRect(
      corner.x,
      corner.y + outwardY * thickness,
      corner.x + outwardX * thickness,
      corner.y - outwardY * armLength,
    );

    [horizontalArm, verticalArm].forEach((barRect) => {
      drawRect(gl, program, buffer, { ...barRect, fill }, canvasWidth, canvasHeight, viewport, rotation, center);
    });
  });
};
