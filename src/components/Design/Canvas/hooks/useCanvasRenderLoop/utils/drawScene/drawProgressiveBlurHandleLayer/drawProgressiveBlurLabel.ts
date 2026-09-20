// others
import { DIMENSION_HINT_GUIDE_BLUE } from 'constant/canvas';
import { PROGRESSIVE_BLUR_LABEL_DIRECTION, PROGRESSIVE_BLUR_LABEL_MARGIN_PX } from './constants';

// types
import { TDrawSceneContext } from '../types';
import { TPoint } from 'types/canvas';

// utils
import { drawValueLabel } from 'utils/canvas/text/drawValueLabel/drawValueLabel';

export const drawProgressiveBlurLabel = (context: TDrawSceneContext, point: TPoint, text: string): void => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, program, viewport } = context;
  const margin = PROGRESSIVE_BLUR_LABEL_MARGIN_PX / viewport.zoom;
  const anchor = {
    x: point.x + PROGRESSIVE_BLUR_LABEL_DIRECTION.x * margin,
    y: point.y + PROGRESSIVE_BLUR_LABEL_DIRECTION.y * margin,
  };

  drawValueLabel(gl, program, buffer, imageContext, text, anchor, PROGRESSIVE_BLUR_LABEL_DIRECTION, canvasWidth, canvasHeight, viewport, {
    fill: DIMENSION_HINT_GUIDE_BLUE,
  });
};
