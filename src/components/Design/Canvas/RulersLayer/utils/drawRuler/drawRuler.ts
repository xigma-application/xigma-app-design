// others
import { RULER_BACKGROUND, RULER_TEXT_FILL, RULER_TICK_STROKE } from 'constant/canvas';
import { RULER_FONT, RULER_SIZE_PX } from '../../constants';

// types
import { TViewport } from 'types/design/types';
import { THighlightedRulerGuide } from '../getHighlightedRulerGuide';
import type { TRulerBand } from '../getRulerBands';

// utils
import { getHighlightedRulerTick, getRulerTicks } from '../getRulerTicks';
import { paintHighlightedLeftTick } from './paintHighlightedLeftTick';
import { paintHighlightedTopTick } from './paintHighlightedTopTick';
import { paintLeftBand } from './paintLeftBand';
import { paintLeftTick } from './paintLeftTick';
import { paintTopBand } from './paintTopBand';
import { paintTopTick } from './paintTopTick';

export type TDrawRulerParams = {
  height: number;
  highlightedGuide: THighlightedRulerGuide | null;
  leftBand: TRulerBand | null;
  leftInset: number;
  origin: { x: number; y: number };
  rightInset: number;
  topBand: TRulerBand | null;
  viewport: TViewport;
  width: number;
};

export const drawRuler = (
  ctx: CanvasRenderingContext2D,
  { height, highlightedGuide, leftBand, leftInset, origin, rightInset, topBand, viewport, width }: TDrawRulerParams,
): void => {
  ctx.clearRect(0, 0, width, height);

  const rulerRight = width - rightInset;

  ctx.fillStyle = RULER_BACKGROUND;
  ctx.fillRect(leftInset, 0, rulerRight - leftInset, RULER_SIZE_PX);
  ctx.fillRect(leftInset, 0, RULER_SIZE_PX, height);

  if (topBand) {
    paintTopBand(ctx, topBand, leftInset, rulerRight);
  }

  if (leftBand) {
    paintLeftBand(ctx, leftBand, leftInset, height);
  }

  ctx.font = RULER_FONT;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.strokeStyle = RULER_TICK_STROKE;
  ctx.fillStyle = RULER_TEXT_FILL;

  getRulerTicks(rulerRight, viewport.x, viewport.zoom, origin.x).forEach((tick) => paintTopTick(ctx, tick, leftInset));
  getRulerTicks(height, viewport.y, viewport.zoom, origin.y).forEach((tick) => paintLeftTick(ctx, tick, leftInset));

  if (highlightedGuide?.axis === 'x') {
    paintHighlightedTopTick(ctx, getHighlightedRulerTick(highlightedGuide.worldPosition, viewport.x, viewport.zoom, origin.x), leftInset);
  } else if (highlightedGuide?.axis === 'y') {
    paintHighlightedLeftTick(ctx, getHighlightedRulerTick(highlightedGuide.worldPosition, viewport.y, viewport.zoom, origin.y), leftInset);
  }
};
