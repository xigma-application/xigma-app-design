// others
import { RULER_FRAME_EXTENT_TICK_FILL, RULER_TEXT_FILL } from 'constant/canvas';

// types
import type { TRulerBand } from '../getRulerBands';

export type TBandLabelStyle = {
  alpha: number;
  fill: string;
};

const FADE_START_STEPS = 1.5;
const FADE_END_STEPS = 0.375;

export const bandLabelFill = (band: TRulerBand | null, screenPos: number, stepPx: number): TBandLabelStyle | null => {
  if (!band?.edges) {
    return { alpha: 1, fill: RULER_TEXT_FILL };
  }

  const inBand = screenPos >= band.fromPx && screenPos <= band.toPx;
  const fill = inBand ? RULER_FRAME_EXTENT_TICK_FILL : RULER_TEXT_FILL;

  const distToEdge = Math.min(Math.abs(screenPos - band.fromPx), Math.abs(screenPos - band.toPx));
  const fadeEnd = stepPx * FADE_END_STEPS;
  const fadeStart = stepPx * FADE_START_STEPS;

  if (distToEdge <= fadeEnd) {
    return null;
  }

  const alpha = distToEdge >= fadeStart ? 1 : (distToEdge - fadeEnd) / (fadeStart - fadeEnd);

  return { alpha, fill };
};
