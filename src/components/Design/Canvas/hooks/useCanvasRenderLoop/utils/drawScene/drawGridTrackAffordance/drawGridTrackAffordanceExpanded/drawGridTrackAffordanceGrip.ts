// constant
import {
  GRID_TRACK_AFFORDANCE_BORDER_WIDTH_PX,
  GRID_TRACK_AFFORDANCE_EXPANDED_GRIP_BAR_GAP_PX,
  GRID_TRACK_AFFORDANCE_EXPANDED_GRIP_SIZE_PX,
  VALUE_LABEL_TEXT_FILL,
} from 'constant/canvas';

// types
import { TDrawSceneContext } from '../../types';
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';
import { TPoint } from 'types/canvas';

// utils
import { drawRotatedLine } from 'utils/canvas/drawRotatedLine';

export const drawGridTrackAffordanceGrip = (
  context: TDrawSceneContext,
  center: TPoint,
  axis: TGridTrackAxis,
  rotation: number,
  rotationCenter: TPoint,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
  const barLength = GRID_TRACK_AFFORDANCE_EXPANDED_GRIP_SIZE_PX / viewport.zoom;
  const barGap = GRID_TRACK_AFFORDANCE_EXPANDED_GRIP_BAR_GAP_PX / viewport.zoom;
  const strokeWidth = GRID_TRACK_AFFORDANCE_BORDER_WIDTH_PX / viewport.zoom;

  [-barGap, 0, barGap].forEach((offset) => {
    const line =
      axis === 'column'
        ? { x1: center.x + offset, x2: center.x + offset, y1: center.y - barLength / 2, y2: center.y + barLength / 2 }
        : { x1: center.x - barLength / 2, x2: center.x + barLength / 2, y1: center.y + offset, y2: center.y + offset };

    drawRotatedLine(
      gl,
      program,
      buffer,
      line,
      VALUE_LABEL_TEXT_FILL,
      strokeWidth,
      canvasWidth,
      canvasHeight,
      viewport,
      rotation,
      rotationCenter,
    );
  });
};
