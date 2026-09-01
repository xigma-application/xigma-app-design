// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';

// types
import { TCornerRadiusHandle, TDraftRect } from 'types/canvas';
import { TDrawSceneContext } from '../types';

// utils
import { drawValueLabel } from 'utils/canvas/text/drawValueLabel/drawValueLabel';
import { getCornerRadiusValueLabelAnchor } from './getCornerRadiusValueLabelAnchor';

export const drawCornerRadiusValueLabel = (
  context: TDrawSceneContext,
  bounds: TDraftRect,
  cornerRadius: number,
  rotation: number,
  corner: TCornerRadiusHandle,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, program, viewport } = context;
  const { anchor, direction } = getCornerRadiusValueLabelAnchor(bounds, cornerRadius, rotation, viewport, corner);
  const text = `Radius ${cornerRadius}`;

  drawValueLabel(gl, program, buffer, imageContext, text, anchor, direction, canvasWidth, canvasHeight, viewport, {
    fill: DRAFT_FRAME_STROKE,
  });
};
