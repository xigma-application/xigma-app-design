// others
import { DRAFT_FRAME_STROKE, SELECTION_SIZE_LABEL_EDGE_GAP_PX } from 'constant/canvas';

// types
import { TDrawSceneContext } from './types';

// utils
import { drawValueLabel } from 'utils/canvas/text/drawValueLabel/drawValueLabel';
import { getSelectionSizeLabelPlacement, TSelectionSizeLabelRect } from './getSelectionSizeLabelPlacement';

export const drawRectSizeLabel = (context: TDrawSceneContext, rect: TSelectionSizeLabelRect): void => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, program, viewport } = context;
  const { anchor, angleDeg, offsetDirection } = getSelectionSizeLabelPlacement(rect);
  const text = `${Math.round(rect.width)} x ${Math.round(rect.height)}`;

  drawValueLabel(gl, program, buffer, imageContext, text, anchor, offsetDirection, canvasWidth, canvasHeight, viewport, {
    angleDeg,
    edgeGapPx: SELECTION_SIZE_LABEL_EDGE_GAP_PX,
    fill: DRAFT_FRAME_STROKE,
  });
};
