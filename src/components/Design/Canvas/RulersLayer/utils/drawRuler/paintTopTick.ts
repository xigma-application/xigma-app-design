// others
import { RULER_SIZE_PX, RULER_TICK_LENGTH_PX } from '../../constants';

// types
import type { TRulerTick } from '../getRulerTicks';

// utils
import { crisp } from './crisp';

export const paintTopTick = (ctx: CanvasRenderingContext2D, { label, screenPos }: TRulerTick, leftInset: number): void => {
  if (screenPos >= leftInset + RULER_SIZE_PX) {
    ctx.beginPath();
    ctx.moveTo(crisp(screenPos), RULER_SIZE_PX);
    ctx.lineTo(crisp(screenPos), RULER_SIZE_PX - RULER_TICK_LENGTH_PX);
    ctx.stroke();
    ctx.fillText(label, screenPos, RULER_SIZE_PX / 2);
  }
};
