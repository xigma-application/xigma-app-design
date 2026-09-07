// others
import { SMART_SELECTION_SWAP_HANDLE_FILL } from 'constant/canvas';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TDrawSceneContext } from '../types';

// utils
import { drawRect } from 'utils/canvas/drawRect/drawRect';

export const drawAutoLayoutGapOutline = (
  context: TDrawSceneContext,
  fillRects: TDraftRect[],
  frameCenter: TPoint,
  frameRotation: number,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;

  fillRects.forEach((fillRect) => {
    drawRect(
      gl,
      program,
      buffer,
      { ...fillRect, stroke: SMART_SELECTION_SWAP_HANDLE_FILL },
      canvasWidth,
      canvasHeight,
      viewport,
      frameRotation,
      frameCenter,
    );
  });
};
