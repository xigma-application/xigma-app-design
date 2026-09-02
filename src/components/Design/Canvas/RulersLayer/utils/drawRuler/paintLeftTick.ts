// others
import { RULER_SIZE_PX, RULER_TICK_LENGTH_PX } from '../../constants';

// types
import type { TRulerTick } from '../getRulerTicks';

// utils
import { crisp } from './crisp';

export const paintLeftTick = (ctx: CanvasRenderingContext2D, { label, screenPos }: TRulerTick, leftInset: number): void => {
  if (screenPos >= RULER_SIZE_PX) {
    const x = leftInset + RULER_SIZE_PX;

    ctx.beginPath();
    ctx.moveTo(x, crisp(screenPos));
    ctx.lineTo(x - RULER_TICK_LENGTH_PX, crisp(screenPos));
    ctx.stroke();
    ctx.save();
    ctx.translate(x - RULER_SIZE_PX / 2, screenPos);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(label, 0, 0);
    ctx.restore();
  }
};
