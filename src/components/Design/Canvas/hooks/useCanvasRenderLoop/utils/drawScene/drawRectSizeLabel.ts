// others
import { SELECTION_SIZE_LABEL_EDGE_GAP_PX, SIZE_LABEL_FILL } from 'constant/canvas';

// types
import { TDrawSceneContext, TSizeLabelSizingModes } from './types';

// utils
import { drawValueLabel } from 'utils/canvas/text/drawValueLabel/drawValueLabel';
import { getSelectionSizeLabelPlacement, TSelectionSizeLabelRect } from './getSelectionSizeLabelPlacement';
import { getSizeLabelText } from './getSizeLabelText';

export const drawRectSizeLabel = (context: TDrawSceneContext, rect: TSelectionSizeLabelRect, sizingModes?: TSizeLabelSizingModes): void => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, program, viewport } = context;
  const { anchor, angleDeg, offsetDirection } = getSelectionSizeLabelPlacement(rect);
  const text = getSizeLabelText(rect.width, rect.height, sizingModes);

  drawValueLabel(gl, program, buffer, imageContext, text, anchor, offsetDirection, canvasWidth, canvasHeight, viewport, {
    angleDeg,
    edgeGapPx: SELECTION_SIZE_LABEL_EDGE_GAP_PX,
    fill: SIZE_LABEL_FILL,
  });
};
