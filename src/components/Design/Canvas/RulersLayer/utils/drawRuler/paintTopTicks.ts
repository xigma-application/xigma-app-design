// types
import type { TRulerBand } from '../getRulerBands';
import type { TRulerTick } from '../getRulerTicks';

// utils
import { bandLabelFill } from './bandLabelFill';
import { labelFade } from './labelFade';
import { paintTopTick } from './paintTopTick';

export const paintTopTicks = (
  ctx: CanvasRenderingContext2D,
  ticks: TRulerTick[],
  topBand: TRulerBand | null,
  topGuideTick: TRulerTick | null,
  leftInset: number,
  stepPx: number,
  textFill: string,
  frameExtentTickFill: string,
): void => {
  ticks.forEach((tick) => {
    const style = bandLabelFill(topBand, tick.screenPos, stepPx, textFill, frameExtentTickFill);
    const guideFade = topGuideTick ? labelFade(Math.abs(tick.screenPos - topGuideTick.screenPos), stepPx) : 1;

    if (style !== null && guideFade !== null) {
      ctx.fillStyle = style.fill;
      ctx.globalAlpha = style.alpha * guideFade;
      paintTopTick(ctx, tick, leftInset);
    }
  });
};
