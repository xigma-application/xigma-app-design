// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';

// types
import { TDraftRect } from 'types/canvas';
import { TDrawSceneContext } from '../types';

// utils
import { drawValueLabel } from 'utils/canvas/text/drawValueLabel/drawValueLabel';
import { getPolygonCornerRadiusValueLabelAnchor } from './getPolygonCornerRadiusValueLabelAnchor';

export const drawPolygonCornerRadiusValueLabel = (
  context: TDrawSceneContext,
  bounds: TDraftRect,
  sides: number,
  cornerRadius: number,
  rotation: number,
  flipX: boolean,
  flipY: boolean,
  isDragging: boolean,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, program, viewport } = context;
  const { anchor, direction } = getPolygonCornerRadiusValueLabelAnchor(
    bounds,
    sides,
    cornerRadius,
    rotation,
    viewport,
    flipX,
    flipY,
    isDragging,
  );
  const text = `Radius ${cornerRadius}`;

  drawValueLabel(gl, program, buffer, imageContext, text, anchor, direction, canvasWidth, canvasHeight, viewport, {
    fill: DRAFT_FRAME_STROKE,
  });
};
