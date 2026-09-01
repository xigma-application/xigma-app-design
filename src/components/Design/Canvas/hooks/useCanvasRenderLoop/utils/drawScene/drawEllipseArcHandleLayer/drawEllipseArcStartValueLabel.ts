// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TDrawSceneContext } from '../types';

// utils
import { drawValueLabel } from 'utils/canvas/text/drawValueLabel/drawValueLabel';
import { getEllipseArcStartValueLabelText } from './getEllipseArcStartValueLabelText';
import { getEllipseArcValueLabelAnchor } from './getEllipseArcValueLabelAnchor';

export const drawEllipseArcStartValueLabel = (
  context: TDrawSceneContext,
  bounds: TDraftRect,
  handlePosition: TPoint,
  rotation: number,
  arcStartAngle: number,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, program, viewport } = context;
  const { anchor, direction } = getEllipseArcValueLabelAnchor(bounds, handlePosition, rotation, viewport);
  const text = getEllipseArcStartValueLabelText(arcStartAngle);

  drawValueLabel(gl, program, buffer, imageContext, text, anchor, direction, canvasWidth, canvasHeight, viewport, {
    fill: DRAFT_FRAME_STROKE,
  });
};
