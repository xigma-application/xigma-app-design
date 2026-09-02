// others
import { GUIDE_STROKE } from 'constant/canvas';
import { HIGHLIGHT_TEXT_COLOR, HIGHLIGHT_TEXT_GAP_PX, RULER_SIZE_PX } from '../../constants';

// types
import type { TRulerTick } from '../getRulerTicks';

export const paintHighlightedTopTick = (ctx: CanvasRenderingContext2D, tick: TRulerTick, leftInset: number): void => {
  if (tick.screenPos >= leftInset + RULER_SIZE_PX) {
    ctx.strokeStyle = GUIDE_STROKE;
    ctx.beginPath();
    ctx.moveTo(tick.screenPos, 0);
    ctx.lineTo(tick.screenPos, RULER_SIZE_PX);
    ctx.stroke();

    ctx.fillStyle = HIGHLIGHT_TEXT_COLOR;
    ctx.textAlign = 'left';
    ctx.fillText(tick.label, tick.screenPos + HIGHLIGHT_TEXT_GAP_PX, RULER_SIZE_PX / 2);
  }
};
