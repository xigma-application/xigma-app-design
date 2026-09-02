// others
import { RULER_SIZE_PX } from '../../constants';

// types
import type { TRulerBand } from '../getRulerBands';

export const paintLeftBand = (ctx: CanvasRenderingContext2D, band: TRulerBand, leftInset: number, height: number): void => {
  const from = Math.max(band.fromPx, RULER_SIZE_PX);
  const to = Math.min(band.toPx, height);

  if (to > from) {
    ctx.fillStyle = band.fill;
    ctx.fillRect(leftInset, from, RULER_SIZE_PX, to - from);
  }
};
