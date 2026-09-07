// others
import {
  SMART_SELECTION_GAP_HANDLE_FILL_INSET_PX,
  SMART_SELECTION_GAP_HANDLE_LENGTH_PX,
  SMART_SELECTION_GAP_HANDLE_STROKE,
  SMART_SELECTION_GAP_HANDLE_WIDTH_PX,
  SMART_SELECTION_SWAP_HANDLE_FILL,
} from 'constant/canvas';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TDrawSceneContext } from '../types';

// utils
import { drawRect } from 'utils/canvas/drawRect/drawRect';

export const drawAutoLayoutGapHandleBar = (
  context: TDrawSceneContext,
  fillRect: TDraftRect,
  orientation: 'horizontal' | 'vertical',
  frameCenter: TPoint,
  frameRotation: number,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
  const center: TPoint = { x: fillRect.x + fillRect.width / 2, y: fillRect.y + fillRect.height / 2 };
  const length = SMART_SELECTION_GAP_HANDLE_LENGTH_PX / viewport.zoom;
  const thickness = SMART_SELECTION_GAP_HANDLE_WIDTH_PX / viewport.zoom;
  const width = orientation === 'vertical' ? thickness : length;
  const height = orientation === 'vertical' ? length : thickness;
  const fillInset = (2 * SMART_SELECTION_GAP_HANDLE_FILL_INSET_PX) / viewport.zoom;
  const fillWidth = Math.max(0, width - fillInset);
  const fillHeight = Math.max(0, height - fillInset);

  drawRect(
    gl,
    program,
    buffer,
    { fill: SMART_SELECTION_GAP_HANDLE_STROKE, height, width, x: center.x - width / 2, y: center.y - height / 2 },
    canvasWidth,
    canvasHeight,
    viewport,
    frameRotation,
    frameCenter,
  );
  drawRect(
    gl,
    program,
    buffer,
    {
      fill: SMART_SELECTION_SWAP_HANDLE_FILL,
      height: fillHeight,
      width: fillWidth,
      x: center.x - fillWidth / 2,
      y: center.y - fillHeight / 2,
    },
    canvasWidth,
    canvasHeight,
    viewport,
    frameRotation,
    frameCenter,
  );
};
