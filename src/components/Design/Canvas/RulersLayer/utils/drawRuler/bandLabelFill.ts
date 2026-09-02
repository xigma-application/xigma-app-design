// others
import { RULER_FRAME_EXTENT_TICK_FILL, RULER_TEXT_FILL } from 'constant/canvas';

// types
import type { TRulerBand } from '../getRulerBands';

// utils
import { labelFade } from './labelFade';

export type TBandLabelStyle = {
  alpha: number;
  fill: string;
};

export const bandLabelFill = (band: TRulerBand | null, screenPos: number, stepPx: number): TBandLabelStyle | null => {
  if (!band?.edges) {
    return { alpha: 1, fill: RULER_TEXT_FILL };
  }

  const inBand = screenPos >= band.fromPx && screenPos <= band.toPx;
  const fill = inBand ? RULER_FRAME_EXTENT_TICK_FILL : RULER_TEXT_FILL;
  const distToEdge = Math.min(Math.abs(screenPos - band.fromPx), Math.abs(screenPos - band.toPx));
  const alpha = labelFade(distToEdge, stepPx);

  return alpha === null ? null : { alpha, fill };
};
