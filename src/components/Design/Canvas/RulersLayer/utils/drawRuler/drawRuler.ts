// others
import { RULER_BACKGROUND, RULER_FRAME_EXTENT_TICK_FILL, RULER_TEXT_FILL, RULER_TICK_STROKE } from 'constant/canvas';
import { RULER_FONT, RULER_SIZE_PX } from '../../constants';

// types
import { TViewport } from 'types/design/types';
import { THighlightedRulerGuide } from '../getHighlightedRulerGuide';
import type { TRulerBand } from '../getRulerBands';

// utils
import { bandLabelFill } from './bandLabelFill';
import { getHighlightedRulerTick, getRulerTicks } from '../getRulerTicks';
import { getRulerStep } from '../getRulerStep';
import { labelFade } from './labelFade';
import { paintHighlightedLeftTick } from './paintHighlightedLeftTick';
import { paintHighlightedTopTick } from './paintHighlightedTopTick';
import { paintLeftBand } from './paintLeftBand';
import { paintLeftBandEdges } from './paintLeftBandEdges';
import { paintLeftTick } from './paintLeftTick';
import { paintTopBand } from './paintTopBand';
import { paintTopBandEdges } from './paintTopBandEdges';
import { paintTopTick } from './paintTopTick';

export type TDrawRulerParams = {
  background?: string;
  frameExtentTickFill?: string;
  height: number;
  highlightedGuide: THighlightedRulerGuide | null;
  leftBand: TRulerBand | null;
  leftInset: number;
  origin: { x: number; y: number };
  rightInset: number;
  textFill?: string;
  tickStroke?: string;
  topBand: TRulerBand | null;
  viewport: TViewport;
  width: number;
};

export const drawRuler = (
  ctx: CanvasRenderingContext2D,
  {
    background = RULER_BACKGROUND,
    frameExtentTickFill = RULER_FRAME_EXTENT_TICK_FILL,
    height,
    highlightedGuide,
    leftBand,
    leftInset,
    origin,
    rightInset,
    textFill = RULER_TEXT_FILL,
    tickStroke = RULER_TICK_STROKE,
    topBand,
    viewport,
    width,
  }: TDrawRulerParams,
): void => {
  ctx.clearRect(0, 0, width, height);

  const rulerRight = width - rightInset;

  ctx.fillStyle = background;
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
  ctx.strokeStyle = tickStroke;

  const stepPx = getRulerStep(viewport.zoom) * viewport.zoom;
  const topGuideTick =
    highlightedGuide?.axis === 'x' ? getHighlightedRulerTick(highlightedGuide.worldPosition, viewport.x, viewport.zoom, origin.x) : null;
  const leftGuideTick =
    highlightedGuide?.axis === 'y' ? getHighlightedRulerTick(highlightedGuide.worldPosition, viewport.y, viewport.zoom, origin.y) : null;

  getRulerTicks(rulerRight, viewport.x, viewport.zoom, origin.x).forEach((tick) => {
    const style = bandLabelFill(topBand, tick.screenPos, stepPx, textFill, frameExtentTickFill);
    const guideFade = topGuideTick ? labelFade(Math.abs(tick.screenPos - topGuideTick.screenPos), stepPx) : 1;

    if (style !== null && guideFade !== null) {
      ctx.fillStyle = style.fill;
      ctx.globalAlpha = style.alpha * guideFade;
      paintTopTick(ctx, tick, leftInset);
    }
  });
  getRulerTicks(height, viewport.y, viewport.zoom, origin.y).forEach((tick) => {
    const style = bandLabelFill(leftBand, tick.screenPos, stepPx, textFill, frameExtentTickFill);
    const guideFade = leftGuideTick ? labelFade(Math.abs(tick.screenPos - leftGuideTick.screenPos), stepPx) : 1;

    if (style !== null && guideFade !== null) {
      ctx.fillStyle = style.fill;
      ctx.globalAlpha = style.alpha * guideFade;
      paintLeftTick(ctx, tick, leftInset);
    }
  });

  ctx.globalAlpha = 1;

  if (topBand?.edges) {
    paintTopBandEdges(ctx, topBand, leftInset, rulerRight, topGuideTick?.screenPos ?? null, stepPx);
  }

  if (leftBand?.edges) {
    paintLeftBandEdges(ctx, leftBand, leftInset, height, leftGuideTick?.screenPos ?? null, stepPx);
  }

  if (topGuideTick) {
    paintHighlightedTopTick(ctx, topGuideTick, leftInset);
  } else if (leftGuideTick) {
    paintHighlightedLeftTick(ctx, leftGuideTick, leftInset);
  }
};
