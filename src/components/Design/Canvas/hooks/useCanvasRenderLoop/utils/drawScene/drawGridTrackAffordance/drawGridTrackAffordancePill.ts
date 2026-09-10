// others
import {
  GRID_TRACK_AFFORDANCE_BORDER_WIDTH_PX,
  GRID_TRACK_AFFORDANCE_FILL,
  GRID_TRACK_AFFORDANCE_LENGTH_PX,
  GRID_TRACK_AFFORDANCE_RADIUS_PX,
  GRID_TRACK_AFFORDANCE_THICKNESS_PX,
  SMART_SELECTION_GAP_HANDLE_STROKE,
} from 'constant/canvas';

// types
import { TDrawSceneContext } from '../types';
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';
import { TPoint } from 'types/canvas';

// utils
import { drawRect } from 'utils/canvas/drawRect/drawRect';

export const drawGridTrackAffordancePill = (
  context: TDrawSceneContext,
  center: TPoint,
  axis: TGridTrackAxis,
  rotation: number,
  rotationCenter: TPoint,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
  const length = GRID_TRACK_AFFORDANCE_LENGTH_PX / viewport.zoom;
  const thickness = GRID_TRACK_AFFORDANCE_THICKNESS_PX / viewport.zoom;
  const border = GRID_TRACK_AFFORDANCE_BORDER_WIDTH_PX / viewport.zoom;
  const radius = GRID_TRACK_AFFORDANCE_RADIUS_PX / viewport.zoom;
  const width = axis === 'column' ? length : thickness;
  const height = axis === 'column' ? thickness : length;
  const fillWidth = Math.max(0, width - 2 * border);
  const fillHeight = Math.max(0, height - 2 * border);

  drawRect(
    gl,
    program,
    buffer,
    { cornerRadius: radius, fill: SMART_SELECTION_GAP_HANDLE_STROKE, height, width, x: center.x - width / 2, y: center.y - height / 2 },
    canvasWidth,
    canvasHeight,
    viewport,
    rotation,
    rotationCenter,
  );
  drawRect(
    gl,
    program,
    buffer,
    {
      cornerRadius: Math.max(0, radius - border),
      fill: GRID_TRACK_AFFORDANCE_FILL,
      height: fillHeight,
      width: fillWidth,
      x: center.x - fillWidth / 2,
      y: center.y - fillHeight / 2,
    },
    canvasWidth,
    canvasHeight,
    viewport,
    rotation,
    rotationCenter,
  );
};
