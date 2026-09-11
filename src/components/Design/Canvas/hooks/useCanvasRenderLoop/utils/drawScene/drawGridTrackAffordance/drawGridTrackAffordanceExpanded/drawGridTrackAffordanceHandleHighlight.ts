// constant
import { GRID_TRACK_AFFORDANCE_HANDLE_HOVER_FILL, VALUE_LABEL_CORNER_RADIUS_PX } from 'constant/canvas';

// types
import { TDrawSceneContext } from '../../types';
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { drawRect } from 'utils/canvas/drawRect/drawRect';

export const drawGridTrackAffordanceHandleHighlight = (
  context: TDrawSceneContext,
  band: TDraftRect,
  rotation: number,
  rotationCenter: TPoint,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;

  drawRect(
    gl,
    program,
    buffer,
    {
      cornerRadius: VALUE_LABEL_CORNER_RADIUS_PX / viewport.zoom,
      fill: GRID_TRACK_AFFORDANCE_HANDLE_HOVER_FILL,
      height: band.height,
      width: band.width,
      x: band.x,
      y: band.y,
    },
    canvasWidth,
    canvasHeight,
    viewport,
    rotation,
    rotationCenter,
  );
};
