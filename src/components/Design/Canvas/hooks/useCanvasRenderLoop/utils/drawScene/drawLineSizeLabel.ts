// others
import { DRAFT_FRAME_STROKE, SELECTION_SIZE_LABEL_EDGE_GAP_PX } from 'constant/canvas';

// types
import { TDrawSceneContext } from './types';

// utils
import { drawValueLabel } from 'utils/canvas/text/drawValueLabel/drawValueLabel';
import { getLineSizeLabelPlacement } from './getLineSizeLabelPlacement';

export const drawLineSizeLabel = (context: TDrawSceneContext, x1: number, y1: number, x2: number, y2: number): void => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, program, viewport } = context;
  const { anchor, angleDeg, offsetDirection } = getLineSizeLabelPlacement(x1, y1, x2, y2);
  const length = Math.hypot(x2 - x1, y2 - y1);
  const text = `${Math.round(length)} x 0`;

  drawValueLabel(gl, program, buffer, imageContext, text, anchor, offsetDirection, canvasWidth, canvasHeight, viewport, {
    angleDeg,
    edgeGapPx: SELECTION_SIZE_LABEL_EDGE_GAP_PX,
    fill: DRAFT_FRAME_STROKE,
  });
};
