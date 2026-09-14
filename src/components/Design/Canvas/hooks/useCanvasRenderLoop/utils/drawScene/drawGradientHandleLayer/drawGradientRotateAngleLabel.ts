// others
import { DIMENSION_HINT_GUIDE_BLUE } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TDrawSceneContext } from '../types';

// utils
import { drawValueLabel } from 'utils/canvas/text/drawValueLabel/drawValueLabel';
import { getAngleBetweenPoints } from 'utils/math/getAngleBetweenPoints';

const EDGE_GAP_PX = 15;
const OFFSET_DIRECTION: TPoint = { x: 1, y: 0 };

export const drawGradientRotateAngleLabel = (context: TDrawSceneContext, pointerPosition: TPoint, start: TPoint, end: TPoint): void => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, program, viewport } = context;
  const angle = Math.round(getAngleBetweenPoints(start, end));
  const text = `${angle}°`;

  drawValueLabel(gl, program, buffer, imageContext, text, pointerPosition, OFFSET_DIRECTION, canvasWidth, canvasHeight, viewport, {
    edgeGapPx: EDGE_GAP_PX,
    fill: DIMENSION_HINT_GUIDE_BLUE,
  });
};
