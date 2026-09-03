// types
import type { TRulerBand } from '../getRulerBands';
import type { TRulerTick } from '../getRulerTicks';

// utils
import { bandLabelFill } from './bandLabelFill';
import { labelFade } from './labelFade';
import { paintLeftTick } from './paintLeftTick';

export const paintLeftTicks = (
  ctx: CanvasRenderingContext2D,
  ticks: TRulerTick[],
  leftBand: TRulerBand | null,
  leftGuideTick: TRulerTick | null,
  leftInset: number,
  stepPx: number,
  textFill: string,
  frameExtentTickFill: string,
): void => {
  ticks.forEach((tick) => {
    const style = bandLabelFill(leftBand, tick.screenPos, stepPx, textFill, frameExtentTickFill);
    const guideFade = leftGuideTick ? labelFade(Math.abs(tick.screenPos - leftGuideTick.screenPos), stepPx) : 1;

    if (style !== null && guideFade !== null) {
      ctx.fillStyle = style.fill;
      ctx.globalAlpha = style.alpha * guideFade;
      paintLeftTick(ctx, tick, leftInset);
    }
  });
};
