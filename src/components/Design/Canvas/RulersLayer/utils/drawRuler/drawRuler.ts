// others
import { RULER_BACKGROUND, RULER_FRAME_EXTENT_TICK_FILL, RULER_TEXT_FILL, RULER_TICK_STROKE } from 'constant/canvas';
import { RULER_FONT } from '../../constants';

// types
import { TViewport } from 'types/design/types';
import { THighlightedRulerGuide } from '../getHighlightedRulerGuide';
import type { TRulerBand } from '../getRulerBands';

// utils
import { getHighlightedRulerTick, getRulerTicks } from '../getRulerTicks';
import { getRulerStep } from '../getRulerStep';
import { paintHighlightedLeftTick } from './paintHighlightedLeftTick';
import { paintHighlightedTopTick } from './paintHighlightedTopTick';
import { paintLeftBand } from './paintLeftBand';
import { paintLeftBandEdges } from './paintLeftBandEdges';
import { paintLeftTicks } from './paintLeftTicks';
import { paintRulerBackground } from './paintRulerBackground';
import { paintTopBand } from './paintTopBand';
import { paintTopBandEdges } from './paintTopBandEdges';
import { paintTopTicks } from './paintTopTicks';

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
  const rulerRight = width - rightInset;

  paintRulerBackground(ctx, background, width, height, leftInset, rulerRight);

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

  paintTopTicks(
    ctx,
    getRulerTicks(rulerRight, viewport.x, viewport.zoom, origin.x),
    topBand,
    topGuideTick,
    leftInset,
    stepPx,
    textFill,
    frameExtentTickFill,
  );
  paintLeftTicks(
    ctx,
    getRulerTicks(height, viewport.y, viewport.zoom, origin.y),
    leftBand,
    leftGuideTick,
    leftInset,
    stepPx,
    textFill,
    frameExtentTickFill,
  );

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
