// constant
import {
  GRID_TRACK_AFFORDANCE_BORDER_WIDTH_PX,
  GRID_TRACK_AFFORDANCE_EXPANDED_CHEVRON_SIZE_PX,
  VALUE_LABEL_TEXT_FILL,
} from 'constant/canvas';

// types
import { TDrawSceneContext } from '../../types';
import { TPoint } from 'types/canvas';

// utils
import { drawRotatedLine } from 'utils/canvas/drawRotatedLine';

export const drawGridTrackAffordanceChevron = (
  context: TDrawSceneContext,
  center: TPoint,
  rotation: number,
  rotationCenter: TPoint,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
  const size = GRID_TRACK_AFFORDANCE_EXPANDED_CHEVRON_SIZE_PX / viewport.zoom;
  const strokeWidth = GRID_TRACK_AFFORDANCE_BORDER_WIDTH_PX / viewport.zoom;
  const halfWidth = size / 2;
  const top = center.y - size / 4;
  const bottom = center.y + size / 4;

  drawRotatedLine(
    gl,
    program,
    buffer,
    { x1: center.x - halfWidth, x2: center.x, y1: top, y2: bottom },
    VALUE_LABEL_TEXT_FILL,
    strokeWidth,
    canvasWidth,
    canvasHeight,
    viewport,
    rotation,
    rotationCenter,
  );
  drawRotatedLine(
    gl,
    program,
    buffer,
    { x1: center.x, x2: center.x + halfWidth, y1: bottom, y2: top },
    VALUE_LABEL_TEXT_FILL,
    strokeWidth,
    canvasWidth,
    canvasHeight,
    viewport,
    rotation,
    rotationCenter,
  );
};
