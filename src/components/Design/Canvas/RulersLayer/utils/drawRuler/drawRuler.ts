// others
import { RULER_BACKGROUND, RULER_TEXT_FILL, RULER_TICK_STROKE } from 'constant/canvas';
import { RULER_FONT, RULER_SIZE_PX } from '../../constants';

// types
import { TViewport } from 'types/design/types';
import { THighlightedRulerGuide } from '../getHighlightedRulerGuide';

// utils
import { getHighlightedRulerTick, getRulerTicks } from '../getRulerTicks';
import { paintHighlightedLeftTick } from './paintHighlightedLeftTick';
import { paintHighlightedTopTick } from './paintHighlightedTopTick';
import { paintLeftTick } from './paintLeftTick';
import { paintTopTick } from './paintTopTick';

export type TDrawRulerParams = {
  height: number;
  highlightedGuide: THighlightedRulerGuide | null;
  leftInset: number;
  rightInset: number;
  viewport: TViewport;
  width: number;
};

export const drawRuler = (
  ctx: CanvasRenderingContext2D,
  { height, highlightedGuide, leftInset, rightInset, viewport, width }: TDrawRulerParams,
): void => {
  ctx.clearRect(0, 0, width, height);

  const rulerRight = width - rightInset;

  ctx.fillStyle = RULER_BACKGROUND;
  ctx.fillRect(leftInset, 0, rulerRight - leftInset, RULER_SIZE_PX);
  ctx.fillRect(leftInset, 0, RULER_SIZE_PX, height);

  ctx.font = RULER_FONT;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.strokeStyle = RULER_TICK_STROKE;
  ctx.fillStyle = RULER_TEXT_FILL;

  getRulerTicks(rulerRight, viewport.x, viewport.zoom).forEach((tick) => paintTopTick(ctx, tick, leftInset));
  getRulerTicks(height, viewport.y, viewport.zoom).forEach((tick) => paintLeftTick(ctx, tick, leftInset));

  if (highlightedGuide?.axis === 'x') {
    paintHighlightedTopTick(ctx, getHighlightedRulerTick(highlightedGuide.worldPosition, viewport.x, viewport.zoom), leftInset);
  } else if (highlightedGuide?.axis === 'y') {
    paintHighlightedLeftTick(ctx, getHighlightedRulerTick(highlightedGuide.worldPosition, viewport.y, viewport.zoom), leftInset);
  }
};
