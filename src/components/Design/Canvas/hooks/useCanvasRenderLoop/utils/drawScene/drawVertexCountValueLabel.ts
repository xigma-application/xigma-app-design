// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TDrawSceneContext } from './types';

// utils
import { drawValueLabel } from 'utils/canvas/text/drawValueLabel/drawValueLabel';
import { getVertexCountValueLabelAnchor } from './getVertexCountValueLabelAnchor';

export const drawVertexCountValueLabel = (
  context: TDrawSceneContext,
  bounds: TDraftRect,
  handlePosition: TPoint,
  rotation: number,
  count: number,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, program, viewport } = context;
  const { anchor, direction } = getVertexCountValueLabelAnchor(bounds, handlePosition, rotation, viewport);
  const text = `Count ${count}`;

  drawValueLabel(gl, program, buffer, imageContext, text, anchor, direction, canvasWidth, canvasHeight, viewport, {
    fill: DRAFT_FRAME_STROKE,
  });
};
