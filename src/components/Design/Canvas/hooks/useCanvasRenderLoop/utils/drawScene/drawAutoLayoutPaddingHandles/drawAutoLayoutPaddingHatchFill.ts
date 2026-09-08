// others
import { AUTO_LAYOUT_PADDING_HANDLE_FILL } from 'constant/canvas';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TDrawSceneContext } from '../types';

// utils
import { drawVectorHatchFill } from 'utils/canvas/drawVectorNode/drawVectorHatchFill';
import { rotatePoint } from 'utils/math/rotatePoint';

const getRectCorners = (rect: TDraftRect, center: TPoint, rotation: number): TPoint[] =>
  [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.width, y: rect.y },
    { x: rect.x + rect.width, y: rect.y + rect.height },
    { x: rect.x, y: rect.y + rect.height },
  ].map((corner) => rotatePoint(corner, center, rotation));

export const drawAutoLayoutPaddingHatchFill = (
  context: TDrawSceneContext,
  band: TDraftRect,
  frameCenter: TPoint,
  frameRotation: number,
): void => {
  if (band.width > 0 && band.height > 0) {
    const { buffer, canvasHeight, canvasWidth, gl, imageContext, program, viewport } = context;
    const faces = [getRectCorners(band, frameCenter, frameRotation)];

    drawVectorHatchFill(
      gl,
      program,
      buffer,
      faces,
      AUTO_LAYOUT_PADDING_HANDLE_FILL,
      canvasWidth,
      canvasHeight,
      viewport,
      imageContext.isAlphaWriteEnabled,
    );
  }
};
