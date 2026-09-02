// others
import { GUIDE_STROKE } from 'constant/canvas';
import { HIGHLIGHT_TEXT_COLOR, HIGHLIGHT_TEXT_GAP_PX, RULER_SIZE_PX } from '../../constants';

// types
import type { TRulerTick } from '../getRulerTicks';

export const paintHighlightedLeftTick = (ctx: CanvasRenderingContext2D, tick: TRulerTick, leftInset: number): void => {
  if (tick.screenPos >= RULER_SIZE_PX) {
    ctx.strokeStyle = GUIDE_STROKE;
    ctx.beginPath();
    ctx.moveTo(leftInset, tick.screenPos);
    ctx.lineTo(leftInset + RULER_SIZE_PX, tick.screenPos);
    ctx.stroke();

    ctx.fillStyle = HIGHLIGHT_TEXT_COLOR;
    ctx.textAlign = 'left';
    ctx.save();
    ctx.translate(leftInset + RULER_SIZE_PX / 2, tick.screenPos);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(tick.label, HIGHLIGHT_TEXT_GAP_PX, 0);
    ctx.restore();
  }
};
