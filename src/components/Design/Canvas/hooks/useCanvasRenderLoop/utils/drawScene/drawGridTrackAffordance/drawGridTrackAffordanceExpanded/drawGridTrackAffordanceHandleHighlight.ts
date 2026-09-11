// constant
import { GRID_TRACK_AFFORDANCE_FILL, VALUE_LABEL_CORNER_RADIUS_PX } from 'constant/canvas';

// types
import { TDrawSceneContext } from '../../types';
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { drawRect } from 'utils/canvas/drawRect/drawRect';

const HIGHLIGHT_INSET_PX = 2;

export const drawGridTrackAffordanceHandleHighlight = (
  context: TDrawSceneContext,
  band: TDraftRect,
  rotation: number,
  rotationCenter: TPoint,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
  const inset = HIGHLIGHT_INSET_PX / viewport.zoom;

  drawRect(
    gl,
    program,
    buffer,
    {
      cornerRadius: VALUE_LABEL_CORNER_RADIUS_PX / viewport.zoom,
      fill: GRID_TRACK_AFFORDANCE_FILL,
      height: band.height - 2 * inset,
      width: band.width - 2 * inset,
      x: band.x + inset,
      y: band.y + inset,
    },
    canvasWidth,
    canvasHeight,
    viewport,
    rotation,
    rotationCenter,
  );
};
