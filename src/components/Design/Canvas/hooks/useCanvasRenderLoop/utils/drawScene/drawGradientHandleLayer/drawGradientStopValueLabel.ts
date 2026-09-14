// others
import { DIMENSION_HINT_GUIDE_BLUE } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TDrawSceneContext } from '../types';

// utils
import { drawValueLabel } from 'utils/canvas/text/drawValueLabel/drawValueLabel';
import { getGradientStopValueLabelAnchor } from './getGradientStopValueLabelAnchor';
import { getGradientStopValueLabelText } from './getGradientStopValueLabelText';

export const drawGradientStopValueLabel = (
  context: TDrawSceneContext,
  stopPosition: TPoint,
  awayFromLineDirection: TPoint,
  position: number,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, program, viewport } = context;
  const { anchor, direction } = getGradientStopValueLabelAnchor(stopPosition, awayFromLineDirection, viewport.zoom);
  const text = getGradientStopValueLabelText(position);

  drawValueLabel(gl, program, buffer, imageContext, text, anchor, direction, canvasWidth, canvasHeight, viewport, {
    fill: DIMENSION_HINT_GUIDE_BLUE,
  });
};
