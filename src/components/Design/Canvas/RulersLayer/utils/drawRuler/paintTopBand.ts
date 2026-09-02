// others
import { RULER_SIZE_PX } from '../../constants';

// types
import type { TRulerBand } from '../getRulerBands';

export const paintTopBand = (ctx: CanvasRenderingContext2D, band: TRulerBand, leftInset: number, rulerRight: number): void => {
  const from = Math.max(band.fromPx, leftInset + RULER_SIZE_PX);
  const to = Math.min(band.toPx, rulerRight);

  if (to > from) {
    ctx.fillStyle = band.fill;
    ctx.fillRect(from, 0, to - from, RULER_SIZE_PX);
  }
};
